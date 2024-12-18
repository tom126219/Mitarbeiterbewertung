'use client'

import React, { useState, useEffect } from 'react'
import EmployeeForm from './components/EmployeeForm'
import EmployeeList from './components/EmployeeList'
import ImportEvaluation from './components/ImportEvaluation'
import { Employee, Evaluation } from './types'
import Image from 'next/image'

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    const storedEmployees = localStorage.getItem('employees')
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees))
  }, [employees])

  const addEmployee = (employee: Employee) => {
    const newEmployees = [...employees, { ...employee, id: Date.now().toString() }]
    setEmployees(newEmployees)
  }

  const updateEmployee = (updatedEmployee: Employee) => {
    const newEmployees = employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    setEmployees(newEmployees)
  }

  const deleteEmployee = (id: string) => {
    const newEmployees = employees.filter(emp => emp.id !== id)
    setEmployees(newEmployees)
  }

  const importEvaluation = (employeeId: string, evaluation: Evaluation) => {
    const newEmployees = employees.map(emp => 
      emp.id === employeeId ? { ...emp, evaluations: [...(emp.evaluations || []), evaluation] } : emp
    )
    setEmployees(newEmployees)
  }

  const exportEmptyEvaluationForm = () => {
    const emptyEvaluation: Evaluation = {
      employeeName: "",
      workLocation: "",
      activityPeriod: "",
      activity: "",
      fachlicheKompetenz: "0",
      zuverlaessigkeit: "0",
      qualitaetAusfuehrung: "0",
      dokumentation: "0",
      zusammenarbeit: "0",
      kommunikation: "0",
      konfliktmanagement: "0",
      selbststaendigkeit: "0",
      vorschriften: "0",
      totalScore: "0",
      comment: "",
      date: new Date().toISOString().split('T')[0]
    }

    const jsonString = JSON.stringify(emptyEvaluation, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Bewertungsbogen.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mitarbeiterverwaltung KSE
          </h1>
          <Image 
            src="/krones-logo.png"
            alt="Krones Service Europe Logo"
            width={200}
            height={50}
            className="object-contain"
          />
        </div>

        <button 
          onClick={exportEmptyEvaluationForm}
          className="w-full max-w-4xl mx-auto block mb-8 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Leeren Bewertungsbogen als JSON exportieren
        </button>

        <div className="grid gap-6 max-w-4xl mx-auto">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Neuer Mitarbeiter</h2>
            <EmployeeForm onSubmit={addEmployee} />
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Bewertung importieren</h2>
            <ImportEvaluation employees={employees} onImport={importEvaluation} />
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Mitarbeiterliste</h2>
            <EmployeeList 
              employees={employees} 
              onUpdate={updateEmployee} 
              onDelete={deleteEmployee}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

