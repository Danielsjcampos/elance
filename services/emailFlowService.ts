import { supabase } from '../lib/supabase';
import { sendEmail } from './emailService';

export interface EmailContact {
    id: string;
    nome: string;
    email: string;
    interesses?: string[];
    status: 'ativo' | 'inativo' | 'descadastrado';
    origem?: string;
    telefone?: string;
    franchise_unit_id?: string;
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
        if (!rules) return true; // Sem regras = todos

        // Status Check
        if (rules.status && contact.status !== rules.status) return false;

        // Interests Check
        if (rules.interests && rules.interests.length > 0) {
            const contactInterests = contact.interesses || [];
            if (contactInterests.length === 0) return false; // Se exige interesse e contato não tem nenhum
            const hasMatch = rules.interests.some((i: string) => contactInterests.includes(i));
            if (!hasMatch) return false;
        }

        // Origin Check
        if (rules.origem && contact.origem !== rules.origem) return false;

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

                // Advance Flow
                if (item.fluxo_id) {
                    await this.advanceFlow(item);
                }

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
     * Synchronizes a single contact and triggers automation flows.
     */
    async syncContact(contactData: {
        email: string;
        nome: string;
        telefone?: string;
        origem?: string;
        interesses?: string[];
        franchise_unit_id?: string;
    }) {
        // 1. Upsert Contact
        const { data: contact, error } = await supabase
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
            }, { onConflict: 'email' })
            .select()
            .single();

        if (error) {
            console.error('Error syncing contact:', error);
            throw error;
        }

        // 2. Evaluate Segments & Trigger Flows
        if (contact) {
            await this.evaluateSegmentsAndTriggerFlows(contact);
        }
    },

    /**
     * Evaluates all segments for a contact and starts relevant flows.
     */
    async evaluateSegmentsAndTriggerFlows(contact: any) {
        // Fetch active segments for this franchise
        const { data: segments } = await supabase
            .from('email_segments')
            .select('*')
            .eq('ativo', true)
            .eq('franchise_unit_id', contact.franchise_unit_id);

        if (!segments) return;

        for (const segment of segments) {
            if (this.matchesSegment(contact, segment.regras)) {
                // Determine if we should start a flow
                await this.triggerFlowsForSegment(contact.id, segment.id, contact.franchise_unit_id);
            }
        }
    },

    async triggerFlowsForSegment(contactId: string, segmentId: string, franchiseId: string) {
        // Find active automatic flows for this segment
        const { data: flows } = await supabase
            .from('email_flows')
            .select('*, steps:email_flow_steps(*)')
            .eq('segmento_id', segmentId)
            .eq('tipo', 'automatico')
            .eq('ativo', true)
            .eq('franchise_unit_id', franchiseId);

        if (!flows) return;

        for (const flow of flows) {
            // Check if contact is already in this flow (prevent duplicates)
            const { data: existing } = await supabase
                .from('email_queue')
                .select('id')
                .eq('contato_id', contactId)
                .eq('fluxo_id', flow.id)
                .limit(1);

            if (existing && existing.length > 0) continue; // Already in flow

            // Start Flow: Schedule 1st Step
            if (flow.steps && flow.steps.length > 0) {
                // Sort steps by order
                const sortedSteps = flow.steps.sort((a: any, b: any) => a.ordem - b.ordem);
                const firstStep = sortedSteps[0];

                // Calculate schedule time
                const scheduledDate = new Date();
                scheduledDate.setHours(scheduledDate.getHours() + (firstStep.delay_em_horas || 0));

                await this.addToQueue(contactId, firstStep.template_id, {
                    fluxoId: flow.id,
                    stepId: firstStep.id,
                    scheduledFor: scheduledDate
                });

                console.log(`Started Flow "${flow.nome_fluxo}" for contact ${contactId}`);
            }
        }
    },

    /**
     * Advances a flow to the next step after a successful send.
     */
    async advanceFlow(queueItem: any) {
        if (!queueItem.fluxo_id || !queueItem.step_id) return;

        // Find current step order
        const { data: currentStep } = await supabase
            .from('email_flow_steps')
            .select('ordem')
            .eq('id', queueItem.step_id)
            .single();

        if (!currentStep) return;

        // Find next step
        const { data: nextStep } = await supabase
            .from('email_flow_steps')
            .select('*')
            .eq('fluxo_id', queueItem.fluxo_id)
            .gt('ordem', currentStep.ordem)
            .order('ordem', { ascending: true })
            .limit(1)
            .single();

        if (nextStep) {
            // Schedule next step
            const scheduledDate = new Date();
            scheduledDate.setHours(scheduledDate.getHours() + (nextStep.delay_em_horas || 0));

            await this.addToQueue(queueItem.contato_id, nextStep.template_id, {
                fluxoId: queueItem.fluxo_id,
                stepId: nextStep.id,
                scheduledFor: scheduledDate
            });
            console.log(`Advanced Flow to Step ${nextStep.ordem}`);
        } else {
            console.log(`Flow ${queueItem.fluxo_id} completed for contact.`);
        }
    }
};
