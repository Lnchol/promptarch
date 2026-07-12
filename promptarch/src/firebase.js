import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration missing. Check environment variables.");
}

// Enable debug mode for localhost BEFORE initializing Firebase
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const app = initializeApp(firebaseConfig);

// Initialize App Check with ReCAPTCHA Enterprise only if a valid site key is provided
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
let appCheck = null;

if (siteKey && siteKey !== 'YOUR_RECAPTCHA_ENTERPRISE_SITE_KEY') {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true
  });
} else {
  console.log("ℹ️ Firebase App Check skipped: No valid VITE_RECAPTCHA_SITE_KEY provided.");
}

export const auth = getAuth(app);
export const db = getFirestore(app);


