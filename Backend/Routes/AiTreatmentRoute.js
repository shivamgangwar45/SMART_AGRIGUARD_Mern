import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Helper: Target current model
const TARGET_MODEL = "gemini-3.6-flash";

// 1. Treatment Plan Endpoint (Supports Hindi & English)
router.post("/treatment", async (req, res) => {
  try {
    const { diseaseName, cropType, language = "en" } = req.body;

    const rawApiKey = process.env.GEMINI_API_KEY;
    if (!rawApiKey) {
      console.error("❌ GEMINI_API_KEY missing in .env");
      return res.status(500).json({
        success: false,
        message: ".env file me GEMINI_API_KEY missing hai.",
      });
    }

    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

    const languageInstruction = language === "hi"
      ? "Respond in clear, farmer-friendly Hindi. Keep technical chemical names in English script (e.g., 'Tricyclazole 75% WP')."
      : "Respond in clear English.";

    const promptText = `Provide detailed agricultural treatment advice for ${diseaseName || "plant disease"} affecting ${cropType || "crop"}.
${languageInstruction}

Return ONLY valid JSON matching this schema with NO markdown codeblock:
{
  "chemicalTreatment": ["Step 1", "Step 2"],
  "organicTreatment": ["Option 1", "Option 2"],
  "preventionTips": ["Tip 1", "Tip 2"]
}`;

    const generateRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      }
    );

    const result = await generateRes.json();

    if (!generateRes.ok) {
      console.error("❌ Gemini Generation Error:", result);
      return res.status(generateRes.status).json({
        success: false,
        message: result.error?.message || "Treatment plan generate nahi ho paaya.",
      });
    }

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("AI response JSON format me nahi tha.");
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get treatment plan.",
    });
  }
});

// 2. AI Assistant Chat Endpoint (Search, Medicines & Translation)
router.post("/assistant/chat", async (req, res) => {
  try {
    const { messages = [], userQuery } = req.body;

    const rawApiKey = process.env.GEMINI_API_KEY;
    if (!rawApiKey) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY missing in .env",
      });
    }

    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

    const systemInstruction = `You are "AgriGuard AI Assistant", an agricultural specialist.
1. Help farmers identify plant diseases, symptoms, and recommend proper chemical/organic medicines with dosage.
2. If the user asks in Hindi, answer in clear Hindi (keep medicine/chemical names in English script).
3. If asked in English, reply in concise English.
4. Translate any agricultural advice accurately between English and Hindi when asked.
5. Provide actionable bullet points for easy understanding.`;

    const contents = [
      { role: "user", parts: [{ text: systemInstruction }] },
      { role: "model", parts: [{ text: "Understood. I am AgriGuard AI Assistant, ready to assist." }] },
      ...messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
      { role: "user", parts: [{ text: userQuery }] },
    ];

    const generateRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    const result = await generateRes.json();

    if (!generateRes.ok) {
      return res.status(generateRes.status).json({
        success: false,
        message: result.error?.message || "Failed to generate AI response.",
      });
    }

    const reply = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not process that.";
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("❌ Chat Assistant Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server connection failed.",
    });
  }
});

export default router;