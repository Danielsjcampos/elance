import { supabase } from '../lib/supabase';

interface EmailConfig {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailConfig) => {
    try {
        // 1. Fetch SMTP settings from DB (franchise_units)
        // We need the current user's franchise_id to fetch the correct settings.
        // For simplicity, we'll fetch the profile then the unit.
        // Optimization: Pass these down or cache them.

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
                config: franchise.smtp_config
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
