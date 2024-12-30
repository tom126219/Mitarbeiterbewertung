import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { app } from 'electron';

async function updateDatabaseSchema() {
  try {
    // Open the database
    const dbPath = app.getPath('userData') + '/database.sqlite';
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Check if the column exists
    const tableInfo = await db.all("PRAGMA table_info(employees)");
    const hasRequestedEvaluations = tableInfo.some(column => column.name === 'requestedEvaluations');

    if (!hasRequestedEvaluations) {
      // Add the missing column
      await db.run("ALTER TABLE employees ADD COLUMN requestedEvaluations INTEGER DEFAULT 0");
      console.log("Added 'requestedEvaluations' column to employees table");
    } else {
      console.log("'requestedEvaluations' column already exists");
    }

    // Close the database connection
    await db.close();

    console.log("Database schema update completed successfully");
  } catch (error) {
    console.error("Error updating database schema:", error);
  }
}

// Run the update function
updateDatabaseSchema();

