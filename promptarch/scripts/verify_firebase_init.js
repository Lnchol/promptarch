import { db, auth } from '../server/firebase.js';

console.log("Firebase initialized successfully!");
console.log("DB:", !!db);
console.log("Auth:", !!auth);
process.exit(0);
