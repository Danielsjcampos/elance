import { supabase } from '../lib/supabase';
import { emailFlowService } from './emailFlowService';

export interface LeadData {
    name: string;
    email: string;
    phone: string;
    source: string;
    notes?: string;
    tags?: string[];
    franchise_id?: string;
    franchise_unit_id?: string; // Kept for emailFlowService
}

export const leadService = {
    async captureLead(data: LeadData) {
        try {
            console.log('Capturing lead:', data);
            
            // 1. Save to 'leads' table
            // We don't use .select().single() because RLS policies for anonymous users
            // often allow INSERT but not SELECT, which would cause an error even if insert succeeded.
            const { error: leadError } = await supabase
                .from('leads')
                .insert([{
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    source: data.source,
                    status: 'new',
                    notes: data.notes || '',
                    franchise_id: data.franchise_id || data.franchise_unit_id
                }]);

            if (leadError) {
                console.error('Supabase Lead Insert Error:', leadError);
                throw leadError;
            }

            // 2. Sync to email marketing (centralized sync)
            try {
                await emailFlowService.syncContact({
                    email: data.email,
                    nome: data.name,
                    telefone: data.phone,
                    origem: data.source,
                    interesses: data.tags || [],
                    franchise_unit_id: data.franchise_unit_id || data.franchise_id
                });
            } catch (syncError) {
                console.warn('Non-blocking error syncing to email marketing:', syncError);
            }

            return { success: true };
        } catch (error) {
            console.error('Error in leadService.captureLead:', error);
            throw error;
        }
    }
};
