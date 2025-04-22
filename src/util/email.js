// note i install nodemailer to start the Application

import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT), // Convert to number
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: 'Egwaoje Daniel <hello@daniel.io>',
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        console.log("📧 Sending email...");
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("❌ email sending failed")
        console.error("❌ Full Error:", error);
        console.error("❌ Error Message:", error.message);
        console.error("❌ Error Code:", error.code);
        throw new Error('Failed to send email.');
    }
};

export default sendEmail;