import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
const router = express.Router();

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || "";
const SITE_NAME = process.env.SITE_NAME || "";

const greetings = ["hi", "hello", "hey"];
const thanks = ["thank you", "thanks", "thx"];

router.post("/", async (req, res) => {
  console.log("[AIChat] Incoming request:", req.body);
  const { message } = req.body;
  const lowerMsg = message.trim().toLowerCase();
  console.log("OPENROUTER_API_KEY:", OPENROUTER_API_KEY);
  if (greetings.some(greet => lowerMsg === greet)) {
    return res.json({ reply: "Hello! How can I help you today?" });
  }
  if (thanks.some(thank => lowerMsg.includes(thank))) {
    return res.json({ reply: "You're welcome! If you have more questions, just ask." });
  }
  try {
    let projectContext = "";
    try {
      projectContext = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf-8");
    } catch (e) {
      projectContext = "";
    }
    const messages = [
      {
        role: "system",
        content:
          `You are an assistant for the InfantFuel project. Use the following project context to answer the user's question as helpfully and concisely as possible. If the answer is not in the context, use your general knowledge, but always keep your answer short and to the point (2-3 sentences max).\n\nPROJECT CONTEXT:\n${projectContext}`,
      },
      { role: "user", content: message }
    ];
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "deepseek/deepseek-r1-0528:free",
        messages: messages
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          ...(SITE_URL && { "HTTP-Referer": SITE_URL }),
          ...(SITE_NAME && { "X-Title": SITE_NAME })
        },
        timeout: 15000
      }
    );
    let reply = "Sorry, I couldn't understand that.";
    if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
      reply = response.data.choices[0].message.content;
    }
    res.json({ reply });
  } catch (err) {
    console.error("AI service error:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "AI service error", details: err?.response?.data || err.message || err });
  }
});

export default router;