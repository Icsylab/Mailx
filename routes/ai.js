const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


router.post("/draft", async (req, res) => {
  const { emailBody } = req.body;

  if (!emailBody) {
    return res.status(400).json({ error: "No email body provided" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a professional email assistant.
      Read the following email and write a polite, concise, and professional reply.
      Keep it short — maximum 3-4 sentences.
      Do not include subject line, just the email body.
      
      Email to reply to:
      ${emailBody}
    `;
    
    const result = await model.generateContent(prompt);
    const draft = result.response.text();

    res.json({ draft });

  } catch (error) {
    console.error("❌ Gemini error:", error);
    res.status(500).json({ error: "Failed to generate draft" });
  }
});

module.exports = router;