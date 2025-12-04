// Generate secure JWT secret
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const crypto = require('crypto');

const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n🔐 New JWT Secret Generated:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(jwtSecret);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Add this to your .env file:');
console.log(`JWT_SECRET=${jwtSecret}\n`);
