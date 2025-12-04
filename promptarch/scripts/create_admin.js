// Create Admin Account Script
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const SECRET_KEY = process.env.JWT_SECRET || "dev_fallback_secret_key_do_not_use_in_prod";
const ENCRYPTION_KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);
const IV_LENGTH = 16;

// Generate secure random password
function generateSecurePassword(length = 24) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function hashData(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const db = new sqlite3.Database('./prompt_architect.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to database.\n');
});

async function createAdminAccount() {
  const adminUsername = 'admin';
  const adminPassword = generateSecurePassword(24);
  
  console.log('🔐 Creating Admin Account...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  SAVE THESE CREDENTIALS SECURELY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Username: ${adminUsername}`);
  console.log(`Password: ${adminPassword}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const usernameHash = hashData(adminUsername);
  const usernameEnc = encrypt(adminUsername);
  
  // Check if admin already exists
  db.get(`SELECT * FROM users WHERE username_hash = ?`, [usernameHash], (err, existingAdmin) => {
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists. Updating password...\n');
      db.run(
        `UPDATE users SET password = ?, is_admin = 1, username = ? WHERE username_hash = ?`,
        [hashedPassword, usernameEnc, usernameHash],
        (err) => {
          if (err) {
            console.error('❌ Error updating admin account:', err);
          } else {
            console.log('✅ Admin account password updated successfully!\n');
            saveCredentialsToFile(adminUsername, adminPassword);
          }
          db.close();
        }
      );
    } else {
      db.run(
        `INSERT INTO users (username, username_hash, password, is_admin, is_pro, subscription_type) VALUES (?, ?, ?, 1, 1, 'admin')`,
        [usernameEnc, usernameHash, hashedPassword],
        function(err) {
          if (err) {
            console.error('❌ Error creating admin account:', err);
          } else {
            console.log('✅ Admin account created successfully!');
            console.log(`   User ID: ${this.lastID}\n`);
            saveCredentialsToFile(adminUsername, adminPassword);
          }
          db.close();
        }
      );
    }
  });
}

function saveCredentialsToFile(username, password) {
  const fs = require('fs');
  const credentialsContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN CREDENTIALS - KEEP THIS FILE SECURE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: ${new Date().toISOString()}

Username: ${username}
Password: ${password}

⚠️  WARNING: Delete this file after saving credentials to a password manager!
⚠️  This password cannot be recovered if lost!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  
  fs.writeFileSync('./ADMIN_CREDENTIALS.txt', credentialsContent);
  console.log('📝 Credentials saved to: ADMIN_CREDENTIALS.txt');
  console.log('⚠️  Remember to delete this file after saving to password manager!\n');
}

createAdminAccount();
