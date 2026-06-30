import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function smartClassify(description) {
  const text = (description || "").toLowerCase();
  let category = "Other", department = "Public Works", severity = "Medium";
  if (text.match(/pothole|crater|hole/)) { category = "Pothole"; department = "Public Works"; }
  else if (text.match(/light|lamp|dark|electricity/)) { category = "Streetlight"; department = "Electricity Board"; }
  else if (text.match(/water|leak|pipe|flood/)) { category = "Water Leakage"; department = "Water Authority"; }
  else if (text.match(/garbage|trash|waste|litter/)) { category = "Garbage"; department = "Sanitation Department"; }
  else if (text.match(/tree|branch|fallen/)) { category = "Tree Hazard"; department = "Parks Department"; }
  else if (text.match(/road|street|pavement/)) { category = "Road Damage"; department = "Public Works"; }
  else if (text.match(/sewer|sewage|drain/)) { category = "Sewage"; department = "Water Authority"; }
  if (text.match(/critical|emergency|danger|urgent|severe/)) severity = "Critical";
  else if (text.match(/large|big|serious|bad|high/)) severity = "High";
  else if (text.match(/small|minor|little/)) severity = "Low";
  return { category, severity, department };
}

export async function analyzeIssueImage(base64Image, description) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI for CivicLens, a civic issue reporting platform.
Analyze this image and description: "${description}"
Respond ONLY with valid JSON, no markdown:
{"category":"Pothole","severity":"High","department":"Public Works","summary":"one sentence","recommendedAction":"one sentence"}
category: Pothole, Streetlight, Water Leakage, Garbage, Sewage, Road Damage, Tree Hazard, Other
severity: Low, Medium, High, Critical
department: Public Works, Electricity Board, Water Authority, Sanitation Department, Parks Department`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
    ]);
    const text = result.response.text();
    console.log("Gemini response:", text);
    const jsonMatch = text.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.log("Gemini error:", err.message);
  }
  const classified = smartClassify(description);
  return {
    ...classified,
    summary: description || "Community issue reported by citizen",
    recommendedAction: `${classified.department} should inspect and resolve this ${classified.category.toLowerCase()} issue promptly.`
  };
}

export async function generatePredictiveInsights(issues) {
  if (!issues.length) return {
    hotspot: "No data yet", topCategory: "No data yet",
    insight: "Submit more reports to generate insights.",
    recommendation: "Encourage citizens to report issues."
  };
  const locationCount = {}, categoryCount = {};
  issues.forEach(i => {
    const loc = i.location?.split(",")[0] || "Unknown";
    locationCount[loc] = (locationCount[loc] || 0) + 1;
    categoryCount[i.category] = (categoryCount[i.category] || 0) + 1;
  });
  const hotspot = Object.entries(locationCount).sort((a,b) => b[1]-a[1])[0]?.[0] || "Downtown";
  const topCategory = Object.entries(categoryCount).sort((a,b) => b[1]-a[1])[0]?.[0] || "Pothole";
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const summary = issues.slice(0,15).map(i => `${i.category} at ${i.location} (${i.status})`).join("\n");
    const prompt = `Community issues:\n${summary}\n\nRespond ONLY with JSON:
{"hotspot":"${hotspot}","topCategory":"${topCategory}","insight":"one predictive sentence","recommendation":"one action sentence"}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.log("Insights error:", err.message);
  }
  return {
    hotspot, topCategory,
    insight: `${hotspot} has the highest issue concentration. ${topCategory} is the most common problem.`,
    recommendation: `Prioritize ${topCategory.toLowerCase()} repairs in ${hotspot} and schedule preventive maintenance.`
  };
}