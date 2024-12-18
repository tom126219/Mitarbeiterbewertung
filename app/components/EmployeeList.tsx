import React, { useState, useMemo } from 'react'
import { Employee, Evaluation } from '../types'
import EmployeeForm from './EmployeeForm'
import EvaluationForm from './EvaluationForm'
import RatingActions from './RatingActions'

interface EmployeeListProps {
  employees: Employee[]
  onUpdate: (employee: Employee) => void
  onDelete: (id: string) => void
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onUpdate, onDelete }) => {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showEvaluationForm, setShowEvaluationForm] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [filter, setFilter] = useState('')

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => a.name.localeCompare(b.name))
  }, [employees])

  const filteredEmployees = useMemo(() => {
    return sortedEmployees.filter(employee => {
      const lastName = employee.name.split(' ').pop()?.toLowerCase() || '';
      return lastName.includes(filter.toLowerCase());
    });
  }, [sortedEmployees, filter]);

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Mitarbeiter löschen möchten?')) {
      onDelete(id)
    }
  }

  const handleUpdate = (updatedEmployee: Employee) => {
    onUpdate(updatedEmployee)
    setEditingEmployee(null)
  }

  const handleNewEvaluation = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowEvaluationForm(true)
  }

  const handleEvaluationSubmit = (evaluation: Evaluation) => {
    if (selectedEmployee) {
      const updatedEmployee = {
        ...selectedEmployee,
        evaluations: [...(selectedEmployee.evaluations || []), evaluation]
      }
      onUpdate(updatedEmployee)
      setShowEvaluationForm(false)
      setSelectedEmployee(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nach Nachnamen suchen..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {filteredEmployees.map((employee) => (
        <div key={employee.id} className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold">{employee.name}</h3>
          <p>Einstellungsdatum: {employee.hireDate}</p>
          <p>Qualifikation: {employee.qualification}</p>
          <p>Sparte: {employee.sparte}</p>
          {employee.evaluations && employee.evaluations.length > 0 && (
            <p>Letzte Bewertung: {new Date(employee.evaluations[employee.evaluations.length - 1].date).toLocaleDateString('de-DE')}</p>
          )}
          <div className="mt-4 space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={() => handleNewEvaluation(employee)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Neue Bewertung erstellen
              </button>
              {employee.evaluations && employee.evaluations.length > 0 && (
                <RatingActions employee={employee} />
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(employee)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Bearbeiten
              </button>
              <button
                onClick={() => handleDelete(employee.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      ))}
      {editingEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h2 className="text-lg font-semibold mb-4">Mitarbeiter bearbeiten</h2>
            <EmployeeForm onSubmit={handleUpdate} employee={editingEmployee} />
            <button
              onClick={() => setEditingEmployee(null)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
      {showEvaluationForm && selectedEmployee && (
        <EvaluationForm
          employeeName={selectedEmployee.name}
          onClose={() => setShowEvaluationForm(false)}
          onSubmit={handleEvaluationSubmit}
        />
      )}
    </div>
  )
}

export default EmployeeList

