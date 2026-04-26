// emailService holds shared backend helpers used across the app.
const prisma = require("../config/prisma");
const nodemailer = require("nodemailer");

let transporter;
const EMAIL_TEMPLATE_KEY = "email_templates";

// Check whether the email environment settings are complete enough to send mail.
const getEmailConfig = () => {
  const required = ["SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
  const usesService = Boolean(process.env.SMTP_SERVICE);

  if (!usesService) {
    required.push("SMTP_HOST", "SMTP_PORT");
  }

  const missing = required.filter((key) => !process.env[key]);

  return {
    isConfigured: missing.length === 0,
    missing,
  };
};

// Build the Nodemailer transport settings from the current environment variables.
const buildTransportConfig = () => {
  const service = process.env.SMTP_SERVICE;

  if (service) {
    return {
      service,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
};

// Reuse one mail transporter so the app does not reconnect on every email.
const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport(buildTransportConfig());

  return transporter;
};

// Check that the configured email transport can actually connect.
const verifyEmailConnection = async () => {
  const config = getEmailConfig();
  if (!config.isConfigured) {
    const error = new Error(`Email service is not configured. Missing: ${config.missing.join(", ")}`);
    error.status = 503;
    throw error;
  }

  await getTransporter().verify();
  return {
    ok: true,
    service: process.env.SMTP_SERVICE || null,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    from: process.env.EMAIL_FROM,
  };
};

// Build the HTML email layout used by candidate and interview messages.
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

// Replace template placeholders with runtime values before sending the email.
const interpolate = (value, variables = {}) =>
  String(value || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, token) => variables[token] || "");

// Load a saved email template and merge it with fallback content.
const getManagedEmailTemplate = async (code, fallback = {}, variables = {}) => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: EMAIL_TEMPLATE_KEY },
  });

  let templates = [];
  try {
    templates = JSON.parse(setting?.value || "[]");
  } catch (_error) {
    templates = [];
  }

  const managedTemplate = templates.find((item) => item.code === code || item.id === code) || {};
  const merged = {
    ...fallback,
    ...managedTemplate,
  };

  return {
    code: merged.code || code,
    name: merged.name || fallback.name || code,
    subject: interpolate(merged.subject || fallback.subject || "", variables),
    heading: interpolate(merged.heading || fallback.heading || merged.subject || "", variables),
    intro: interpolate(merged.intro || fallback.intro || "", variables),
    closing: interpolate(merged.closing || fallback.closing || "ATS Recruitment Team", variables),
  };
};

// Send one email with the configured transport after validating the setup.
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
  verifyEmailConnection,
  renderEmailTemplate,
  getManagedEmailTemplate,
};
