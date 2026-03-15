const fs = require("fs");
const path = require("path");
const multer = require("multer");

const resumesDirectory = path.join(__dirname, "..", "uploads", "resumes");
fs.mkdirSync(resumesDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, resumesDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, "-");
    callback(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  uploadResume,
};
