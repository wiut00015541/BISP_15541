const nodemailer = require("nodemailer");

let transporter;

const getEmailConfig = () => {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
  const missing = required.filter((key) => !process.env[key]);

  return {
    isConfigured: missing.length === 0,
    missing,
  };
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const renderEmailTemplate = ({ heading, intro, sections = [], closing = "ATS Recruitment Team" }) => {
  const sectionHtml = sections
    .map(
      (section) =>
        `<div style="margin: 16px 0;"><p style="margin: 0 0 6px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #0f766e;">${section.label}</p><p style="margin: 0; color: #0f172a; line-height: 1.6;">${section.value}</p></div>`
    )
    .join("");

  return `
    <div style="background:#f8fafc;padding:32px;font-family:Arial,sans-serif;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0891b2;">SmartHire ATS</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#020617;">${heading}</h1>
        <p style="margin:0 0 20px;color:#334155;line-height:1.7;">${intro}</p>
        ${sectionHtml}
        <p style="margin:24px 0 0;color:#334155;line-height:1.7;">Best regards,<br /><strong>${closing}</strong></p>
      </div>
    </div>
  `;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const config = getEmailConfig();
  if (!config.isConfigured) {
    const error = new Error(`Email service is not configured. Missing: ${config.missing.join(", ")}`);
    error.status = 503;
    throw error;
  }

  const info = await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return info;
};

module.exports = {
  sendEmail,
  getEmailConfig,
  renderEmailTemplate,
};
