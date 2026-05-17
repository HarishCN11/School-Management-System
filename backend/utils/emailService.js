const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Development Mode: Log email to console if no SMTP credentials or just for visibility
    console.log('=================================================');
    console.log('📧 EMAIL SIMULATION (Since local SMTP might not be set)');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('=================================================');

    // If SMTP is not configured, we stop here to prevent crashing
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes('your-email')) {
        console.log('⚠️ SMTP not configured in .env. Email logged to console above.');
        return;
    }

    // 1) Create a transporter
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 465, // Use 465 for SSL
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '',
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: `School Management System <${process.env.EMAIL_FROM || 'noreply@school.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // 3) Actually send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // We log but don't throw, allowing the "Forgot Password" flow to tell the user "Check your email" (which they can do in console)
        console.log('⚠️ Failed to send real email. See console log above for the content.');
    }
};

module.exports = sendEmail;
