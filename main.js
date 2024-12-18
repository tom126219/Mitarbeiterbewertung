const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log');
const fs = require('fs');
const PDFDocument = require('pdfkit');
require('dotenv').config();

log.transports.file.level = 'info';
log.transports.console.level = 'info';

console.log = log.log;
console.error = log.error;
console.warn = log.warn;
console.info = log.info;

let mainWindow;
let db;

function createWindow() {
  console.log('Creating window...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Only for development
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Initializing database...');
    const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
    console.log('Database path:', dbPath);

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Database connected successfully');
      
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            beruf TEXT NOT NULL,
            sparte TEXT NOT NULL,
            hireDate TEXT NOT NULL,
            evaluationCount INTEGER DEFAULT 0
          )
        `, (err) => {
          if (err) {
            console.error('Error creating employees table:', err);
            reject(err);
          } else {
            console.log('Employees table created or already exists');
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId INTEGER NOT NULL,
            employeeName TEXT NOT NULL,
            workLocation TEXT NOT NULL,
            jobRole TEXT NOT NULL,
            specificTask TEXT NOT NULL,
            scores TEXT NOT NULL,
            comment TEXT,
            totalScore INTEGER NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (employeeId) REFERENCES employees(id)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating evaluations table:', err);
            reject(err);
          } else {
            console.log('Evaluations table created or already exists');
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            employeeName TEXT NOT NULL,
            timestamp TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('Error creating activities table:', err);
            reject(err);
          } else {
            console.log('Activities table created or already exists');
            resolve();
          }
        });
      });
    });
  });
}

function setupIpcHandlers() {
  console.log('Setting up IPC handlers...');

  ipcMain.handle('db-get-all-employees', () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, beruf, sparte, hireDate, evaluationCount FROM employees', (err, rows) => {
        if (err) {
          console.error('Error in db-get-all-employees:', err);
          reject(err);
        } else {
          console.log('Retrieved employees:', rows);
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('db-add-employee', (_, employee) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO employees (name, beruf, sparte, hireDate, evaluationCount) VALUES (?, ?, ?, ?, 0)');
      stmt.run(employee.name, employee.beruf, employee.sparte, employee.hireDate, function(err) {
        if (err) {
          console.error('Error in db-add-employee:', err);
          reject(err);
        } else {
          const newEmployee = { id: this.lastID, ...employee };
          console.log('Employee added successfully:', newEmployee);
          
          // Add activity for new employee
          const activityStmt = db.prepare('INSERT INTO activities (type, employeeName, timestamp) VALUES (?, ?, ?)');
          activityStmt.run('Neuer Mitarbeiter hinzugefügt', employee.name, new Date().toISOString(), (actErr) => {
            if (actErr) {
              console.error('Error adding activity:', actErr);
            } else {
              console.log('Activity added for new employee');
            }
          });
          
          resolve(newEmployee);
        }
      });
    });
  });

  ipcMain.handle('db-update-employee', (_, employee) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE employees SET name = ?, beruf = ?, sparte = ?, hireDate = ? WHERE id = ?', 
        [employee.name, employee.beruf, employee.sparte, employee.hireDate, employee.id], 
        function(err) {
          if (err) {
            console.error('Error in db-update-employee:', err);
            reject(err);
          } else {
            console.log('Employee updated successfully:', employee);
            
            // Add activity for updated employee
            const activityStmt = db.prepare('INSERT INTO activities (type, employeeName, timestamp) VALUES (?, ?, ?)');
            activityStmt.run('Mitarbeiter aktualisiert', employee.name, new Date().toISOString(), (actErr) => {
              if (actErr) {
                console.error('Error adding activity:', actErr);
              } else {
                console.log('Activity added for updated employee');
              }
            });
            
            // Fetch the updated employee data, including the correct evaluation count
            db.get('SELECT * FROM employees WHERE id = ?', [employee.id], (err, row) => {
              if (err) {
                console.error('Error fetching updated employee:', err);
                reject(err);
              } else {
                resolve(row);
              }
            });
          }
        }
      );
    });
  });

  ipcMain.handle('db-delete-employee', (_, id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM employees WHERE id = ?', id, function(err) {
        if (err) {
          console.error('Error in db-delete-employee:', err);
          reject(err);
        } else {
          console.log('Delete result:', this.changes);
          resolve(this.changes);
        }
      });
    });
  });

  ipcMain.handle('db-get-total-employees', () => {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM employees', (err, row) => {
        if (err) {
          console.error('Error in db-get-total-employees:', err);
          reject(err);
        } else {
          console.log('Total employees:', row.count);
          resolve(row.count);
        }
      });
    });
  });

  ipcMain.handle('db-increment-evaluation-count', (_, employeeId) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE employees SET evaluationCount = evaluationCount + 1 WHERE id = ?', employeeId, function(err) {
        if (err) {
          console.error('Error incrementing evaluation count:', err);
          reject(err);
        } else {
          console.log('Evaluation count incremented for employee:', employeeId);
          resolve(this.changes);
        }
      });
    });
  });

  ipcMain.handle('save-evaluation', async (_, { data, suggestedFileName }) => {
    try {
      const evaluationData = JSON.parse(data);

      const { filePath } = await dialog.showSaveDialog({
        title: 'Bewertung speichern',
        defaultPath: path.join(app.getPath('documents'), 'Mitarbeiterbewertungen', suggestedFileName),
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (filePath) {
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, JSON.stringify(evaluationData, null, 2));
        console.log('Evaluation saved successfully:', filePath);
        return { success: true, filePath };
      } else {
        return { success: false, error: 'Kein Dateipfad ausgewählt' };
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-evaluation', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Bewertung laden',
        defaultPath: path.join(app.getPath('documents'), 'Mitarbeiterbewertungen'),
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
      });

      if (filePaths && filePaths.length > 0) {
        const jsonData = await fs.promises.readFile(filePaths[0], 'utf-8');
        return { success: true, data: jsonData };
      } else {
        return { success: false, error: 'Keine Datei ausgewählt' };
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('add-activity', (_, activity) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO activities (type, employeeName, timestamp) VALUES (?, ?, ?)');
      stmt.run(activity.type, activity.employeeName, activity.timestamp, function(err) {
        if (err) {
          console.error('Error adding activity:', err);
          reject(err);
        } else {
          console.log('Activity added successfully:', this.lastID);
          resolve({ success: true, id: this.lastID });
        }
      });
    });
  });

  ipcMain.handle('db-get-latest-activities', () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 2', (err, rows) => {
        if (err) {
          console.error('Error in db-get-latest-activities:', err);
          reject(err);
        } else {
          console.log('Retrieved latest activities:', rows);
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('get-evaluations-for-employee', (_, employeeId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM evaluations WHERE employeeId = ? ORDER BY date DESC', employeeId, (err, rows) => {
        if (err) {
          console.error('Error in get-evaluations-for-employee:', err);
          reject(err);
        } else {
          console.log('Retrieved evaluations for employee:', rows);
          resolve(rows.map(row => ({
            ...row,
            scores: JSON.parse(row.scores)
          })));
        }
      });
    });
  });

  ipcMain.handle('save-html', async (_, { content, employeeName }) => {
    try {
      const defaultPath = path.join(app.getPath('documents'), `Mitarbeiterbewertung_${employeeName.replace(/\s+/g, '_')}.html`);
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: defaultPath,
        filters: [{ name: 'HTML Files', extensions: ['html'] }]
      });

      if (filePath) {
        fs.writeFileSync(filePath, content);
        return { success: true };
      } else {
        return { success: false, error: 'No file path selected' };
      }
    } catch (error) {
      console.error('Error saving HTML file:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('sync-evaluation-count', (_, employeeId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM evaluations WHERE employeeId = ?', [employeeId], (err, row) => {
        if (err) {
          console.error('Error counting evaluations:', err);
          reject(err);
        } else {
          const newCount = row.count;
          db.run('UPDATE employees SET evaluationCount = ? WHERE id = ?', [newCount, employeeId], function(err) {
            if (err) {
              console.error('Error updating evaluationCount:', err);
              reject(err);
            } else {
              console.log('EvaluationCount synced for employee:', employeeId, 'New count:', newCount);
              resolve({ success: true, newCount: newCount });
            }
          });
        }
      });
    });
  });

  ipcMain.handle('export-evaluations-pdf', async (_, employeeId, employeeName) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM evaluations WHERE employeeId = ? ORDER BY date DESC', employeeId, async (err, evaluations) => {
        if (err) {
          console.error('Error fetching evaluations:', err);
          reject(err);
          return;
        }

        try {
          const { filePath } = await dialog.showSaveDialog({
            title: 'PDF speichern',
            defaultPath: path.join(app.getPath('documents'), `${employeeName}_Bewertungen.pdf`),
            filters: [{ name: 'PDF Dateien', extensions: ['pdf'] }]
          });

          if (filePath) {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Define colors
            const primaryColor = '#1a73e8';
            const textColor = '#202124';
            const lightGray = '#f8f9fa';

            // Define categories with explanations
            const categories = [
              { id: 'fachlicheKompetenz', name: 'Fachliche Kompetenz', maxPoints: 10, explanations: {
                '10': 'Exzellent: Beherrscht alle relevanten Technologien und Problemlösungen',
                '8': 'Gut: Gute technische Fähigkeiten, geringe Unterstützung erforderlich',
                '6': 'Befriedigend: Durchschnittliche technische Fähigkeiten, gelegentlich Unterstützung erforderlich',
                '4': 'Ausreichend: Grundlegende Fähigkeiten, häufig Unterstützung erforderlich',
                '2': 'Unzureichend: Fachliche Defizite, regelmäßige Unterstützung erforderlich'
              }},
              { id: 'zuverlaessigkeit', name: 'Zuverlässigkeit', maxPoints: 10, explanations: {
                '10': 'Exzellent: Immer pünktlich, hält alle Termine ein',
                '8': 'Gut: Meist pünktlich, kleine Verspätungen',
                '6': 'Befriedigend: Gelegentliche Verspätungen, manchmal Terminänderungen',
                '4': 'Ausreichend: Häufige Verspätungen, öfter nicht erreichbar',
                '2': 'Unzureichend: Unzuverlässig, oft nicht erreichbar'
              }},
              { id: 'qualitaetAusfuehrung', name: 'Qualität der Ausführung', maxPoints: 10, explanations: {
                '10': 'Exzellent: Hohe Präzision, keine Nacharbeit erforderlich',
                '8': 'Gut: Gute Ausführung, minimale Nacharbeit erforderlich',
                '6': 'Befriedigend: Durchschnittliche Ausführung, gelegentliche Nacharbeit erforderlich',
                '4': 'Ausreichend: Häufige Nacharbeit erforderlich',
                '2': 'Unzureichend: Hohe Fehlerquote, häufige Nacharbeit erforderlich'
              }},
              { id: 'dokumentation', name: 'Dokumentation und Berichtswesen', maxPoints: 10, explanations: {
                '10': 'Exzellent: Vollständige, präzise und zeitnahe Dokumentation',
                '8': 'Gut: Gute Dokumentation, geringe Nachbesserungen erforderlich',
                '6': 'Befriedigend: Durchschnittliche Dokumentation, gelegentliche Unvollständigkeiten',
                '4': 'Ausreichend: Unvollständige Dokumentation, regelmäßige Nachbesserungen erforderlich',
                '2': 'Unzureichend: Unvollständige oder fehlerhafte Dokumentation'
              }},
              { id: 'zusammenarbeit', name: 'Zusammenarbeit im Team', maxPoints: 15, explanations: {
                '15': 'Exzellent: Hervorragende Zusammenarbeit und Unterstützung für Kollegen',
                '10': 'Gut: Gute Zusammenarbeit, gelegentliche Unterstützung erforderlich',
                '6': 'Befriedigend: Durchschnittliche Zusammenarbeit, gelegentliche Konflikte',
                '4': 'Ausreichend: Häufige Schwierigkeiten bei der Zusammenarbeit',
                '2': 'Unzureichend: Schwierigkeiten bei der Teamarbeit, wenig Unterstützung'
              }},
              { id: 'kommunikation', name: 'Kommunikationsfähigkeiten', maxPoints: 10, explanations: {
                '10': 'Exzellent: Klare, präzise und effektive Kommunikation',
                '8': 'Gut: Gute Kommunikation, geringe Missverständnisse',
                '6': 'Befriedigend: Durchschnittliche Kommunikation, gelegentliche Missverständnisse',
                '4': 'Ausreichend: Häufige Missverständnisse, Verbesserung erforderlich',
                '2': 'Unzureichend: Unklare Kommunikation, häufige Missverständnisse'
              }},
              { id: 'konfliktmanagement', name: 'Konfliktmanagement', maxPoints: 10, explanations: {
                '10': 'Exzellent: Sehr guter Umgang mit Konflikten, konstruktive Lösungen',
                '8': 'Gut: Guter Umgang mit Konflikten, Lösungen und Deeskalationen',
                '6': 'Befriedigend: Frühzeitige Wahrnehmung von Konflikten, aktives Gegensteuern',
                '4': 'Ausreichend: Durchschnittlicher Umgang, Konflikte werden hin und wieder gelöst',
                '2': 'Unzureichend: Schlechter Umgang, Eskalationen werden häufig nicht vermieden'
              }},
              { id: 'selbststaendigkeit', name: 'Selbstständigkeit und Problemlösungsfähigkeiten', maxPoints: 10, explanations: {
                '10': 'Exzellent: Hohe Selbstständigkeit, proaktive Problemlösung',
                '8': 'Gut: Gute Selbstständigkeit, schnelle Problemlösung',
                '6': 'Befriedigend: Durchschnittliche Selbstständigkeit, gelegentliche Unterstützung erforderlich',
                '4': 'Ausreichend: Häufige Unterstützung erforderlich, geringe Initiative',
                '2': 'Unzureichend: Geringe Selbstständigkeit, wenig Initiative'
              }},
              { id: 'vorschriften', name: 'Einhalten von Vorschriften und Richtlinien', maxPoints: 15, explanations: {
                '15': 'Exzellent: Strikte Einhaltung aller Vorschriften und Richtlinien',
                '10': 'Gut: Geringfügige Abweichungen, insgesamt gute Einhaltung',
                '6': 'Befriedigend: Durchschnittliche Einhaltung, gelegentliche Verstöße',
                '4': 'Ausreichend: Häufige Verstöße gegen Vorschriften',
                '2': 'Unzureichend: Regelmäßige Verstöße, erheblicher Verbesserungsbedarf'
              }},
            ];

            evaluations.forEach((evaluation, index) => {
              if (index > 0) {
                doc.addPage();
              }

              // Header
              doc.font('Helvetica-Bold').fontSize(16).fillColor(primaryColor)
                .text('Mitarbeiterbewertung', 40, 40);
              
              // Employee info section
              doc.font('Helvetica').fontSize(10).fillColor(textColor)
                .text(`Mitarbeiter: ${employeeName}`, 40, 65)
                .text(`Bewertung vom ${new Date(evaluation.date).toLocaleDateString('de-DE')}`, 40, 80)
                .text(`Arbeitsort: ${evaluation.workLocation}`, 40, 95)
                .text(`Tätigkeit: ${evaluation.jobRole}`, 250, 95)
                .text(`Spezifische Aufgabe: ${evaluation.specificTask}`, 40, 110);

              // Categories
              const scores = JSON.parse(evaluation.scores);
              let yPosition = 140;

              categories.forEach(category => {
                const score = scores[category.id] || 0;
                const explanation = category.explanations[score.toString()] || 'Keine Bewertung';

                // Category background
                doc.rect(40, yPosition, 515, 45).fill(lightGray);
                
                // Category header with score
                doc.font('Helvetica-Bold').fontSize(11).fillColor(textColor)
                  .text(category.name, 50, yPosition + 10)
                  .text(`${score}/${category.maxPoints}`, 500, yPosition + 10, { align: 'right' });

                // Explanation text
                doc.font('Helvetica').fontSize(9).fillColor(textColor)
                  .text(explanation, 50, yPosition + 25, { width: 490 });

                yPosition += 50;
              });

              // Total score
              doc.rect(40, yPosition, 515, 30).fill(primaryColor);
              doc.font('Helvetica-Bold').fontSize(12).fillColor('white')
                .text(`Gesamtpunktzahl: ${evaluation.totalScore} / 100`, 50, yPosition + 8, { align: 'center' });

              // Comment section
              if (evaluation.comment && evaluation.comment.trim()) {
                yPosition += 40;
                doc.font('Helvetica-Bold').fontSize(11).fillColor(textColor)
                  .text('Kommentar:', 40, yPosition);
                doc.font('Helvetica').fontSize(9)
                  .text(evaluation.comment, 40, yPosition + 20, { width: 515 });
              }

              // Footer
              doc.font('Helvetica').fontSize(8).fillColor(textColor)
                .text(`Erstellt am ${new Date().toLocaleString('de-DE')}`, 40, 780, { align: 'center', width: 515 });
            });

            doc.end();

            stream.on('finish', () => {
              resolve({ success: true, filePath });
            });
          } else {
            resolve({ success: false, error: 'Kein Dateipfad ausgewählt' });
          }
        } catch (error) {
          console.error('Error exporting PDF:', error);
          reject(error);
        }
      });
    });
  });

  ipcMain.handle('export-blank-evaluation-form', async (_, { employeeName, categories, workLocation, jobRole, specificTask }) => {
    try {
      const defaultFileName = `Bewertungsbogen_${employeeName.replace(/\s+/g, '_')}.html`;
      const defaultPath = path.join(app.getPath('documents'), 'Mitarbeiterbewertungen', defaultFileName);

      const { filePath } = await dialog.showSaveDialog({
        title: 'Bewertungsbogen speichern',
        defaultPath: defaultPath,
        filters: [{ name: 'HTML Files', extensions: ['html'] }]
      });

      if (filePath) {
        const blankFormHTML = generateBlankEvaluationFormHTML(employeeName, categories, workLocation, jobRole, specificTask);
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, blankFormHTML);
        console.log('Blank evaluation form exported successfully:', filePath);
        return { success: true, filePath };
      } else {
        return { success: false, error: 'Kein Dateipfad ausgewählt' };
      }
    } catch (error) {
      console.error('Error exporting blank evaluation form:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('IPC handlers setup completed');
}

function generateBlankEvaluationFormHTML(employeeName, categories, workLocation, jobRole, specificTask) {
  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bewertungsbogen ${employeeName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .category { background-color: #f9f9fa; padding: 15px; border-radius: 4px; margin-bottom: 15px; }
        .category h3 { margin-top: 0; color: #2c3e50; }
        textarea { height: 100px; }
        .button { background-color: #1a73e8; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }
        .button:disabled { background-color: #cccccc; cursor: not-allowed; }
        .card { background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
        .card-header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
        .card-title { font-size: 1.5em; color: #1a73e8; margin: 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Mitarbeiterbewertung für ${employeeName}</h1>
        </div>
        <div class="form-group">
          <label for="workLocation">Arbeitsort</label>
          <input type="text" id="workLocation" name="workLocation" value="${workLocation}" required>
        </div>
        <div class="form-group">
          <label for="jobRole">Tätigkeit</label>
          <input type="text" id="jobRole" name="jobRole" value="${jobRole}" required>
        </div>
        <div class="form-group">
          <label for="specificTask">Spezifische Aufgabe</label>
          <input type="text" id="specificTask" name="specificTask" value="${specificTask}" required>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Bewertungskategorien</h2>
        </div>
        ${categories.map(category => `
          <div class="category">
            <h3>${category.name} (Max. ${category.maxPoints} Punkte)</h3>
            <select name="${category.id}" required onchange="updateTotalScore()">
              <option value="">Bitte wählen</option>
              ${category.options.map(option => `
                <option value="${option.value}">${option.label}</option>
              `).join('')}
            </select>
          </div>
        `).join('')}
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Zusätzliche Bemerkungen</h2>
        </div>
        <div class="form-group">
          <textarea id="comment" name="comment" onchange="checkFormCompletion()"></textarea>
        </div>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="color: #1a73e8;">Gesamtpunktzahl:</h3>
            <p id="totalScore" style="font-size: 1.5em; font-weight: bold; color: #1a73e8;">0 / 100</p>
          </div>
        </div>
      </div>

      <button id="submitButton" class="button" onclick="finishEvaluation()" disabled>Bewertung abschließen</button>

      <script>
        function updateTotalScore() {
          let totalScore = 0;
          ${categories.map(category => `
            const ${category.id}Score = parseInt(document.getElementsByName('${category.id}')[0].value) || 0;
            totalScore += ${category.id}Score;
          `).join('')}
          document.getElementById('totalScore').textContent = totalScore + ' / 100';
          checkFormCompletion();
        }

        function checkFormCompletion() {
          const workLocation = document.getElementById('workLocation').value.trim();
          const jobRole = document.getElementById('jobRole').value.trim();
          const specificTask = document.getElementById('specificTask').value.trim();
          const comment = document.getElementById('comment').value.trim();
          
          let allCategoriesSelected = true;
          ${categories.map(category => `
            if (document.getElementsByName('${category.id}')[0].value === "") {
              allCategoriesSelected = false;
            }
          `).join('')}

          const submitButton = document.getElementById('submitButton');
          submitButton.disabled = !(workLocation && jobRole && specificTask && comment && allCategoriesSelected);
        }

        document.getElementById('workLocation').addEventListener('input', checkFormCompletion);
        document.getElementById('jobRole').addEventListener('input', checkFormCompletion);
        document.getElementById('specificTask').addEventListener('input', checkFormCompletion);
        document.getElementById('comment').addEventListener('input', checkFormCompletion);

        ${categories.map(category => `
          document.getElementsByName('${category.id}')[0].addEventListener('change', updateTotalScore);
        `).join('')}

        function finishEvaluation() {
          const data = {
            employeeName: "${employeeName}",
            workLocation: document.getElementById('workLocation').value,
            jobRole: document.getElementById('jobRole').value,
            specificTask: document.getElementById('specificTask').value,
            scores: {},
            comment: document.getElementById('comment').value,
            totalScore: parseInt(document.getElementById('totalScore').textContent)
          };

          ${categories.map(category => `
            data.scores['${category.id}'] = document.getElementsByName('${category.id}')[0].value;
          `).join('')}

          const jsonData = JSON.stringify(data);
          const blob = new Blob([jsonData], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Bewertung_${employeeName.replace(/\s+/g, '_')}_' + new Date().toLocaleDateString('de-DE').replace(/\./g, '-') + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        // Initial check
        updateTotalScore();
        checkFormCompletion();
      </script>
    </body>
    </html>
  `;
}


app.on('ready', async () => {
  console.log('App is ready');
  try {
    await initializeDatabase();
    setupIpcHandlers();
    createWindow();
    console.log('Application started successfully');
  } catch (error) {
    console.error('Error during app initialization:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  if (mainWindow) {
    mainWindow.webContents.send('error', {
      message: 'Ein unerwarteter Fehler ist aufgetreten',
      error: error.message
    });
  }
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  if (mainWindow) {
    mainWindow.webContents.send('error', {
      message: 'Ein unerwarteter Fehler ist aufgetreten',
      error: error.toString()
    });
  }
});

