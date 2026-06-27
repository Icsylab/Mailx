const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


router.post("/draft", async (req, res) => {
  const { emailBody } = req.body;

  if (!emailBody) {
    return res.status(400).json({ error: "No email body provided" });
  }

  try {
    const prompt = `
      You are a professional email assistant.
      Read the following email and write a polite, concise reply.
      Maximum 3-4 sentences. No subject line, just the body.
      
      Email:
      ${emailBody}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    res.json({ draft: response.text });

  } catch (error) {
    console.error("❌ Gemini error:", error);
    res.status(500).json({ error: "Failed to generate draft" });
  }
});

module.exports = router;