import express from "express";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload an image." 
      });
    }

    const rawApiKey = process.env.GEMINI_API_KEY;
    if (!rawApiKey) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing in .env file.",
      });
    }

    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, '');
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    // 1. Fetch available models
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    if (!listResponse.ok || !listData.models) {
      return res.status(400).json({
        success: false,
        message: "Invalid API Key or API disabled in Google AI Studio.",
        error: listData
      });
    }

    // 2. Strict Gemini Model Filter
    const geminiModels = listData.models.filter(m => 
      m.name.includes("models/gemini") &&
      m.supportedGenerationMethods?.includes("generateContent") &&
      !m.name.includes("gemini-2.5")
    );

    const targetModel = geminiModels.find(m => m.name.includes("1.5-flash")) || 
                        geminiModels.find(m => m.name.includes("2.0-flash")) || 
                        geminiModels[0];

    if (!targetModel) {
      return res.status(404).json({
        success: false,
        message: "No active Gemini Vision model found."
      });
    }

    const promptText = `Analyze this plant leaf image.
Return ONLY valid raw JSON with NO markdown formatting, NO backticks, and NO conversational text.

JSON Schema:
{
  "isPlant": true,
  "diseaseName": "Exact Disease Name or Healthy Plant",
  "confidence": 95,
  "symptoms": ["Symptom 1", "Symptom 2"],
  "treatment": ["Treatment 1", "Treatment 2"],
  "prevention": ["Prevention 1", "Prevention 2"]
}`;

    // 3. Request Execution
    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${targetModel.name}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                { inline_data: { mime_type: mimeType, data: base64Image } }
              ]
            }
          ],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      }
    );

    const result = await generateResponse.json();

    if (!generateResponse.ok) {
      return res.status(generateResponse.status).json({
        success: false,
        message: result.error?.message || "Gemini API Request Failed",
        error: result
      });
    }

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({
        success: false,
        message: "AI did not return valid JSON format."
      });
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Compatible Response (top-level + data object wrapper)
    return res.status(200).json({
      success: true,
      message: "Disease detected successfully",
      data: parsedData,
      ...parsedData
    });

  } catch (error) {
    console.error("Server Detection Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process image.",
      error: error.message
    });
  }
});

export default router;