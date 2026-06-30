const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.analyzeIssue = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const { base64Image, description } = req.body;

    const prompt = `You are an AI assistant for a civic issue reporting platform.
Analyze this image and the description: "${description}"

Respond ONLY with a valid JSON object in this exact format:
{
  "category": "one of: Pothole, Streetlight, Water Leakage, Garbage, Sewage, Road Damage, Tree Hazard, Other",
  "severity": "one of: Low, Medium, High, Critical",
  "department": "one of: Public Works, Electricity Board, Water Authority, Sanitation Department, Parks Department",
  "summary": "one sentence describing the issue",
  "recommendedAction": "one sentence on what should be done"
}`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": "AQ.Ab8RN6JzjZtdiaNvysTmIyAlQj3vz6_WqUrKX5zi0_JengfoYQ"
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});