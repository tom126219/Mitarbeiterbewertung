import { useState } from 'react'
import { Employee } from '../types'

interface ImportRatingProps {
  employees: Employee[]
  onImport: (employeeId: string, rating: string) => void
}

export default function ImportRating({ employees, onImport }: ImportRatingProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [importedRating, setImportedRating] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'text/html')
        const ratingElement = doc.querySelector('p:nth-of-type(3)')
        if (ratingElement) {
          setImportedRating(ratingElement.textContent?.split(': ')[1] || '')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImport = () => {
    if (selectedEmployee && importedRating) {
      onImport(selectedEmployee, importedRating)
      setSelectedEmployee('')
      setImportedRating('')
    }
  }

  return (
    <div className="mb-4 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-2">Bewertung importieren</h2>
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
      {importedRating && (
        <div className="mt-2">
          <p>Importierte Bewertung: {importedRating}</p>
          <button 
            onClick={handleImport}
            className="mt-2 bg-green-500 text-white p-2 rounded"
          >
            Bewertung zuweisen
          </button>
        </div>
      )}
    </div>
  )
}

