const OpenAI = require("openai");

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const analyzeResume = async (resumeText) => {
  if (!resumeText) {
    const error = new Error("resumeText is required");
    error.status = 400;
    throw error;
  }

  // Fallback keeps the API usable in local environments without an OpenAI key.
  if (!client) {
    return {
      skills: [],
      experience: [],
      summary: "OpenAI API key not configured. Provide OPENAI_API_KEY to enable AI analysis.",
    };
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an ATS parser. Extract only factual info from resume text and return strict JSON.",
      },
      {
        role: "user",
        content: `Resume text:\n${resumeText}`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "resume_analysis",
        schema: {
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
        },
      },
    },
  });

  return JSON.parse(response.output_text);
};

module.exports = {
  analyzeResume,
};
