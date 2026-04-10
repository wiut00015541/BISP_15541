const { sendEmail, verifyEmailConnection, renderEmailTemplate } = require("../utils/emailService");

const getEmailStatus = async () => {
  return verifyEmailConnection();
};

const sendTestEmail = async ({ to }, user) => {
  if (!to?.trim()) {
    const error = new Error("Recipient email is required");
    error.status = 400;
    error.details = { to: "Recipient email is required" };
    throw error;
  }

  await verifyEmailConnection();

  const senderName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

  return sendEmail({
    to: to.trim(),
    subject: "SmartHire ATS email test",
    text: `Hello,\n\nThis is a test email from SmartHire ATS.\nSent by: ${senderName}\n\nIf you received this message, the SMTP connection is working.`,
    html: renderEmailTemplate({
      heading: "SmartHire ATS email test",
      intro: "This is a test email sent from your ATS environment to verify the SMTP connection.",
      sections: [
        { label: "Sent by", value: senderName },
        { label: "Recipient", value: to.trim() },
      ],
    }),
  });
};

module.exports = {
  getEmailStatus,
  sendTestEmail,
};
