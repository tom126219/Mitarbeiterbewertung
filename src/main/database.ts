import Database from 'better-sqlite3';
import path from 'path';
import { app, ipcMain } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
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

// IPC Handler für Datenbankoperationen
ipcMain.handle('db-get-all-employees', () => {
  const stmt = db.prepare('SELECT * FROM employees');
  return stmt.all();
});

ipcMain.handle('db-add-employee', (_, employee) => {
  const stmt = db.prepare('INSERT INTO employees (name, position, department, hireDate) VALUES (?, ?, ?, ?)');
  const info = stmt.run(employee.name, employee.position, employee.department, employee.hireDate);
  return { id: info.lastInsertRowid, ...employee };
});

ipcMain.handle('db-delete-employee', (_, id) => {
  const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
  return stmt.run(id);
});

ipcMain.handle('db-get-total-employees', () => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM employees');
  return stmt.get().count;
});

