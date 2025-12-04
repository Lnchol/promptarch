import { createRequire } from "module";
const require = createRequire(import.meta.url);
const path = require('path');
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const result = require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
  console.error("Error loading .env:", result.error);
} else {
  console.log("Dotenv parsed keys:", Object.keys(result.parsed));
}

console.log("DEBUG: Env Vars Check");
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("FIREBASE_PRIVATE_KEY length:", process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0);

async function testFirebase() {
  // Dynamic import to ensure env vars are loaded first
  const { db, auth } = await import('../server/firebase.js');

  console.log("Testing Firebase Admin SDK...");
  
  try {
    console.log("Attempting to list users...");
    const listUsersResult = await auth.listUsers(1);
    console.log("Successfully listed users. Count:", listUsersResult.users.length);
    
    // console.log("Attempting to read from Firestore...");
    // const collections = await db.listCollections();
    // console.log("Successfully connected to Firestore. Collections:", collections.map(c => c.id));
    
    console.log("✅ Firebase Admin SDK verification SUCCESS!");
    process.exit(0);
  } catch (error) {
    const info = {
      message: error.message,
      code: error.code,
      stack: error.stack
    };
    fs.writeFileSync('error_summary.json', JSON.stringify(info, null, 2));
    console.error("❌ Firebase Admin SDK verification FAILED:", error);
    process.exit(1);
  }
}

testFirebase();
