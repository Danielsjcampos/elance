import { supabase } from '../lib/supabase';
import { emailFlowService } from './emailFlowService';

export interface LeadData {
    name: string;
    email: string;
    phone: string;
    source: string;
    notes?: string;
    tags?: string[];
    franchise_unit_id?: string;
}

export const leadService = {
    async captureLead(data: LeadData) {
        try {
            // 1. Save to 'leads' table
            const { data: lead, error: leadError } = await supabase
                .from('leads')
                .insert([{
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    source: data.source,
                    status: 'new',
                    notes: data.notes || '',
                    tags: data.tags || [],
                    franchise_unit_id: data.franchise_unit_id
                }])
                .select()
                .single();

            if (leadError) throw leadError;

            // 2. Sync to email marketing (centralized sync)
            try {
                await emailFlowService.syncContact({
                    email: data.email,
                    nome: data.name,
                    telefone: data.phone,
                    origem: data.source,
                    interesses: data.tags || [],
                    franchise_unit_id: data.franchise_unit_id
                });
            } catch (syncError) {
                console.error('Error syncing lead to email marketing:', syncError);
                // Non-blocking error
            }

            return lead;
        } catch (error) {
            console.error('Error in leadService.captureLead:', error);
            throw error;
        }
    }
};
