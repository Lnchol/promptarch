import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log("Fetching available models...");
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    console.log("Attempting generation with gemini-3.5-flash...");
    const response = await model.generateContent("Test");
    console.log("Success with gemini-3.5-flash! Response:", response.response.text());
  } catch (error) {
    console.error("Error with gemini-3.5-flash:", error.message);
  }
}

listModels();
