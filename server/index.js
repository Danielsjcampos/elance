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

        if (!config || !config.host || !config.port) {
            return res.status(400).json({ error: 'Missing SMTP configuration' });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: parseInt(config.port),
            secure: config.secure || false, // true for 465, false for other ports
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
