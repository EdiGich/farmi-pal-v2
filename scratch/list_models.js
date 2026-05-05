import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function listModels() {
  try {
    console.log("Attempting to list models...");
    // The @google/genai SDK might not have a direct .list() method on models 
    // that returns an array directly, or it might be paginated.
    const response = await ai.models.list();
    
    // In @google/genai, models.list() returns an object with a models property (usually)
    // or it might be an async iterator.
    
    console.log("Response structure:", JSON.stringify(response, null, 2).substring(0, 500));
    
    const models = response.pageInternal || response.models || response;
    
    if (Array.isArray(models)) {
        console.log("Available models:");
        models.forEach(m => {
            console.log(`- ${m.name}`);
        });
    } else {
        console.log("Full response keys:", Object.keys(response));
        console.log("Full response:", JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error("Failed to list models:", error.message);
  }
}

listModels();
