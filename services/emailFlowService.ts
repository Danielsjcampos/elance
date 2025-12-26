import { supabase } from '../lib/supabase';
import { sendEmail } from './emailService';

export interface EmailContact {
    id: string;
    nome: string;
    email: string;
    interesses?: string[];
    status: 'ativo' | 'inativo' | 'descadastrado';
}

export interface EmailTemplate {
    id: string;
    assunto: string;
    corpo_html: string;
    corpo_texto?: string;
}

export const emailFlowService = {
    /**
     * Replaces variables like {{nome}} in the template with contact data.
     */
    renderTemplate(content: string, vars: Record<string, string>): string {
        let rendered = content;
        for (const [key, value] of Object.entries(vars)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, value || '');
        }
        return rendered;
    },

    /**
     * Checks if a contact matches a set of segment rules.
     */
    matchesSegment(contact: EmailContact, rules: any): boolean {
        // Simplified rule evaluation:
        // rules = { interests: ['imovel'], status: 'ativo' }
        if (rules.status && contact.status !== rules.status) return false;

        if (rules.interests && rules.interests.length > 0) {
            const contactInterests = contact.interesses || [];
            const hasMatch = rules.interests.some((i: string) => contactInterests.includes(i));
            if (!hasMatch) return false;
        }

        return true;
    },

    /**
     * Adds an email to the queue for a specific contact and template.
     */
    async addToQueue(contactId: string, templateId: string, options: { fluxoId?: string, stepId?: string, scheduledFor?: Date } = {}) {
        const { data, error } = await supabase
            .from('email_queue')
            .insert({
                contato_id: contactId,
                template_id: templateId,
                fluxo_id: options.fluxoId,
                step_id: options.stepId,
                scheduled_for: options.scheduledFor || new Date(),
                status: 'pendente'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Processes the pending email queue.
     * This would typically be called by a cron job or a background worker.
     */
    async processQueue(batchSize: number = 20) {
        console.log(`Starting queue processing. Batch size: ${batchSize}`);

        const { data: queueItems, error } = await supabase
            .from('email_queue')
            .select(`
                *,
                contact:email_contacts(*),
                template:email_templates(*)
            `)
            .eq('status', 'pendente')
            .lte('scheduled_for', new Date().toISOString())
            .limit(batchSize);

        if (error) throw error;
        if (!queueItems || queueItems.length === 0) {
            console.log('No pending emails in queue.');
            return [];
        }

        console.log(`Found ${queueItems.length} emails to process.`);
        const results = [];

        for (const [index, item] of queueItems.entries()) {
            try {
                // Throttling: Wait 2 seconds between emails to respect SMTP limits
                if (index > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                const contact = item.contact;
                const template = item.template;

                if (!contact || contact.status === 'descadastrado') {
                    await supabase.from('email_queue').update({ status: 'cancelado', erro_log: 'Contact unsubscribed or missing' }).eq('id', item.id);
                    continue;
                }

                // Render content
                const html = this.renderTemplate(template.corpo_html, {
                    nome: contact.nome,
                    email: contact.email,
                    // Add other common variables here
                });

                // Tracking and Unsubscribe
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                let trackHtml = html;

                if (baseUrl) {
                    // 1. Add Open Tracking Pixel
                    trackHtml += `<img src="${baseUrl}/api/email/track?type=open&queueId=${item.id}" width="1" height="1" style="display:none" />`;

                    // 2. Track Clicks (Simple link wrapper)
                    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi;
                    trackHtml = trackHtml.replace(linkRegex, (match, originalUrl) => {
                        if (originalUrl.startsWith('http') && !originalUrl.includes('/api/email/')) {
                            const trackUrl = `${baseUrl}/api/email/track?type=click&queueId=${item.id}&url=${encodeURIComponent(originalUrl)}`;
                            return match.replace(originalUrl, trackUrl);
                        }
                        return match;
                    });

                    // 3. Add Unsubscribe Footer
                    trackHtml += `
                        <div style="font-size: 11px; color: #999; margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; font-family: sans-serif;">
                            <p>Este e-mail foi enviado por E-Lance.</p>
                            <p>Para não receber mais este tipo de conteúdo, <a href="${baseUrl}/api/email/unsubscribe?contactId=${contact.id}" style="color: #3a7ad1; text-decoration: underline;">clique aqui para se descadastrar</a>.</p>
                        </div>
                    `;
                }

                // 4. Fetch SMTP Config for this franchise
                const { data: franchise } = await supabase
                    .from('franchise_units')
                    .select('smtp_config')
                    .eq('id', contact.franchise_unit_id)
                    .single();

                if (!franchise?.smtp_config) {
                    throw new Error('SMTP Configuration not found for this franchise.');
                }

                // Send email
                await sendEmail({
                    to: contact.email,
                    subject: template.assunto,
                    html: trackHtml,
                    smtpConfig: franchise.smtp_config
                });

                // Update queue status
                await supabase.from('email_queue').update({
                    status: 'enviado',
                    sent_at: new Date().toISOString()
                }).eq('id', item.id);

                console.log(`Email ${item.id} sent successfully.`);
                results.push({ id: item.id, status: 'success' });

            } catch (err: any) {
                console.error(`Error processing email queue item ${item.id}:`, err);
                await supabase.from('email_queue').update({
                    status: 'erro',
                    tentativas: item.tentativas + 1,
                    erro_log: err.message
                }).eq('id', item.id);

                results.push({ id: item.id, status: 'error', error: err.message });
            }
        }

        return results;
    },

    /**
     * Synchronizes a single contact (lead or client) to the email_contacts table.
     */
    async syncContact(contactData: {
        email: string;
        nome: string;
        telefone?: string;
        origem?: string;
        interesses?: string[];
        franchise_unit_id?: string;
    }) {
        const { error } = await supabase
            .from('email_contacts')
            .upsert({
                email: contactData.email,
                nome: contactData.nome,
                telefone: contactData.telefone,
                origem: contactData.origem || 'crm_sync',
                interesses: contactData.interesses || [],
                franchise_unit_id: contactData.franchise_unit_id,
                status: 'ativo',
                ultima_interacao: new Date().toISOString()
            }, { onConflict: 'email' });

        if (error) {
            console.error('Error syncing contact:', error);
            throw error;
        }
    }
};
