// Quick script to inspect the database
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./prompt_architect.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to database.\n');
});

// Get schema
db.all("SELECT sql FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('=== TABLES SCHEMA ===');
  tables.forEach(t => console.log(t.sql + ';\n'));
});

// Get all users
db.all("SELECT * FROM users", [], (err, users) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('\n=== CURRENT USERS ===');
  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`\nID: ${u.id}`);
    console.log(`Username: ${u.username}`);
    console.log(`Username Hash: ${u.username_hash}`);
    console.log(`Is Pro: ${u.is_pro}`);
    console.log(`Subscription: ${u.subscription_type}`);
  });
  
  // Get prompts count
  db.all("SELECT COUNT(*) as count FROM prompts", [], (err, count) => {
    console.log(`\n=== PROMPTS ===`);
    console.log(`Total prompts: ${count[0].count}`);
    db.close();
  });
});
