const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env' });
const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 25, // Usually 587 for TLS/STARTTLS or 465 for SSL
    secure: false, // true for 465, false for other ports
    auth: { user: '', pass: '' },
    tls: { rejectUnauthorized: false }
});
module.exports = {
    mailOptions: async (array, emailBody, attachments, header) => {
        const actionHeader = header ? header : ''
        return {
            from: 'AOV SERVICE REQUEST <no-reply@pttplc.com>', //array.requesterEmail
            to: array.to, //debug for your email your_email@pttplc.com
            cc: array.cc.join(','),
            subject: `[AOV-SERVICE-REQUEST]${array.jobDetails[0]} ${actionHeader}`, //array.jobName
            html: emailBody, // Add the email body content here
            attachments: attachments.map(file => ({
                filename: file.filename,
                path: file.path
            }))
        };
    },
    transporter
}