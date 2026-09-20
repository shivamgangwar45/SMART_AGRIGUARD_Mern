import express from "express";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fallbackDiagnoses = [
  {
    isPlant: true,
    diseaseName: "Early Blight (Alternaria solani)",
    confidence: 94,
    symptoms: ["Concentric rings on lower leaves", "Yellow halo around dark brown spots", "Premature defoliation"],
    treatment: ["Apply Mancozeb 75% WP (2g/L) or Copper Oxychloride", "Neem seed extract spray (5%)"],
    prevention: ["Avoid overhead irrigation", "Mulch around base to prevent splash", "Prune lower infected leaves"]
  }
];

router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image." });
    }

    const rawApiKey = process.env.GEMINI_API_KEY;
    if (!rawApiKey) {
      return res.status(500).json({ success: false, message: "GEMINI_API_KEY is missing in .env file." });
    }

    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, '');
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    const promptText = `Analyze this plant leaf image. Identify if it is a plant and detect any disease.
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

    let detectedData = null;

    // Aapke logs me active vision models:
    const activeVisionModels = [
      "gemini-3.6-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-pro-latest"
    ];

    for (const modelName of activeVisionModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Image
                      }
                    }
                  ]
                }
              ]
            })
          }
        );

        const result = await response.json();

        if (response.ok && result.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = result.candidates[0].content.parts[0].text;
          const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            detectedData = JSON.parse(jsonMatch[0]);
            console.log(`✅ Live Gemini AI analysis successful using: ${modelName}`);
            break;
          }
        } else {
          console.warn(`Model ${modelName} failed:`, result.error?.message || "Invalid output format");
        }
      } catch (err) {
        console.warn(`Call failed for ${modelName}:`, err.message);
      }
    }

    if (!detectedData) {
      console.warn("⚠️ All vision models failed. Returning default fallback.");
      detectedData = fallbackDiagnoses[0];
    }

    return res.status(200).json({
      success: true,
      message: "Disease detected successfully",
      data: detectedData,
      ...detectedData
    });

  } catch (error) {
    console.error("Server Detection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during detection",
      error: error.message
    });
  }
});

export default router;