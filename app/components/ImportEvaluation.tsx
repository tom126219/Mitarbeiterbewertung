import React, { useState } from 'react'
import { Employee, Evaluation } from '../types'

interface ImportEvaluationProps {
  employees: Employee[]
  onImport: (employeeId: string, evaluation: Evaluation) => void
}

const ImportEvaluation: React.FC<ImportEvaluationProps> = ({ employees, onImport }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file || !selectedEmployee) return

    try {
      const content = await file.text()
      const evaluation: Evaluation = JSON.parse(content)
      onImport(selectedEmployee, evaluation)
      alert('Bewertung erfolgreich importiert!')
    } catch (error) {
      console.error('Error importing evaluation:', error)
      alert('Fehler beim Importieren der Bewertung. Bitte überprüfen Sie die Datei.')
    }

    setSelectedEmployee('')
    setFile(null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700">
          Mitarbeiter auswählen
        </label>
        <select
          id="employee-select"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Bitte wählen Sie einen Mitarbeiter</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
          Bewertung auswählen (JSON-Format)
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".json"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleImport}
        disabled={!selectedEmployee || !file}
        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Bewertung auswählen (JSON-Format)
      </button>
    </div>
  )
}

export default ImportEvaluation

