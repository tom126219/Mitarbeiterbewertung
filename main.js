const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log');
const fs = require('fs');
const PDFDocument = require('pdfkit');
require('dotenv').config();
const { updateDatabaseSchema } = require('./src/updateDatabase');
const categories = require('./src/categories');

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'info';

console.log = log.log;
console.error = log.error;
console.warn = log.warn;
console.info = log.info;

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, 'Dist', 'index.html'),
    protocol: 'file:',
    slashes: true
  });

  console.log('Loading URL:', startUrl);
  console.log('Current working directory:', process.cwd());
  console.log('__dirname:', __dirname);

  fs.access(path.join(__dirname, 'Dist', 'index.html'), fs.constants.F_OK, (err) => {
    console.log('Can access index.html:', !err);
  });

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database opening error: ', err);
        reject(err);
      } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
          // Create employees table
          db.run(`CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            beruf TEXT,
            sparte TEXT,
            hireDate TEXT,
            evaluationCount INTEGER DEFAULT 0,
            requestedEvaluations INTEGER DEFAULT 0
          )`, (err) => {
            if (err) {
              console.error('Error creating employees table', err);
              reject(err);
            } else {
              console.log('Employees table created or already exists.');
            }
          });

          // Create activities table
          db.run(`CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            employeeName TEXT NOT NULL,
            timestamp TEXT NOT NULL
          )`, (err) => {
            if (err) {
              console.error('Error creating activities table', err);
              reject(err);
            } else {
              console.log('Activities table created or already exists.');
            }
          });

          // Create evaluations table
          db.run(`CREATE TABLE IF NOT EXISTS evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId INTEGER NOT NULL,
            employeeName TEXT NOT NULL,
            date TEXT NOT NULL,
            workLocation TEXT,
            jobRole TEXT,
            specificTask TEXT,
            scores TEXT,
            totalScore INTEGER,
            comment TEXT,
            FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
          )`, (err) => {
            if (err) {
              console.error('Error creating evaluations table:', err);
              reject(err);
            } else {
              console.log('Evaluations table created or already exists.');
            }
          });

          resolve();
        });
      }
    });
  });
}

function setupIpcHandlers() {
  ipcMain.handle('get-all-employees', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM employees', (err, rows) => {
        if (err) {
          console.error('Error fetching employees:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('add-employee', async (_, employee) => {
    return new Promise((resolve, reject) => {
      const { name, beruf, sparte, hireDate } = employee;
      db.run(
        'INSERT INTO employees (name, beruf, sparte, hireDate) VALUES (?, ?, ?, ?)',
        [name, beruf, sparte, hireDate],
        function (err) {
          if (err) {
            console.error('Error adding employee:', err);
            reject(err);
          } else {
            resolve({ id: this.lastID, ...employee });
          }
        }
      );
    });
  });

  ipcMain.handle('update-employee', async (_, employee) => {
    return new Promise((resolve, reject) => {
      const { id, name, beruf, sparte, hireDate } = employee;
      db.run(
        'UPDATE employees SET name = ?, beruf = ?, sparte = ?, hireDate = ? WHERE id = ?',
        [name, beruf, sparte, hireDate, id],
        (err) => {
          if (err) {
            console.error('Error updating employee:', err);
            reject(err);
          } else {
            resolve(employee);
          }
        }
      );
    });
  });

  ipcMain.handle('delete-employee', async (_, id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM employees WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting employee:', err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  });

  ipcMain.handle('get-all-requested-evaluations', async () => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.all('SELECT id, requestedEvaluations FROM employees', (err, rows) => {
          if (err) {
            console.error('Error getting all requested evaluations:', err);
            reject(err);
          } else {
            const requestedEvaluations = rows.reduce((acc, row) => {
              acc[row.id] = row.requestedEvaluations || 0;
              return acc;
            }, {});
            console.log('Retrieved all requested evaluations:', requestedEvaluations);
            resolve(requestedEvaluations);
          }
        });
      });
      return result;
    } catch (error) {
      console.error('Error occurred in handler for \'get-all-requested-evaluations\':', error);
      throw error;
    }
  });

  ipcMain.handle('db-increment-evaluation-count', (event, employeeId) => {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE employees SET evaluationCount = evaluationCount + 1 WHERE id = ?`, [employeeId], function (err) {
        if (err) {
          console.error('Error incrementing evaluation count:', err);
          reject(err);
        } else {
          console.log(`Incremented evaluation count for employee ${employeeId}`);
          resolve(true);
        }
      });
    });
  });

  ipcMain.handle('update-counters-after-import', (event, employeeId) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM employees WHERE id = ?`, [employeeId], (err, row) => {
        if (err) {
          console.error('Error getting updated employee:', err);
          reject(err);
        } else {
          console.log('Fetched updated employee:', row);
          resolve({ success: true, employee: row });
        }
      });
    });
  });

  ipcMain.handle('add-activity', (event, activity) => {
    return new Promise((resolve, reject) => {
      const { type, employeeName, timestamp } = activity;
      db.run(`INSERT INTO activities (type, employeeName, timestamp) VALUES (?, ?, ?)`, [type, employeeName, timestamp.toISOString()], function (err) {
        if (err) {
          console.error('Error adding activity:', err);
          reject(err);
        } else {
          console.log('Activity added:', activity);
          resolve({ success: true });
        }
      });
    });
  });

  ipcMain.handle('get-evaluations-for-employee', (event, employeeId) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM evaluations WHERE employeeId = ? ORDER BY date DESC`, [employeeId], (err, rows) => {
        if (err) {
          console.error(`Error getting evaluations for employee ${employeeId}:`, err);
          reject(err);
        } else {
          console.log(`Evaluations for employee ${employeeId}:`, rows);
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('export-evaluations-pdf', async (event, employeeId, employeeName) => {
    try {
      const evaluations = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM evaluations WHERE employeeId = ?`, [employeeId], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      const doc = new PDFDocument();
      const fileName = `Bewertungen_${employeeName}_${new Date().toLocaleDateString('de-DE').replace(/\./g, '-')}.pdf`;
      const filePath = path.join(app.getPath('documents'), 'Mitarbeiterbewertungen', fileName);
      
      // Ensure the directory exists
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);
      doc.fontSize(20).text(`Bewertungen für ${employeeName}`, { align: 'center' });

      evaluations.forEach(evaluation => {
        doc.addPage();
        doc.fontSize(16).text(`Bewertung vom ${new Date(evaluation.date).toLocaleDateString('de-DE')}`);
        doc.fontSize(12).moveDown();
        for (const key in evaluation) {
          if (evaluation.hasOwnProperty(key) && key !== 'id' && key !== 'employeeId') {
            doc.text(`${key}: ${evaluation[key]}`);
          }
        }
      });

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log('PDF generated successfully:', filePath);
          resolve({ success: true, filePath });
        });

        stream.on('error', (err) => {
          console.error('Error generating PDF:', err);
          reject({ success: false, error: err.message });
        });
      });
    } catch (error) {
      console.error('Error exporting evaluations to PDF:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-evaluation', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (filePaths && filePaths.length > 0) {
        const filePath = filePaths[0];
        const data = await fs.promises.readFile(filePath, 'utf8');
        return { success: true, data };
      } else {
        return { success: false, error: 'No file selected' };
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-evaluation', async (event, { data, suggestedFileName }) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: suggestedFileName,
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (filePath) {
        await fs.promises.writeFile(filePath, data);
        return { success: true, filePath };
      } else {
        return { success: false, error: 'No file path selected' };
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('export-blank-evaluation-form', async (event, formData) => {
    try {
      const { employeeName, categories, workLocation, jobRole, specificTask } = formData;
      const fileName = `Bewertungsbogen_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      const filePath = path.join(app.getPath('documents'), 'Mitarbeiterbewertungen', fileName);

      // Ensure the directory exists
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

      let htmlContent = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bewertungsbogen für ${employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .category { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; }
            select, input[type="text"], textarea { width: 100%; padding: 5px; margin-bottom: 10px; }
            button { padding: 10px; background-color: #007bff; color: white; border: none; cursor: pointer; }
            button:hover { background-color: #0056b3; }
          </style>
        </head>
        <body>
          <h1>Bewertungsbogen für ${employeeName}</h1>
          <form id="evaluationForm">
            <div class="category">
              <label for="workLocation">Arbeitsort:</label>
              <input type="text" id="workLocation" name="workLocation" value="${workLocation}" required>
              
              <label for="jobRole">Tätigkeit:</label>
              <input type="text" id="jobRole" name="jobRole" value="${jobRole}" required>
              
              <label for="specificTask">Spezifische Aufgabe:</label>
              <input type="text" id="specificTask" name="specificTask" value="${specificTask}" required>
            </div>
      `;

      categories.forEach(category => {
        htmlContent += `
          <div class="category">
            <h3>${category.name} (Max. ${category.maxPoints} Punkte)</h3>
            <select name="${category.id}" required>
              <option value="">Bitte wählen</option>
              ${category.options.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
            </select>
          </div>
        `;
      });

      htmlContent += `
            <div class="category">
              <label for="comment">Kommentar:</label>
              <textarea id="comment" name="comment" rows="4"></textarea>
            </div>
            <button type="submit">Bewertung einreichen</button>
          </form>
        </body>
        </html>
      `;

      await fs.promises.writeFile(filePath, htmlContent);
      return { success: true, filePath };
    } catch (error) {
      console.error('Error exporting blank evaluation form:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db-get-total-employees', async () => {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM employees', (err, row) => {
        if (err) {
          console.error('Error getting total employees:', err);
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  });

  ipcMain.handle('db-get-latest-activities', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 3', (err, rows) => {
        if (err) {
          console.error('Error getting latest activities:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('increment-requested-evaluations', async (event, employeeId) => {
    try {
      console.log('Incrementing requested evaluations for employee:', employeeId);
      const result = await new Promise((resolve, reject) => {
        db.run(`UPDATE employees SET requestedEvaluations = requestedEvaluations + 1 WHERE id = ?`, [employeeId], function (err) {
          if (err) {
            console.error('Error incrementing requested evaluations:', err);
            reject(err);
          } else {
            console.log('Requested evaluations incremented successfully');
            // Fetch the updated employee data
            db.get('SELECT * FROM employees WHERE id = ?', [employeeId], (err, row) => {
              if (err) {
                console.error('Error fetching updated employee:', err);
                reject(err);
              } else {
                resolve({ success: true, employee: row });
              }
            });
          }
        });
      });
      return result;
    } catch (error) {
      console.error('Error occurred in handler for \'increment-requested-evaluations\':', error);
      return { success: false, error: error.message };
    }
  });
}

app.on('ready', async () => {
  console.log('App is ready');
  try {
    await initializeDatabase();
    const schemaUpdated = await updateDatabaseSchema();
    if (schemaUpdated) {
      console.log('Database schema updated successfully.');
    }
    setupIpcHandlers();
    createWindow();
    console.log('Application started successfully');
  } catch (error) {
    console.error('Error during app initialization:', error);
    app.quit();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  app.quit();
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('restart_app', () => {
  app.relaunch();
  app.exit();
});

app.on('before-quit', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err);
      } else {
        console.log('Database connection closed successfully');
      }
    });
  }
});

