import { Resend } from 'resend';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const form = formidable({
            maxFileSize: 5 * 1024 * 1024, // 5MB
        });

        const [fields, files] = await form.parse(req);

        const name = fields.name?.[0];
        const email = fields.email?.[0];
        const company = fields.company?.[0];
        const sell = fields.sell?.[0];
        const target = fields.target?.[0];
        const benefit = fields.benefit?.[0];
        const cta = fields.cta?.[0];
        const notes = fields.notes?.[0];
        const csvFile = files.csvFile?.[0];

        // Validate required fields
        if (!name || !email || !company || !sell || !target || !benefit || !cta) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        if (!csvFile) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a CSV file with your prospects'
            });
        }

        // Read file content
        const fileContent = fs.readFileSync(csvFile.filepath);
        const fileBase64 = fileContent.toString('base64');

        // Build email content
        const emailHtml = `
            <h1>🎉 New Free Sample Request</h1>
            
            <h2>Contact Information</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Name</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Email</td>
                    <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Company</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${company}</td>
                </tr>
            </table>

            <h2>About Their Offer</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">What do they sell?</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${sell}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Target customer</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${target}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Main benefit</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${benefit}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Call to action</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${cta}</td>
                </tr>
                ${notes ? `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Additional notes</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${notes}</td>
                </tr>
                ` : ''}
            </table>

            <h2>CSV File Attached</h2>
            <p>The prospect list (${csvFile.originalFilename}) is attached to this email.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This submission was received from The Warm Message landing page.</p>
        `;

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: 'The Warm Message <onboarding@resend.dev>',
            to: [process.env.RECIPIENT_EMAIL || 'couragealison1@gmail.com'],
            subject: `🎯 New Free Sample Request from ${name} at ${company}`,
            html: emailHtml,
            attachments: [
                {
                    filename: csvFile.originalFilename,
                    content: fileBase64,
                }
            ],
            reply_to: email
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again.'
            });
        }

        console.log('Email sent successfully:', data);

        return res.status(200).json({
            success: true,
            message: "Your request has been submitted! We'll send your personalized emails within 5 minutes."
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again or contact us directly.'
        });
    }
}

