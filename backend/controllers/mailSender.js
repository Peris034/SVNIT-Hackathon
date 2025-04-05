const transporter = require("../config/nodemailer");
require('dotenv').config();

export const incidentMailSender = async (data) => {
    try {
        let info1 = await transporter.sendMail({
            from: '"Smit Sojitra" <smitsojitra@email.com>',
            to: data.email,
            subject: 'Emergency Contact Form Submission',
            html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Hello, ${data.fullName},</h2>
            <p style="color: #555;">Thank you for reaching out through.</p>
            <p style="color: #555;">We will get back to you within 24 hours.</p>
            <p style="color: #555;">If you have any urgent queries, feel free to reply to this email.</p>
            <p style="color: #777;">Best regards,<br>Smit Sojitra</p>
        </div>`,
        })
        return info1;
    } catch (error) {
        console.log('Error sending mail:', error);
    }
}

export const statusUpdateMailSender = async (data) => {
    try {
        let info1 = await transporter.sendMail({
            from: '"Smit Sojitra" <smitsojitra@email.com>',
            to: data.email,
            subject: 'Status Update for Your Incident Report',
            html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Hello, ${data.fullName},</h2>
            <p style="color: #555;">Your incident status has been updated to ${data.status}.</p>
            <p style="color: #555;">If you have any urgent queries, feel free to reply to this email.</p>
            <p style="color: #777;">Best regards,<br>Smit Sojitra</p>
        </div>`,
        })
        return info1;
    } catch (error) {
        console.log('Error sending mail:', error);
    }
}