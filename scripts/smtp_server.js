const SMTPServer = require('smtp-server').SMTPServer;
const simpleParser = require('mailparser').simpleParser;

const server = new SMTPServer({
    // Disable authentication for testing
    onAuth(auth, session, callback) {
        return callback(null, { user: auth.username });
    },

    // Handle incoming data
    onData(stream, session, callback) {
        simpleParser(stream, {}, (err, parsed) => {
            if (err) console.log('Error parsing email:', err);

            console.log('--------------------------------------------------');
            console.log('📧  EMAIL RECEIVED');
            console.log(`From: ${parsed.from.text}`);
            console.log(`To: ${parsed.to.text}`);
            console.log(`Subject: ${parsed.subject}`);
            console.log('--- Body ---');
            console.log(parsed.text || parsed.html); // Prefer text for console, or html
            console.log('--------------------------------------------------');

            // stream.pipe(process.stdout); // Log raw if needed
        });

        stream.on('end', callback);
    }
});

server.listen(2525, () => {
    console.log('🚀 Local SMTP Server running on port 2525');
    console.log('Configure your app to use: Host: localhost, Port: 2525');
});
