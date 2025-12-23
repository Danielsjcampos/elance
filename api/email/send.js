
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
        // Create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: config.host,
            port: Number(config.port),
            secure: config.secure, // true for 465, false for other ports
            auth: {
                user: config.user,
                pass: config.pass,
            },
            tls: {
                rejectUnauthorized: false // Helps with self-signed certs or some hosting issues, though less secure ideally
            }
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"${config.sender_name}" <${config.sender_email}>`, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return res.status(200).json({ success: true, messageId: info.messageId });

    } catch (error) {
        console.error('SMTP Error:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}
