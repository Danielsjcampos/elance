import { supabase } from '../lib/supabase';

interface SmtpConfig {
    host: string;
    port: string;
    user: string;
    pass: string;
    secure: boolean;
    sender_name: string;
    sender_email: string;
    provider?: 'smtp' | 'brevo' | 'php';
    brevo_key?: string;
    php_url?: string;
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

        // --- ENVIO VIA PHP BRIDGE (MÉTODO ÚNICO E OFICIAL) ---

        let phpUrl = config.php_url;

        // Se não tiver URL configurada no objeto, tentar descobrir ou usar fallback
        if (!phpUrl) {
            throw new Error('CONFIG_ERROR: URL do PHP Bridge não configurada. Vá em Configurações > Email e defina a URL do script send.php.');
        }

        // Preparar payload para o PHP
        const payload = {
            to,
            subject,
            html: finalHtml,
            config: {
                host: config.host,
                port: config.port,
                user: config.user,
                pass: config.pass,
                sender_name: config.sender_name,
                sender_email: config.sender_email
            }
        };

        const response = await fetch(phpUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Tentar parsear resposta
        const textResult = await response.text();
        let jsonResult;
        try {
            jsonResult = JSON.parse(textResult);
        } catch (e) {
            throw new Error(`PHP Error (Invalid JSON): ${textResult.substring(0, 200)}...`);
        }

        if (!response.ok || !jsonResult.success) {
            throw new Error(jsonResult.error || 'Erro desconhecido no PHP Bridge');
        }

        return jsonResult;

    } catch (error: any) {
        console.error('Email Service Error:', error);
        throw error;
    }
};
