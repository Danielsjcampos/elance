import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/email/send', async (req, res) => {
    try {
        const { to, subject, html, config } = req.body;

        // --- BREVO HANDLING ---
        if (config && config.provider === 'brevo') {
            if (!config.brevo_key) return res.status(400).json({ error: 'Missing Brevo API Key' });

            const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': config.brevo_key,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: config.sender_name || 'System',
                        email: config.sender_email || 'noreply@tudosobreleilao.com'
                    },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: html
                })
            });
            const data = await brevoResponse.json();
            if (!brevoResponse.ok) throw new Error(data.message || 'Brevo Error');

            console.log('Brevo Message Sent:', data.messageId);
            return res.json({ success: true, messageId: data.messageId });
        }

        // --- SMTP HANDLING ---
        if (!config || !config.host || !config.port) {
            return res.status(400).json({ error: 'Missing SMTP configuration' });
        }

        const host = config.host.trim();
        const port = parseInt(config.port);
        console.log(`Connecting to SMTP: ${host}:${port} (user: ${config.user})`);

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: config.secure === undefined ? port === 465 : config.secure, // Auto-detect secure for 465
            auth: config.user ? {
                user: config.user,
                pass: config.pass,
            } : undefined,
            tls: {
                rejectUnauthorized: false // For local dev often needed
            }
        });

        // Send mail
        const info = await transporter.sendMail({
            from: config.sender_email ? `"${config.sender_name || ''}" <${config.sender_email}>` : '"System" <no-reply@test.com>',
            to,
            subject,
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        res.json({ success: true, messageId: info.messageId });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`📨 Email API Server running on port ${PORT}`);
});
