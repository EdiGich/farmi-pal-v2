import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: "Hi" }] }],
    });
    console.log(`✅ ${modelName} is working!`);
    // Check if response has text
    if (response.text) {
        console.log("Response:", response.text);
    } else {
        console.log("Response successful but no text field found. Full response:", JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error(`❌ ${modelName} failed:`, error.message);
  }
}

async function run() {
  await testModel("gemini-flash-lite-latest");
  await testModel("gemini-flash-latest");
  await testModel("gemini-2.0-flash-lite");
  await testModel("gemini-2.5-flash");
}

run();
