import admin from "firebase-admin";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin
// You must provide the path to your service account key JSON file in .env
// OR provide the credentials as environment variables
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (serviceAccountPath) {
  import('fs').then(fs => {
    import('path').then(pathModule => {
      const serviceAccount = JSON.parse(fs.readFileSync(pathModule.resolve(process.cwd(), serviceAccountPath), 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    });
  });
} else {
  // Fallback: Try to use individual env vars (useful for deployment platforms)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else {
    console.warn("⚠️ Firebase Admin not initialized: Missing credentials.");
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
