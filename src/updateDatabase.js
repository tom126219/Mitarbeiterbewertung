const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

function updateDatabaseSchema() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      db.run(`ALTER TABLE employees ADD COLUMN requestedEvaluations INTEGER DEFAULT 0`, (err) => {
        if (err) {
          // If the error is because the column already exists, we can ignore it
          if (err.message.includes('duplicate column name')) {
            console.log('Column requestedEvaluations already exists');
            resolve();
          } else {
            console.error('Error adding requestedEvaluations column:', err);
            reject(err);
          }
        } else {
          console.log('Added requestedEvaluations column successfully');
          resolve();
        }
      });
    });
  });
}

module.exports = { updateDatabaseSchema };

