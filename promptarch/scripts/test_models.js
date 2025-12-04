import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log("Fetching available models...");
    // For some SDK versions, listModels might be on the client or a specific manager
    // The current SDK usually exposes it via the client or we can try a simple generation to test 'gemini-pro' as fallback
    
    // Note: The Node SDK might not have a direct listModels method exposed easily in all versions, 
    // but let's try to infer or test a standard one. 
    // Actually, the error message suggests "Call ListModels to see the list".
    // If the SDK doesn't support it directly, we might need to use REST.
    // Let's try a known stable model first in a test generation.
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Attempting generation with gemini-1.5-flash...");
    await model.generateContent("Test");
    console.log("Success with gemini-1.5-flash");

  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
    
    try {
        console.log("Attempting generation with gemini-1.5-flash-001...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        await model2.generateContent("Test");
        console.log("Success with gemini-1.5-flash-001");
    } catch(e2) {
        console.error("Error with gemini-1.5-flash-001:", e2.message);
        
        try {
            console.log("Attempting generation with gemini-pro...");
            const model3 = genAI.getGenerativeModel({ model: "gemini-pro" });
            await model3.generateContent("Test");
            console.log("Success with gemini-pro");
        } catch(e3) {
            console.error("Error with gemini-pro:", e3.message);
        }
    }
  }
}

listModels();
