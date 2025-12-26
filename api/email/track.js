import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    const { type, queueId, url } = req.query;

    if (!queueId) {
        return res.status(400).send('Invalid Link');
    }

    try {
        // Log the interaction
        if (type === 'open') {
            await supabase.from('email_logs').insert({
                queue_id: queueId,
                action: 'open',
                user_agent: req.headers['user-agent'],
                ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });

            // Return a transparent 1x1 GIF
            const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
            res.setHeader('Content-Type', 'image/gif');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(200).send(buffer);
        }

        if (type === 'click' && url) {
            await supabase.from('email_logs').insert({
                queue_id: queueId,
                action: 'click',
                user_agent: req.headers['user-agent'],
                ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                meta: { url }
            });

            // Redirect to original URL
            return res.redirect(302, url);
        }

        return res.status(404).send('Not Found');

    } catch (error) {
        console.error('Tracking Error:', error);
        if (url) return res.redirect(302, url); // Still redirect on error if possible
        return res.status(500).send('Internal Server Error');
    }
}
