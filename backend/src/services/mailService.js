const { Resend } = require('resend');

let resend;

const getResendClient = () => {
  if (resend) return resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured; email sending will be skipped.');
    return null;
  }

  resend = new Resend(apiKey);
  return resend;
};

const sendWelcomeEmail = async (userData, createdByRole) => {
  try {
    const { name, email, password, role, designation, department, phone } = userData;
    const roleName = role === 'hr_admin' ? 'HR Administrator' : 'Employee';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0; opacity: 0.9; }
          .content { padding: 40px 30px; background: #f9fafb; }
          .welcome-text { margin-bottom: 30px; }
          .credentials { background: white; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
          .credentials h3 { margin: 0 0 20px 0; color: #4a5568; font-size: 18px; }
          .credential-item { background: #f7fafc; padding: 12px 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .credential-item strong { display: inline-block; width: 100px; color: #4a5568; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
          .footer { background: #f3f4f6; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
          .note { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to the Team! 🎉</h1>
            <p>Your ${roleName} account has been created</p>
          </div>
          <div class="content">
            <div class="welcome-text">
              <h2>Hello ${name},</h2>
              <p>We're excited to have you on board! Here are your login credentials:</p>
            </div>

            <div class="credentials">
              <h3>Account Details:</h3>
              <div class="credential-item">
                <strong>Email:</strong> ${email}
              </div>
              <div class="credential-item">
                <strong>Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</code>
              </div>
              ${role ? `<div class="credential-item"><strong>Role:</strong> ${roleName}</div>` : ''}
              ${designation ? `<div class="credential-item"><strong>Designation:</strong> ${designation}</div>` : ''}
              ${department ? `<div class="credential-item"><strong>Department:</strong> ${department}</div>` : ''}
              ${phone ? `<div class="credential-item"><strong>Phone:</strong> ${phone}</div>` : ''}
            </div>

            <div class="note">
              <strong>🔐 Important Security Note:</strong>
              <p style="margin: 8px 0 0;">For security reasons, please change your password after your first login.</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="button">Login to Your Account →</a>
            </div>

            <p>If you have any questions or need assistance, please don't hesitate to reach out to your HR department.</p>

            <p>Best regards,<br><strong>HR Management Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} WORKSPRINT. All rights reserved.</p>
          </div>
        </div>
      </html>
    `;

    const client = getResendClient();
    if (!client) {
      console.info('sendWelcomeEmail: skipping because RESEND_API_KEY is not configured');
      return { success: false, error: 'Resend not configured' };
    }

    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'WORKSPRINT <noreply@worksprint.com>',
      to: [email],
      subject: `Welcome to the Team! Your ${roleName} Account Details`,
      html: htmlContent,
    });

    console.log('Welcome email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

const sendMail = async (options) => {
  const client = getResendClient();
  if (!client) {
    console.info('sendMail: skipping because RESEND_API_KEY is not configured', options);
    return Promise.resolve({ message: 'Resend not configured, email skipped' });
  }

  try {
    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'WORKSPRINT <noreply@worksprint.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = { sendMail, sendWelcomeEmail };
