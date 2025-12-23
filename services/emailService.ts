import { supabase } from '../lib/supabase';

interface SmtpConfig {
    host: string;
    port: string;
    user: string;
    pass: string;
    secure: boolean;
    sender_name: string;
    sender_email: string;
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    smtpConfig?: SmtpConfig;
}

export const sendEmail = async ({ to, subject, html, smtpConfig }: EmailOptions) => {
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

        // 2. Call the backend API
        const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to,
                subject,
                html,
                config
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send email');
        }

        return result;

    } catch (error: any) {
        console.error('Email Service Error:', error);
        throw error;
    }
};
