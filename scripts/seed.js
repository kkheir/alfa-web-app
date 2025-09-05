const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('database.db');

function seed() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      isAdmin BOOLEAN NOT NULL DEFAULT 0
    )
  `);

  const stmt = db.prepare('INSERT OR IGNORE INTO users (username, password, isAdmin) VALUES (?, ?, ?)');

  const adminPassword = bcrypt.hashSync('admin', 10);
  stmt.run('admin', adminPassword, 1);

  const userPassword = bcrypt.hashSync('user', 10);
  stmt.run('user', userPassword, 0);

  console.log('Database seeded with admin and regular user.');
  db.close();
}

seed();
