import {transporter} from '../config/nodemailer.js';

export const incidentMailSender = async ({data}) => {
    try {
        
        let info1 = await transporter.sendMail({
            from: '"Smit Sojitra" <smitsojitra@email.com>',
            to: data.email,
            subject: 'Emergency Contact Form Submission',
            html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Hello, ${data.fullName},</h2>
            <p style="color: #555;">Thank you for reaching out.</p>
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

export const statusUpdateMailSender = async ({data,sos}) => {
    try {
        console.log("daata before sending mail",data);
        console.log("sos before sending mail",sos);
        
        let info1 = await transporter.sendMail({
            from: '"Smit Sojitra" <smitsojitra@email.com>',
            to: data.email,
            subject: 'Status Update for Your Incident Report',
            html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Hello, ${data.fullName},</h2>
            <p style="color: #555;">Your incident status has been updated to ${sos.status}.</p>
            <p style="color: #555;">If you have any urgent queries, feel free to reply to this email.</p>
            <p style="color: #777;">Best regards,<br>Smit Sojitra</p>
        </div>`,
        })
        return info1;
    } catch (error) {
        console.log('Error sending mail:', error);
    }
}