import { Resend } from 'resend';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

const resend = new Resend(process.env.RESEND_API_KEY);

// Personal email domains to reject
const personalEmailDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'hotmail.com', 'hotmail.co.uk',
    'outlook.com', 'outlook.co.uk', 'live.com', 'live.co.uk', 'msn.com',
    'aol.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com',
    'proton.me', 'zoho.com', 'yandex.com', 'mail.com', 'gmx.com',
    'inbox.com', 'fastmail.com', 'tutanota.com', 'hey.com', 'pm.me',
    'googlemail.com', 'qq.com', '163.com', '126.com', 'sina.com',
    'rediffmail.com', 'ymail.com', 'rocketmail.com'
];

function isCompanyEmail(email) {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return !personalEmailDomains.includes(domain);
}

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
        const listOption = fields.listOption?.[0];
        const csvFile = files.csvFile?.[0];
        
        // Build list fields
        const targetTitles = fields.targetTitles?.[0];
        const targetIndustries = fields.targetIndustries?.[0];
        const companySize = fields.companySize?.[0];
        const geography = fields.geography?.[0];
        const exclusions = fields.exclusions?.[0];

        // Validate required fields
        if (!name || !email || !company || !sell || !target || !benefit || !cta || !notes) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Validate company email
        if (!isCompanyEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please use your company email address. Personal emails (Gmail, Yahoo, etc.) are not accepted.'
            });
        }

        // Validate based on list option
        const needsList = listOption === 'have-list';
        if (needsList && !csvFile) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a CSV file with your prospects'
            });
        }
        
        if (!needsList && (!targetTitles || !targetIndustries || !companySize || !geography)) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all targeting fields to build your list'
            });
        }

        // Build email content
        let listSectionHtml = '';
        let attachments = [];
        
        if (needsList && csvFile) {
            // Read file content for attachment
            const fileContent = fs.readFileSync(csvFile.filepath);
            const fileBase64 = fileContent.toString('base64');
            attachments = [{
                filename: csvFile.originalFilename,
                content: fileBase64,
            }];
            listSectionHtml = `
                <h2>📄 Prospect List</h2>
                <p><strong>Type:</strong> Customer provided CSV</p>
                <p>The prospect list (${csvFile.originalFilename}) is attached to this email.</p>
            `;
        } else {
            listSectionHtml = `
                <h2>🎯 Build List Request</h2>
                <p><strong>Type:</strong> Build list for customer</p>
                <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Target Titles</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${targetTitles}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Target Industries</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${targetIndustries}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Company Size</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${companySize}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Geography</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${geography}</td>
                    </tr>
                    ${exclusions ? `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Exclusions</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${exclusions}</td>
                    </tr>
                    ` : ''}
                </table>
            `;
        }

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
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Additional notes</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${notes}</td>
                </tr>
            </table>

            ${listSectionHtml}

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This submission was received from The Warm Message landing page.</p>
        `;

        // Send email via Resend
        const emailPayload = {
            from: 'The Warm Message <onboarding@resend.dev>',
            to: [process.env.RECIPIENT_EMAIL || 'couragealison1@gmail.com'],
            subject: `🎯 New Free Sample Request from ${name} at ${company}${!needsList ? ' [BUILD LIST]' : ''}`,
            html: emailHtml,
            reply_to: email
        };
        
        // Add attachments if we have them
        if (attachments.length > 0) {
            emailPayload.attachments = attachments;
        }
        
        const { data, error } = await resend.emails.send(emailPayload);

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

