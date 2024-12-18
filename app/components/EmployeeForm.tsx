import React, { useState } from 'react'
import { Employee } from '../types'

interface EmployeeFormProps {
  onSubmit: (employee: Employee) => void
  employee?: Employee
}

export default function EmployeeForm({ onSubmit, employee }: EmployeeFormProps) {
  const [formData, setFormData] = useState<Employee>(employee || {
    id: '',
    name: '',
    hireDate: '',
    qualification: '',
    sparte: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'hireDate') {
      const date = new Date(e.target.value)
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
      setFormData({ ...formData, [e.target.name]: formattedDate })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    if (!employee) {
      setFormData({ id: '', name: '', hireDate: '', qualification: '', sparte: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700">
            Einstellungsdatum
          </label>
          <input
            type="date"
            id="hireDate"
            name="hireDate"
            value={formData.hireDate ? new Date(formData.hireDate.split('.').reverse().join('-')).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
            Qualifikation
          </label>
          <input
            type="text"
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sparte" className="block text-sm font-medium text-gray-700">
            Sparte
          </label>
          <input
            type="text"
            id="sparte"
            name="sparte"
            value={formData.sparte}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {employee ? 'Aktualisieren' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  )
}

