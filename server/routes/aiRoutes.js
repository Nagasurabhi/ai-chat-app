import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios"; // ✅ ADDED

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  console.log("KEY:", process.env.GEMINI_API_KEY);
  const { message } = req.body;

  try {
    // ❌ OLD SDK CALL (kept but not used)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash" // ✅ updated model (for reference)
    });

    // 🔥 ADD: reusable AI caller
    const callAI = async (modelName) => {
      return await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{
  text: `
Explain clearly using Markdown formatting:

- Use headings (###)
- Use bullet points
- Use short paragraphs
- Use code blocks if needed

Question: ${message}
`
}]
            }
          ]
        }
      );
    };

    let response;

    // 🔁 RETRY LOGIC (for 503 errors)
    for (let i = 0; i < 3; i++) {
      try {
        response = await callAI("gemini-2.5-flash");
        break; // success
      } catch (err) {
        if (err.response?.status === 503) {
          console.log(`Retry ${i + 1} due to overload`);
          await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        } else {
          throw err;
        }
      }
    }

    // 🔄 FALLBACK MODEL
    if (!response) {
      console.log("Switching to fallback model...");
      response = await callAI("gemini-2.5-flash-lite");
    }

    const reply =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response";

    res.json({ reply });

  } catch (error) {
    console.log("FULL ERROR:", error.response?.data || error.message);

    res.status(500).json({
      reply: error.response?.data?.error?.message || error.message
    });
  }
});

export default router;