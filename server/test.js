import axios from "axios";

const API_KEY = "GEMINI_API_KEY";

async function run() {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: "Hello" }]
          }
        ]
      }
    );

    console.log("SUCCESS:", res.data.candidates[0].content.parts[0].text);

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
  }
}

run();
