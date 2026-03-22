import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:database.sqlite';
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url,
  authToken,
});

// Table initialization for local dev (remote tables should be created via Turso CLI or migration)
if (url.startsWith('file:')) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `).catch(console.error);

  db.execute(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      content TEXT DEFAULT '',
      type TEXT DEFAULT 'file',
      folder_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (folder_id) REFERENCES files(id) ON DELETE CASCADE
    );
  `).catch(console.error);
}

export default db;

