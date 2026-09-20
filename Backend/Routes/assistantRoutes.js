import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages, userQuery } = req.body;
    const apiKey = process.env.GEMINI_API_KEY?.trim().replace(/^["']|["']$/g, '');

    if (!apiKey) {
      return res.status(500).json({ success: false, message: "GEMINI_API_KEY missing in .env" });
    }

    const systemPrompt = `You are "AgriGuard AI Assistant", an agricultural specialist. 
Your duties:
1. Answer farmer queries about crop diseases, symptoms, chemical & organic treatments, fertilizers, and dosage.
2. If the user speaks or asks in Hindi, answer in clean, easy-to-understand Hindi (keep chemical/medicine brand names in English script).
3. If asked in English, reply in concise, clear English.
4. Translate agricultural advice between English and Hindi when requested.
5. Provide actionable, concise bullet points when giving remedies.`;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I am AgriGuard AI Assistant, ready to help with crop health, treatments, and translations." }] },
      ...(messages || []).map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
      { role: "user", parts: [{ text: userQuery }] },
    ];

    const targetModel = "gemini-2.0-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error?.message || "Failed to fetch response from AI.",
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not process that.";

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Assistant Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;