const GEMINI_API_KEY = "AQ.Ab8RN6JzjZtdiaNvysTmIyAlQj3vz6_WqUrKX5zi0_JengfoYQ";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function analyzeIssueImage(base64Image, description) {
  const prompt = `You are an AI assistant for a civic issue reporting platform.
Analyze this image and the description: "${description}"

Respond ONLY with valid JSON:
{
  "category": "one of: Pothole, Streetlight, Water Leakage, Garbage, Sewage, Road Damage, Tree Hazard, Other",
  "severity": "one of: Low, Medium, High, Critical",
  "department": "one of: Public Works, Electricity Board, Water Authority, Sanitation Department, Parks Department",
  "summary": "one short sentence describing the issue",
  "recommendedAction": "one short sentence on what should be done"
}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    return {
      category: "Other",
      severity: "Medium",
      department: "Public Works",
      summary: description || "Issue reported by citizen",
      recommendedAction: "Inspect and resolve the reported issue",
    };
  }
}

export async function generatePredictiveInsights(issues) {
  const summary = issues
    .map((i) => `${i.category} at ${i.location} - ${i.status}`)
    .join("\n");

  const prompt = `Based on these community issues:
${summary}

Respond ONLY with valid JSON:
{
  "hotspot": "name of area with most issues",
  "topCategory": "most common issue type",
  "insight": "one sentence predictive insight",
  "recommendation": "one sentence recommendation for authorities"
}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    return {
      hotspot: "Central Area",
      topCategory: "Pothole",
      insight: "High-traffic zones are showing repeated civic complaints.",
      recommendation: "Prioritize preventive maintenance in recurring hotspots.",
    };
  }
}