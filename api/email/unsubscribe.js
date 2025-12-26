import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    const { contactId } = req.query;

    if (!contactId) {
        return res.status(400).send('Invalid Link');
    }

    try {
        const { error } = await supabase
            .from('email_contacts')
            .update({
                status: 'descadastrado',
                unsubscribed_at: new Date().toISOString()
            })
            .eq('id', contactId);

        if (error) throw error;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>Descadastrado com sucesso</h1>
                <p>Você não receberá mais nossos informativos por e-mail.</p>
                <p>Caso queira voltar a receber, entre em contato conosco.</p>
            </div>
        `);

    } catch (error) {
        console.error('Unsubscribe Error:', error);
        return res.status(500).send('Internal Server Error');
    }
}
