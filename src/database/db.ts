import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Stellen Sie sicher, dass dies im Hauptprozess ausgeführt wird
const getUserDataPath = () => {
  if (process.type === 'renderer') {
    throw new Error('This module must be run in the main process');
  }
  return app.getPath('userData');
};

const dbPath = path.join(getUserDataPath(), 'database.sqlite');

const db = new Database(dbPath, { verbose: console.log });

// Erstellen der Tabelle, falls sie nicht existiert
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    hireDate TEXT NOT NULL
  )
`);

export default db;

