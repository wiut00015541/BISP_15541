const emailConfigService = require("../services/emailConfigService");

const getEmailStatus = async (_req, res, next) => {
  try {
    const status = await emailConfigService.getEmailStatus();
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

const sendTestEmail = async (req, res, next) => {
  try {
    await emailConfigService.sendTestEmail(req.body, req.user);
    res.status(200).json({ message: "Test email sent successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmailStatus,
  sendTestEmail,
};
