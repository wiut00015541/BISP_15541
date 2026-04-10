const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const RESUME_MODEL = process.env.OPENAI_RESUME_MODEL || "gpt-4.1-mini";

const supportedFileTypes = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const fallbackAnalysis = {
  skills: [],
  experience: [],
  summary: "OpenAI API key not configured. Provide OPENAI_API_KEY to enable AI analysis.",
  configured: false,
};

const resumeAnalysisSchema = {
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: { type: "string" },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          role: { type: "string" },
          duration: { type: "string" },
        },
        required: ["company", "role", "duration"],
        additionalProperties: false,
      },
    },
    summary: { type: "string" },
  },
  required: ["skills", "experience", "summary"],
  additionalProperties: false,
};

const buildResponseFormat = () => ({
  format: {
    type: "json_schema",
    name: "resume_analysis",
    schema: resumeAnalysisSchema,
    strict: true,
  },
});

const buildBasePrompt = () =>
  "You are an ATS resume parser. Extract only factual information from the resume. Return strict JSON matching the schema. Do not invent companies, titles, dates, or skills that are not supported by the input.";

const normalizeAnalysis = (analysis) => ({
  skills: Array.isArray(analysis?.skills) ? analysis.skills.filter(Boolean) : [],
  experience: Array.isArray(analysis?.experience)
    ? analysis.experience.filter((item) => item?.company || item?.role || item?.duration)
    : [],
  summary: String(analysis?.summary || "").trim(),
  configured: true,
});

const createResponse = async (input) => {
  const response = await client.responses.create({
    model: RESUME_MODEL,
    input,
    text: buildResponseFormat(),
  });

  return normalizeAnalysis(JSON.parse(response.output_text));
};

const analyzeResumeText = async (resumeText) => {
  if (!resumeText?.trim()) {
    const error = new Error("resumeText is required");
    error.status = 400;
    throw error;
  }

  if (!client) {
    return fallbackAnalysis;
  }

  return createResponse([
    {
      role: "system",
      content: [{ type: "input_text", text: buildBasePrompt() }],
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Analyze this resume text and extract skills, work experience, and a concise summary.\n\nResume text:\n${resumeText.trim()}`,
        },
      ],
    },
  ]);
};

const analyzeResumeFile = async ({ filePath, filename }) => {
  if (!filePath || !filename) {
    const error = new Error("filePath and filename are required");
    error.status = 400;
    throw error;
  }

  if (!client) {
    return fallbackAnalysis;
  }

  if (!fs.existsSync(filePath)) {
    const error = new Error("Resume file not found");
    error.status = 404;
    throw error;
  }

  const extension = path.extname(filename).toLowerCase();
  const mimeType = supportedFileTypes[extension];

  if (!mimeType) {
    const error = new Error("Unsupported resume file type for AI analysis");
    error.status = 400;
    error.details = {
      resume: "Supported AI analysis formats are PDF, DOC, DOCX, TXT, and MD",
    };
    throw error;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileData = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

  return createResponse([
    {
      role: "system",
      content: [{ type: "input_text", text: buildBasePrompt() }],
    },
    {
      role: "user",
      content: [
        {
          type: "input_file",
          filename,
          file_data: fileData,
        },
        {
          type: "input_text",
          text: "Analyze this uploaded resume and extract skills, work experience, and a concise summary.",
        },
      ],
    },
  ]);
};

const analyzeResume = async ({ resumeText, filePath, filename }) => {
  if (resumeText?.trim()) {
    return analyzeResumeText(resumeText);
  }

  if (filePath && filename) {
    return analyzeResumeFile({ filePath, filename });
  }

  const error = new Error("Either resumeText or a resume file is required");
  error.status = 400;
  throw error;
};

module.exports = {
  analyzeResume,
  analyzeResumeText,
  analyzeResumeFile,
};
