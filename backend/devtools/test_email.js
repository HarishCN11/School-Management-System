const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/\s+/g, ''), // Strip spaces for safety
    },
});

async function verify() {
    try {
        await transporter.verify();
        console.log("SMTP Connection Successful!");

        // Try sending
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.SMTP_USER, // Send to self
            subject: "Test Email",
            text: "This is a test email to verify configuration."
        });
        console.log("Test Email Sent Successfully!");
    } catch (err) {
        console.error("SMTP Error:", err);
    }
}

verify();
