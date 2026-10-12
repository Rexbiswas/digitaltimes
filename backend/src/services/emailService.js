const nodemailer = require("nodemailer");
const env = require("../config/env");

let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (env.EMAIL_USER && env.EMAIL_PASS) {
    if (env.SMTP_HOST) {
      cachedTransporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      });
    } else {
      // Default to Gmail service if host not specified
      cachedTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      });
    }
    return cachedTransporter;
  }

  // Fallback to ethereal test account for local dev without credentials
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTransporter;
  } catch (err) {
    console.warn("[EmailService] Ethereal test account unavailable:", err.message);
    return null;
  }
};

/**
 * Sends password reset recovery email to the user's email address
 */
const sendPasswordResetEmail = async (toEmail, resetCode, userName = "Reader") => {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: env.EMAIL_FROM,
      to: toEmail,
      subject: `[The Digital Times] Your 6-Digit Password Reset Code: ${resetCode}`,
      text: `Dear ${userName},\n\nWe received a request to reset your Digital Times cipher passcode.\n\nYour 6-digit verification code is: ${resetCode}\n\nThis code will expire in 15 minutes. Enter this code on the recovery screen to assign a new passcode.\n\nIf you did not make this request, you can safely disregard this message.\n\n— The Digital Times Editorial Desk`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background-color: #EFE8D5; border: 2px solid #766E5F; padding: 24px; color: #201E19;">
          <div style="text-align: center; border-bottom: 2px solid #766E5F; padding-bottom: 12px; margin-bottom: 16px;">
            <h1 style="font-family: 'Times New Roman', serif; margin: 0; font-size: 26px; letter-spacing: 1px; color: #201E19;">THE DIGITAL TIMES</h1>
            <p style="font-family: monospace; font-size: 10px; color: #9F3028; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0; font-weight: bold;">
              TELEGRAPH PASSCODE RECOVERY WIRE
            </p>
          </div>

          <p style="font-size: 14px; line-height: 1.5; color: #201E19; margin-top: 0;">
            Dear <strong>${userName}</strong>,
          </p>
          <p style="font-size: 13px; line-height: 1.6; color: #39352D;">
            We received a transmission to reset the cipher passcode for your Digital Times subscriber profile.
            Please enter the following 6-digit verification code on the recovery screen:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background-color: #201E19; color: #EFE8D5; font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 10px; padding: 14px 28px; border: 2px solid #766E5F; box-shadow: 4px 4px 0px #766E5F;">
              ${resetCode}
            </div>
            <p style="font-family: monospace; font-size: 10.5px; color: #766E5F; margin-top: 8px;">
              VALID FOR 15 MINUTES
            </p>
          </div>

          <p style="font-size: 12px; color: #666666; font-style: italic; line-height: 1.5;">
            If you did not initiate this request, your account remains secure and you may safely disregard this dispatch.
          </p>

          <div style="border-top: 1px solid #766E5F; margin-top: 20px; padding-top: 12px; text-align: center; font-family: monospace; font-size: 9px; color: #766E5F;">
            THE DIGITAL TIMES CO. • EDITORIAL DISPATCH REGISTRY • ALL RIGHTS RESERVED
          </div>
        </div>
      `,
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Recovery email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[EmailService] Ethereal Preview URL: ${previewUrl}`);
      }
      return { success: true, messageId: info.messageId, previewUrl };
    } else {
      console.log(`[EmailService] Mock mail delivery to ${toEmail} (Code: ${resetCode})`);
      return { success: true, simulated: true };
    }
  } catch (err) {
    console.error(`[EmailService] Error dispatching email to ${toEmail}:`, err.message);
    // Don't crash request if email sending encounters network error
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
};
