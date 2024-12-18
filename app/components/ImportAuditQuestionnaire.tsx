import React, { useState } from 'react';
import { Employee } from '../types';

interface AuditData {
  employeeName: string;
  workLocation: string;
  jobRole: string;
  specificTask: string;
  totalScore: string;
  comment: string;
}

interface ImportAuditQuestionnaireProps {
  employees: Employee[];
  onImport: (employeeId: string, audit: string) => void;
}

const ImportAuditQuestionnaire: React.FC<ImportAuditQuestionnaireProps> = ({ employees, onImport }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [importedAudit, setImportedAudit] = useState<AuditData | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        const employeeName = doc.querySelector('p:contains("employeeName")')?.textContent?.split(': ')[1] || '';
        const workLocation = doc.querySelector('p:contains("workLocation")')?.textContent?.split(': ')[1] || '';
        const jobRole = doc.querySelector('p:contains("jobRole")')?.textContent?.split(': ')[1] || '';
        const specificTask = doc.querySelector('p:contains("specificTask")')?.textContent?.split(': ')[1] || '';
        const totalScore = doc.querySelector('p:contains("totalScore")')?.textContent?.split(': ')[1] || '';
        const comment = doc.querySelector('p:contains("comment")')?.textContent?.split(': ')[1] || '';

        setImportedAudit({
          employeeName,
          workLocation,
          jobRole,
          specificTask,
          totalScore,
          comment
        });
      }
      reader.readAsText(file)
    }
  }

  const handleImport = () => {
    if (selectedEmployee && importedAudit) {
      onImport(selectedEmployee, JSON.stringify(importedAudit))
      setSelectedEmployee('')
      setImportedAudit(null)
    }
  }

  return (
    <div className="mb-4 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-2">Audit-Fragebogen importieren</h2>
      <div className="grid grid-cols-2 gap-4">
        <select 
          value={selectedEmployee} 
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Mitarbeiter auswählen</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
        <input 
          type="file" 
          accept=".html" 
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
      </div>
      {importedAudit && (
        <div className="mt-2">
          <p>Audit-Fragebogen importiert für: {importedAudit.employeeName}</p>
          <p>Gesamtpunktzahl: {importedAudit.totalScore}</p>
          <button 
            onClick={handleImport}
            className="mt-2 bg-green-500 text-white p-2 rounded"
          >
            Audit-Ergebnis zuweisen
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportAuditQuestionnaire;

