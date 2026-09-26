/**
 * Base HTML layout wrapper to maintain consistent branding and layout.
 */
const baseTemplate = (content, title = 'Notification') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; }
    
    /* Layout styling */
    .wrapper { width: 100%; table-layout: fixed; background-color: #f3f4f6; padding: 40px 0; }
    .main-card { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 560px; border-radius: 12px; border: 1px solid #e5e7eb; border-spacing: 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
    
    /* Header & Footer */
    .header { background-color: #55c57a; padding: 28px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.025em; }
    .content { padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #374151; }
    .footer { background-color: #f9fafb; padding: 20px 32px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #f3f4f6; }
    
    /* Components */
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #55c57a; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; text-align: center; }
    .code-box { background-color: #f3f4f6; border: 1px dashed #c7d2fe; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
    .code-text { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #55c57a; margin: 0; }
    .link-text { word-break: break-all; color: #55c57a; font-size: 14px; }
    
    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .main-card { width: 100% !important; border-radius: 0 !important; border: none !important; }
      .content, .header, .footer { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="main-card">
            <tr>
              <td class="header">
                <h1>Natours</h1>
              </td>
            </tr>
            <tr>
              <td class="content">
                ${content}
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p style="margin: 0;">If you didn't request this email, you can safely ignore it.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

/**
 * Account Activation Code Template (Signup OTP)
 */
const activateAccountTemplate = ({ name, code, validMinutes = 10 }) => {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Activate Your Account</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for signing up! Please use the verification code below to complete your registration and activate your account:</p>
    
    <div class="code-box">
      <p class="code-text">${code}</p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">This verification code will expire in <strong>${validMinutes} minutes</strong>.</p>
    <p>If you did not create an account with us, no further action is required.</p>
  `;

  return baseTemplate(content, 'Activate Your Account');
};

/**
 * Forgot Password Code Template (Reset OTP)
 */
const forgotPasswordCodeTemplate = ({ name, code, validMinutes = 10 }) => {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Password Reset Code</h2>
    <p>Hi ${name || 'there'},</p>
    <p>We received a request to reset your password. Enter the code below in the app to proceed:</p>
    
    <div class="code-box">
      <p class="code-text">${code}</p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">This code is valid for <strong>${validMinutes} minutes</strong>.</p>
    <p>If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
  `;

  return baseTemplate(content, 'Your Password Reset Code');
};

/**
 * Reset Password URL Link Template
 */
const resetPasswordTemplate = ({ name, resetUrl, validMinutes = 10 }) => {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Forgot your password? Click the button below to set up a new password for your account.</p>
    
    <div class="btn-container">
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">This link is valid for <strong>${validMinutes} minutes</strong>.</p>
    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
    <p class="link-text"><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `;

  return baseTemplate(content, 'Reset Your Password');
};

/**
 * Welcome Email Template
 */
const welcomeTemplate = ({ name }) => {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Welcome aboard!</h2>
    <p>Hi ${name || 'there'},</p>
    <p>We're thrilled to have you join us! Your account is ready to go.</p>
    <p>Explore your dashboard to get started and set up your preferences.</p>
  `;

  return baseTemplate(content, 'Welcome!');
};

module.exports = {
  activateAccountTemplate,
  forgotPasswordCodeTemplate,
  resetPasswordTemplate,
  welcomeTemplate,
};
