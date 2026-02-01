// scripts/initialize-db.mjs
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';

const projectRoot = path.resolve(process.cwd());
const dbPath = path.join(projectRoot, 'second-brain.db');

async function initializeDatabase() {
  console.log('Initializing Second Brain database...');
  
  // Check if DB already exists
  try {
    await fs.access(dbPath);
    console.log('Database already exists. Skipping initialization.');
    return;
  } catch (error) {
    console.log('Creating new database file...');
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('Creating tables...');
  await db.exec(`
    CREATE TABLE messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT,
      source TEXT NOT NULL, -- e.g., 'slack', 'openclaw_session'
      author TEXT NOT NULL, -- e.g., 'Kurtz', 'Hank'
      content TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      message_id_source TEXT -- The original ID from the source platform
    );

    CREATE TABLE tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE message_tags (
      message_id TEXT NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (message_id, tag_id),
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  console.log('Database schema created successfully.');
  
  // We can add dummy data here for testing later.

  await db.close();
  console.log('Database initialization complete.');
}

initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
