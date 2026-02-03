const express = require('express');
const multer = require('multer');
const path = require('path');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend (only if API key is provided)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const hasValidApiKey = RESEND_API_KEY && !RESEND_API_KEY.includes('your_api_key');
const resend = hasValidApiKey ? new Resend(RESEND_API_KEY) : null;

if (!hasValidApiKey) {
    console.log('⚠️  Warning: No valid Resend API key found. Form submissions will be logged but not emailed.');
    console.log('   Get your API key at https://resend.com/api-keys and add it to .env file');
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Handle form submission
app.post('/api/submit-sample', upload.single('csvFile'), async (req, res) => {
    try {
        const { name, email, company, sell, target, benefit, cta, notes } = req.body;
        const csvFile = req.file;

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
            <p>The prospect list (${csvFile.originalname}) is attached to this email.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This submission was received from The Warm Message landing page.</p>
        `;

        // Send email via Resend (or log if not configured)
        if (resend) {
            const { data, error } = await resend.emails.send({
                from: 'The Warm Message <onboarding@resend.dev>',
                to: [process.env.RECIPIENT_EMAIL || 'couragealison1@gmail.com'],
                subject: `🎯 New Free Sample Request from ${name} at ${company}`,
                html: emailHtml,
                attachments: [
                    {
                        filename: csvFile.originalname,
                        content: csvFile.buffer.toString('base64'),
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

            console.log('✅ Email sent successfully:', data);
        } else {
            // Log the submission when Resend is not configured
            console.log('\n========================================');
            console.log('📧 NEW FREE SAMPLE REQUEST (not emailed - no API key)');
            console.log('========================================');
            console.log(`Name: ${name}`);
            console.log(`Email: ${email}`);
            console.log(`Company: ${company}`);
            console.log(`Sells: ${sell}`);
            console.log(`Target: ${target}`);
            console.log(`Benefit: ${benefit}`);
            console.log(`CTA: ${cta}`);
            console.log(`Notes: ${notes || 'None'}`);
            console.log(`CSV File: ${csvFile.originalname} (${csvFile.size} bytes)`);
            console.log('========================================\n');
        }

        res.json({ 
            success: true, 
            message: 'Your request has been submitted! We\'ll send your personalized emails within 5 minutes.' 
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Please try again or contact us directly.' 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 The Warm Message server running at http://localhost:${PORT}`);
    console.log(`📧 Form submissions will be sent to: ${process.env.RECIPIENT_EMAIL || 'couragealison1@gmail.com'}`);
});

