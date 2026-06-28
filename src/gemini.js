const GEMINI_API_KEY = "AQ.Ab8RN6JPCeDN0IvowrbFsSzjdK4UiMhIL1fMzQAa1_oMcVXBmg";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function analyzeIssueImage(base64Image, description) {
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

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }]
      })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    return {
      category: "Other",
      severity: "Medium",
      department: "Public Works",
      summary: description || "Issue reported by citizen",
      recommendedAction: "Inspect and resolve the reported issue"
    };
  }
}

export async function generatePredictiveInsights(issues) {
  const summary = issues.map(i => `${i.category} at ${i.location} - ${i.status}`).join("\n");
  const prompt = `Based on these community issues:\n${summary}\n\nRespond ONLY with a JSON object:
{
  "hotspot": "name of area with most issues",
  "topCategory": "most common issue type",
  "insight": "one sentence predictive insight about future issues",
  "recommendation": "one sentence recommendation for authorities"
}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    return {
      hotspot: "Downtown Area",
      topCategory: "Pothole",
      insight: "Infrastructure issues are concentrated in high-traffic zones.",
      recommendation: "Schedule preventive maintenance in hotspot areas."
    };
  }
}