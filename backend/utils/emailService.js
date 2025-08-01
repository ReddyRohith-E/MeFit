// Email service utility
// In production, this would integrate with services like SendGrid, AWS SES, etc.

const sendPasswordResetEmail = async (email, resetUrl) => {
  // For development purposes, we'll just log the email content
  // In production, replace this with actual email service
  
  const emailContent = {
    to: email,
    subject: 'MeFit - Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MeFit - Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏋️ MeFit</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>We received a request to reset the password for your MeFit account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>The MeFit Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      MeFit - Password Reset Request
      
      Hello!
      
      We received a request to reset the password for your MeFit account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      The MeFit Team
    `
  };

  // Log email content for development
  console.log('=== EMAIL TO BE SENT ===');
  console.log('To:', emailContent.to);
  console.log('Subject:', emailContent.subject);
  console.log('Reset URL:', resetUrl);
  console.log('========================');

  // In production, replace this with actual email service call:
  // Examples:
  // - SendGrid: await sgMail.send(emailContent);
  // - AWS SES: await ses.sendEmail(params).promise();
  // - Nodemailer: await transporter.sendMail(emailContent);
  
  return Promise.resolve({
    success: true,
    messageId: 'dev-' + Date.now()
  });
};

module.exports = {
  sendPasswordResetEmail
};
