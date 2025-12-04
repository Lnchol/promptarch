// Force cleanup - Delete all users except admin
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./prompt_architect.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to database.\n');
});

console.log('🧹 Force Cleanup - Removing ALL non-admin accounts...\n');

// Delete all non-admin users and their data
db.all(`SELECT id FROM users WHERE is_admin != 1 OR is_admin IS NULL`, [], (err, users) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  if (users.length === 0) {
    console.log('✓ No non-admin users to delete.\n');
    db.close();
    return;
  }
  
  const userIds = users.map(u => u.id).join(',');
  console.log(`Found ${users.length} non-admin user(s) to delete: IDs [${userIds}]\n`);
  
  // Delete prompts
  db.run(`DELETE FROM prompts WHERE user_id IN (${userIds})`, function(err) {
    if (err) console.error('Error deleting prompts:', err);
    else console.log(`✓ Deleted ${this.changes} prompts`);
  });
  
  // Delete likes
  db.run(`DELETE FROM likes WHERE user_id IN (${userIds})`, function(err) {
    if (err) console.error('Error deleting likes:', err);
    else console.log(`✓ Deleted ${this.changes} likes`);
  });
  
  // Delete subscriptions
  db.run(`DELETE FROM subscriptions WHERE user_id IN (${userIds})`, function(err) {
    if (err) console.error('Error deleting subscriptions:', err);
    else console.log(`✓ Deleted ${this.changes} subscriptions`);
  });
  
  // Delete users
  db.run(`DELETE FROM users WHERE is_admin != 1 OR is_admin IS NULL`, function(err) {
    if (err) console.error('Error deleting users:', err);
    else {
      console.log(`✓ Deleted ${this.changes} user account(s)\n`);
      
      // Final count
      db.get(`SELECT COUNT(*) as count FROM users`, [], (err, result) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Force Cleanup Complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Remaining Users: ${result.count} (admin only)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        db.close();
      });
    }
  });
});
