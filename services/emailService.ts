import { supabase } from '../lib/supabase';

interface SmtpConfig {
    host: string;
    port: string;
    user: string;
    pass: string;
    secure: boolean;
    sender_name: string;
    sender_email: string;
    provider?: 'smtp' | 'brevo';
    brevo_key?: string;
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    smtpConfig?: SmtpConfig;
    contactId?: string;
}

export const sendEmail = async ({ to, subject, html, smtpConfig, contactId }: EmailOptions) => {
    try {
        let config = smtpConfig;

        // If no config provided, fetch from DB
        if (!config) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data: profile } = await supabase
                .from('profiles')
                .select('franchise_unit_id')
                .eq('id', user.id)
                .single();

            if (!profile?.franchise_unit_id) throw new Error('Franchise not found');

            const { data: franchise } = await supabase
                .from('franchise_units')
                .select('smtp_config')
                .eq('id', profile.franchise_unit_id)
                .single();

            if (!franchise?.smtp_config) {
                throw new Error('SMTP Configuration not found. Please configure it in Settings.');
            }
            config = franchise.smtp_config;
        }

        // 2. Add Unsubscribe Footer if not present
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        let finalHtml = html;
        if (baseUrl && !html.includes('api/email/unsubscribe')) {
            const unsubUrl = `${baseUrl}/api/email/unsubscribe${contactId ? `?contactId=${contactId}` : ''}`;
            finalHtml += `
                <div style="font-size: 11px; color: #999; margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; font-family: sans-serif;">
                    <p>Este e-mail foi enviado por E-Lance.</p>
                    <p>Para não receber mais este tipo de conteúdo, <a href="${unsubUrl}" style="color: #3a7ad1; text-decoration: underline;">clique aqui para se descadastrar</a>.</p>
                </div>
            `;
        }

        // 3. Call the backend API
        // Em produção ou usando 'vercel dev', o path /api/email/send funciona nativamente
        // localmente sem vercel cli, ele tentará o proxy configurado no vite.config.ts
        const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to,
                subject,
                html: finalHtml,
                config
            }),
        });

        let result;
        const text = await response.text();
        try {
            result = text ? JSON.parse(text) : {};
        } catch (e) {
            throw new Error(`Erro de resposta do servidor (não JSON): ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
            // Tenta extrair detalhes se existirem
            const errorMsg = result.details || result.error || 'Erro desconhecido ao enviar.';
            throw new Error(`Falha no envio (${response.status}): ${errorMsg}`);
        }

        return result;

    } catch (error: any) {
        console.error('Email Service Error:', error);
        throw error;
    }
};
