// Cleanup Test Accounts Script
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const SECRET_KEY = process.env.JWT_SECRET || "dev_fallback_secret_key_do_not_use_in_prod";
const ENCRYPTION_KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);

function hashData(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const db = new sqlite3.Database('./prompt_architect.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to database.\n');
});

async function cleanupTestAccounts() {
  console.log('🧹 Starting Database Cleanup...\n');
  
  const adminUsernameHash = hashData('admin');
  
  // Get counts before cleanup
  db.get(`SELECT COUNT(*) as count FROM users`, [], (err, result) => {
    const totalUsers = result.count;
    
    db.get(`SELECT COUNT(*) as count FROM users WHERE username_hash = ?`, [adminUsernameHash], (err, adminResult) => {
      const adminExists = adminResult.count > 0;
      
      if (!adminExists) {
        console.log('❌ ERROR: Admin account not found!');
        console.log('   Please run "node create_admin.js" first.\n');
        db.close();
        return;
      }
      
      console.log('📊 Current Database State:');
      console.log(`   Total Users: ${totalUsers}`);
      console.log(`   Admin Account: Found ✓\n`);
      
      // Get IDs of users to delete (all except admin)
      db.all(`SELECT id FROM users WHERE username_hash != ?`, [adminUsernameHash], (err, usersToDelete) => {
        if (usersToDelete.length === 0) {
          console.log('✓ No test accounts to delete. Database is clean!\n');
          db.close();
          return;
        }
        
        const userIds = usersToDelete.map(u => u.id);
        console.log(`🗑️  Deleting ${userIds.length} test account(s)...\n`);
        
        // Delete prompts for these users
        db.run(`DELETE FROM prompts WHERE user_id IN (${userIds.join(',')})`, [], function(err) {
          if (err) {
            console.error('Error deleting prompts:', err);
          } else {
            console.log(`   ✓ Deleted ${this.changes} prompts`);
          }
        });
        
        // Delete likes for these users
        db.run(`DELETE FROM likes WHERE user_id IN (${userIds.join(',')})`, [], function(err) {
          if (err) {
            console.error('Error deleting likes:', err);
          } else {
            console.log(`   ✓ Deleted ${this.changes} likes`);
          }
        });
        
        // Delete subscriptions for these users
        db.run(`DELETE FROM subscriptions WHERE user_id IN (${userIds.join(',')})`, [], function(err) {
          if (err) {
            console.error('Error deleting subscriptions:', err);
          } else {
            console.log(`   ✓ Deleted ${this.changes} subscriptions`);
          }
        });
        
        // Delete the users themselves
        db.run(`DELETE FROM users WHERE username_hash != ?`, [adminUsernameHash], function(err) {
          if (err) {
            console.error('Error deleting users:', err);
          } else {
            console.log(`   ✓ Deleted ${this.changes} user account(s)\n`);
          }
          
          // Final count
          db.get(`SELECT COUNT(*) as count FROM users`, [], (err, finalResult) => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Cleanup Complete!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`   Remaining Users: ${finalResult.count} (admin only)`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            db.close();
          });
        });
      });
    });
  });
}

cleanupTestAccounts();
