import express from "express";
import axios from "axios";
const router = express.Router();

const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-3B";
const HF_API_TOKEN = process.env.HF_API_TOKEN; // Store your token in .env

// Add simple keyword-based responses for greetings and thanks
const greetings = ["hi", "hello", "hey"]; 
const thanks = ["thank you", "thanks", "thx"];

router.post("/", async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.trim().toLowerCase();
  if (greetings.some(greet => lowerMsg === greet)) {
    return res.json({ reply: "Hello! How can I help you today?" });
  }
  if (thanks.some(thank => lowerMsg.includes(thank))) {
    return res.json({ reply: "You're welcome! If you have more questions, just ask." });
  }
  try {
    // Just send the user's message to the model (no FAQ context)
    const response = await axios.post(
      HF_API_URL,
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    // Log the response for debugging
    console.log("HF API response:", response.data);
    // The response may be an array or object depending on the model
    let reply = "Sorry, I couldn't understand that.";
    if (response.data && response.data.generated_text) {
      reply = response.data.generated_text;
    } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      reply = response.data[0].generated_text;
    } else if (typeof response.data === "string" && response.data.trim().length > 0) {
      reply = response.data;
    }
    res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err?.response?.data || err.message);
    res.status(500).json({ error: "AI service error" });
  }
});

export default router;