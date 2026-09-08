import nodemailer from 'nodemailer';

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Ethereal / Test Transporter for development if no custom SMTP set
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('[EmailService] Using Ethereal Email test transport. Test User:', testAccount.user);
    } catch (err) {
      console.warn('[EmailService] Could not create test account, falling back to direct transport:', err.message);
      transporter = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
      });
    }
  }

  return transporter;
};

export const sendOtpEmail = async (toEmail, otpCode, userName = 'Student') => {
  try {
    const transport = await getTransporter();

    const mailOptions = {
      from: `"StudentOS Verification" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@studentos.app'}>`,
      to: toEmail,
      subject: `🔑 StudentOS 2FA Verification Code: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #1f2937; border-radius: 12px; background-color: #0b0f19; color: #f3f4f6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #818cf8; margin: 0;">Student<span style="color: #c084fc;">OS</span> Security</h2>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 5px;">2-Factor Email OTP Verification</p>
          </div>

          <p style="font-size: 15px; color: #e5e7eb;">Hello <strong>${userName}</strong>,</p>
          <p style="font-size: 14px; color: #9ca3af;">Use the 6-digit verification code below to complete your login to StudentOS:</p>

          <div style="background-color: #111827; border: 1px solid #374151; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #6366f1;">${otpCode}</span>
          </div>

          <p style="font-size: 13px; color: #9ca3af; text-align: center;">This verification code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
          
          <hr style="border: none; border-top: 1px solid #1f2937; margin: 20px 0;" />
          <p style="font-size: 11px; color: #6b7280; text-align: center;">StudentOS Platform • Secure Authentication</p>
        </div>
      `
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`[EmailService] OTP Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
    
    // Log Ethereal Preview URL if available
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EmailService] Ethereal Email Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`[EmailService] Failed to send OTP email to ${toEmail}:`, error);
    return { success: false, error: error.message };
  }
};
