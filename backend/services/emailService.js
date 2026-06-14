const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Send contact notification to admin
 */
const sendContactNotification = async ({ name, email, subject, message, date }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"MediCare Contact" <${process.env.SMTP_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📩 New Contact Form: ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0d9488, #0891b2); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💬 New Contact Message</h1>
          <p style="color: #ccfbf1; margin: 8px 0 0; font-size: 14px;">Someone reached out via MediCare</p>
        </div>
        <div style="padding: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 120px;">Sender Name</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Email</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px;"><a href="mailto:${email}" style="color: #0d9488;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Subject</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Date & Time</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${new Date(date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #0d9488;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">MediCare Telemedicine Platform • Automated Notification</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send confirmation email to the user
 */
const sendContactConfirmation = async ({ name, email, subject, message, date }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"MediCare Support" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `✅ We received your message — "${subject}"`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0d9488, #0891b2); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Message Received!</h1>
          <p style="color: #ccfbf1; margin: 8px 0 0; font-size: 14px;">Thank you for contacting MediCare</p>
        </div>
        <div style="padding: 30px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We've received your message and our team will get back to you within <strong>24 hours</strong>. Here's a summary of what you sent:
          </p>
          <div style="margin: 20px 0; padding: 20px; background: #f0fdfa; border-radius: 12px; border: 1px solid #ccfbf1;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 80px;">Subject</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Sent at</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              </tr>
            </table>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ccfbf1;">
              <p style="margin: 0 0 4px; color: #64748b; font-size: 12px;">Your message:</p>
              <p style="margin: 0; color: #334155; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            If you have any urgent concerns, please call us at <strong>+1 (555) 123-4567</strong>.
          </p>
        </div>
        <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} MediCare Telemedicine • Do not reply to this email</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendContactNotification, sendContactConfirmation };
