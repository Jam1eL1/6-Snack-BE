import nodemailer from "nodemailer";

type TEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (options: TEmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  } catch {
    throw new Error("Failed to send email.");
  }
};

const generateInviteEmailTemplate = (name: string, inviteLink: string, role: string, expiresAt: Date): string => {
  const roleText = role === "ADMIN" ? "Admin" : "User";
  const article = roleText === "Admin" ? "an" : "a";
  const formattedExpiresAt = expiresAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .invite-button {
            display: inline-block;
            background-color: #4c8ae1;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          a.invite-button:hover {
            background-color: #1363d4 !important; 
          }
          .info-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #7f8c8d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍪 Snack</div>
            <h2>Sign Up Required</h2>
          </div>
          
          <p>Hello, <strong>${name}</strong>!</p>
          
          <p>Your company administrator has invited you as ${article} <strong>${roleText}</strong>.</p>
          
          <div class="info-box">
            <strong>Invitation Details:</strong><br>
            • Role: ${roleText}<br>
            • Expiration Date: ${formattedExpiresAt}
          </div>
          
          <p>Please click the button below to complete your registration:</p>
          
          <div style="text-align:center;">
            <a href="${inviteLink}"
              class="invite-button"
              style="display:inline-block;background-color:#4c8ae1;color:#ffffff !important;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0;text-align:center;-webkit-text-size-adjust:none;mso-line-height-rule:exactly;">
              <span style="color:#ffffff !important;text-decoration:none;">Complete Registration</span>
            </a>
          </div>
          
          <p><strong>Note:</strong></p>
          <ul>
            <li>This invitation link is valid until ${formattedExpiresAt}.</li>
            <li>Clicking the link will complete your registration by setting a password.</li>
            <li>If you did not request this invitation, you may ignore this email.</li>
          </ul>
          
          <div class="footer">
            <p>This email was sent automatically. Please contact an administrator if you have any questions.</p>
          </div>
        </div>
      </body>
      </html>
    `;
};

export default {
  sendEmail,
  generateInviteEmailTemplate,
};
