
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to, subject, html, config } = req.body;

    if (!to || !subject || !html || !config) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // --- ENVIO VIA BREVO (API) ---
        if (config.provider === 'brevo') {
            if (!config.brevo_key) {
                return res.status(400).json({ error: 'Chave API da Brevo não configurada.' });
            }

            const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': config.brevo_key,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: config.sender_name || 'Elance System',
                        email: config.sender_email || 'nao-responda@seudominio.com'
                    },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: html
                })
            });

            const brevoData = await brevoResponse.json();

            if (!brevoResponse.ok) {
                console.error('Brevo Error:', brevoData);
                throw new Error(brevoData.message || 'Erro ao enviar via Brevo');
            }

            console.log("Brevo Message sent: %s", brevoData.messageId);
            return res.status(200).json({ success: true, messageId: brevoData.messageId, provider: 'brevo' });
        }

        // --- ENVIO VIA SMTP (PADRÃO) ---
        const host = config.host ? config.host.trim() : '';
        const port = Number(config.port);

        // Create reusable transporter object using the default SMTP transport
        // Create reusable transporter object using the default SMTP transport
        // Implementando recomendações para melhor estabilidade em serverless
        let transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: config.secure === undefined ? port === 465 : config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
            // Pooling ajuda a evitar handshakes repetidos e erros de conexão em alguns cenários
            pool: true,
            maxConnections: 1,
            maxMessages: 5,
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verificar conexão antes de enviar
        await transporter.verify();

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"${config.sender_name}" <${config.sender_email}>`,
            to: to,
            subject: subject,
            html: html,
        });

        console.log("SMTP Message sent: %s", info.messageId);
        return res.status(200).json({ success: true, messageId: info.messageId, provider: 'smtp' });

    } catch (error) {
        console.error('Email Send Error:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}
