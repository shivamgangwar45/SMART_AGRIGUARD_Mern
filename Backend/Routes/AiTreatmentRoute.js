import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Supported active models based on your key's quota
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-pro-latest"
];

// Helper to clean API Key
const getCleanApiKey = () => {
  const rawKey = process.env.GEMINI_API_KEY || "";
  return rawKey.trim().replace(/^["']|["']$/g, "");
};

// 1. Treatment Plan Endpoint (Supports Hindi & English)
router.post("/treatment", async (req, res) => {
  try {
    const { diseaseName, cropType, language = "en" } = req.body;
    const apiKey = getCleanApiKey();

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY missing in .env");
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY missing in server environment.",
      });
    }

    const languageInstruction =
      language === "hi"
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

    let parsedData = null;
    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const generateRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          }
        );

        const result = await generateRes.json();

        if (generateRes.ok && result.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = result.candidates[0].content.parts[0].text;
          const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
            console.log(`✅ Treatment plan generated via ${model}`);
            break;
          }
        } else {
          lastError = result.error?.message || "Generation error";
          console.warn(`Treatment generation failed on ${model}:`, lastError);
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!parsedData) {
      throw new Error(lastError || "Failed to generate treatment plan with all candidate models.");
    }

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
    const apiKey = getCleanApiKey();

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY missing in server environment.",
      });
    }

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
      { role: "user", parts: [{ text: userQuery || "" }] },
    ];

    let reply = null;
    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const generateRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({ contents }),
          }
        );

        const result = await generateRes.json();

        if (generateRes.ok && result.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply = result.candidates[0].content.parts[0].text;
          console.log(`✅ Assistant replied via ${model}`);
          break;
        } else {
          lastError = result.error?.message || "Model reply error";
          console.warn(`Chat failed on ${model}:`, lastError);
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: lastError || "Failed to generate AI response from available models.",
      });
    }

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