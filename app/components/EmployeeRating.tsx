import React, { useState } from 'react'
import { Employee } from '../types'

interface EmployeeRatingProps {
  employee: Employee
  onSubmit: (rating: string) => void
}

const EmployeeRating: React.FC<EmployeeRatingProps> = ({ employee, onSubmit }) => {
  const [rating, setRating] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(rating)
    setRating('')
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-semibold mb-2">Mitarbeiterbewertung</h2>
      <p><strong>Name:</strong> {employee.name}</p>
      <p><strong>Einstellungsdatum:</strong> {employee.hireDate}</p>
      <p><strong>Qualifikation:</strong> {employee.qualification}</p>
      <p><strong>Sparte:</strong> {employee.sparte}</p>
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={4}
          placeholder="Geben Sie Ihre Bewertung ein..."
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          Bewertung abgeben
        </button>
      </form>
    </div>
  )
}

export default EmployeeRating

