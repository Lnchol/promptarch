import admin from "firebase-admin";
import dotenv from 'dotenv';
import fs from 'fs';
import pathModule from 'path';
import { fileURLToPath } from 'url';

let __filename = '';
try {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    __filename = fileURLToPath(import.meta.url);
  }
} catch (e) {}

const __dirname = __filename ? pathModule.dirname(__filename) : (typeof __dirname !== 'undefined' ? __dirname : process.cwd());

dotenv.config({ path: pathModule.resolve(__dirname, '../.env') });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (serviceAccountPath) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(pathModule.resolve(process.cwd(), serviceAccountPath), 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error("Failed to load service account key:", error.message);
  }
} else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
} else {
  try {
    admin.initializeApp();
  } catch (e) {
    console.warn("⚠️ Firebase Admin not initialized: Missing credentials. Firestore and Auth services will be unavailable.");
  }
}

let db = null;
let auth = null;

if (admin.apps.length > 0) {
  try {
    db = admin.firestore();
  } catch (error) {
    console.error("⚠️ Failed to initialize Firestore:", error.message);
  }
  
  try {
    auth = admin.auth();
  } catch (error) {
    console.error("⚠️ Failed to initialize Firebase Auth:", error.message);
  }
}

export { db, auth };
