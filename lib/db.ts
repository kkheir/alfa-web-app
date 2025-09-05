import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/database.db' : 'database.db';
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isAdmin BOOLEAN NOT NULL DEFAULT 0
  )
`);

// Seed a default admin user if no admin exists
try {
  const adminCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE isAdmin = 1').get() as { count: number };
  if (adminCheck.count === 0) {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)').run('admin', hashedPassword, 1);
    console.log('Default admin user created.');
  }
} catch (error) {
  console.error('Failed to seed admin user:', error);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS imported_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    department TEXT,
    position TEXT,
    salary REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    target_audience TEXT NOT NULL,
    distribution_date DATE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'sent', 'cancelled')),
    recipient_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Database initialized.');

export {db};
