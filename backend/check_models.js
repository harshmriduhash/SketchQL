require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("🔑 Authentication successful...");
    console.log("📡 Fetching available models for your API key...");
    
    // This lists ONLY the models your key has permission to see
    const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey ? "Authorized" : "Unknown"; 
    
    // Note: The SDK wrapper sometimes hides the 'listModels' method. 
    // We will try to hit the models endpoint directly or test common ones.
    
    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro",
    ];

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const test = await model.generateContent("Hello");
            console.log(`✅ AVAILABLE: ${modelName}`);
        } catch (error) {
            if (error.message.includes("404")) {
                console.log(`❌ NOT FOUND: ${modelName}`);
            } else {
                console.log(`⚠️ ERROR (${modelName}): ${error.message.split('[')[0]}`);
            }
        }
    }

  } catch (error) {
    console.error("Global Error:", error.message);
  }
}

listModels();