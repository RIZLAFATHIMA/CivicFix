import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'civic.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create users table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super-admin')),
      firstName TEXT,
      lastName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create issues table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('infrastructure', 'safety', 'environment', 'transportation', 'utilities', 'other')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in-progress', 'resolved', 'closed')),
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      reportedBy TEXT NOT NULL,
      reportedByUserId INTEGER,
      assignedTo TEXT,
      votes INTEGER DEFAULT 0,
      images TEXT, -- JSON array of image paths
      reporterAvatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reportedByUserId) REFERENCES users(id)
    )
  `);

  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}