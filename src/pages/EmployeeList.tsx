import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PlusCircle, Users, Wrench, FolderOpen, Calendar, Upload, FileText, Eye, FileDown, Pencil, Trash2 } from 'lucide-react';
import { employeeStore } from '../store/employeeStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { categories } from './EvaluationForm';
import { ipcRenderer } from 'electron';

interface Employee {
  id: number;
  name: string;
  beruf: string;
  sparte: string;
  hireDate: Date;
  evaluationCount: number;
  evaluations?: Evaluation[];
  requestedEvaluations: number;
}

interface Evaluation {
  id: number;
  employeeId: number;
  employeeName: string;
  date: Date;
  workLocation: string;
  jobRole: string;
  specificTask: string;
  scores: { [category: string]: number };
  totalScore: number;
  comment: string;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id' | 'evaluationCount' | 'requestedEvaluations'>>({
    name: '',
    beruf: '',
    sparte: '',
    hireDate: new Date(),
  });
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const [isLastEvaluationOpen, setIsLastEvaluationOpen] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadEmployees = async () => {
    try {
      const fetchedEmployees = await employeeStore.getAllEmployees();
      console.log('Loaded employees:', fetchedEmployees);

      if (Array.isArray(fetchedEmployees) && fetchedEmployees.length > 0) {
        setEmployees(fetchedEmployees);
      } else {
        console.error('Fetched employees is empty or not an array:', fetchedEmployees);
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Fehler beim Laden der Mitarbeiterdaten');
      setEmployees([]);
    }
  };

  const addEmployee = async () => {
    try {
      const added = await employeeStore.addEmployee(newEmployee);
      console.log('Employee added successfully:', added);
      setEmployees(prevEmployees => [...prevEmployees, added]);
      setNewEmployee({ name: '', beruf: '', sparte: '', hireDate: new Date() }); 
    } catch (err) {
      console.error('Error adding employee:', err);
      setError('Fehler beim Hinzufügen des Mitarbeiters: ' + (err as Error).message);
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      const deleted = await employeeStore.deleteEmployee(id);
      if (deleted) {
        await loadEmployees();
        setSelectedEmployee(null);
      } else {
        setError('Fehler beim Löschen des Mitarbeiters');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Fehler beim Löschen des Mitarbeiters');
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingEmployee(null);
    setIsEditDialogOpen(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingEmployee) {
      setEditingEmployee({
        ...editingEmployee,
        [e.target.name]: e.target.value,
      });
    }
  };

  const saveEditedEmployee = async () => {
    if (editingEmployee) {
      try {
        const updated = await employeeStore.updateEmployee(editingEmployee);
        if (updated) {
          await loadEmployees();
          setSelectedEmployee(updated);
          closeEditDialog();
        } else {
          setError('Fehler beim Aktualisieren des Mitarbeiters');
        }
      } catch (err) {
        console.error('Error updating employee:', err);
        setError('Fehler beim Aktualisieren des Mitarbeiters');
      }
    }
  };

  const showLastEvaluation = async (employeeId: number) => {
    try {
      const evaluation = await employeeStore.getLastEvaluation(employeeId);
      if (evaluation) {
        setLastEvaluation(evaluation);
        setIsLastEvaluationOpen(true);
      } else {
        setError('Keine Bewertung für diesen Mitarbeiter gefunden.');
      }
    } catch (err) {
      console.error('Error fetching last evaluation:', err);
      setError('Fehler beim Abrufen der letzten Bewertung');
    }
  };

  const exportToPDF = async (employeeId: number, employeeName: string) => {
    try {
      const result = await employeeStore.exportEvaluationsToPDF(employeeId, employeeName);
      if (result.success) {
        console.log('PDF exported successfully to:', result.filePath);
      } else {
        console.error('Failed to export PDF:', result.error);
        setError('Fehler beim Exportieren der Bewertungen als PDF');
      }
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Fehler beim Exportieren der Bewertungen als PDF');
    }
  };

  const importEvaluation = async () => {
    if (selectedEmployee) {
      try {
        const result = await ipcRenderer.invoke('load-evaluation');
        if (result.success) {
          const evaluationData = JSON.parse(result.data);

          const processedEvaluation = {
            ...evaluationData,
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            date: evaluationData.date || new Date().toISOString(),
            scores: typeof evaluationData.scores === 'string'
              ? JSON.parse(evaluationData.scores)
              : evaluationData.scores
          };

          await employeeStore.saveEvaluation(processedEvaluation);
          
          // Update counters after successful import
          const updatedEmployee = await employeeStore.updateCountersAfterImport(selectedEmployee.id);
          setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
              emp.id === selectedEmployee.id ? { ...emp, ...updatedEmployee } : emp
            )
          );
          setSelectedEmployee(updatedEmployee);

          // Refresh the employee data to ensure we have the latest counts
          await loadEmployees();

          alert(`Bewertung erfolgreich importiert. Neue Bewertungsanzahl: ${updatedEmployee.evaluationCount}`);
        } else {
          console.error('Failed to import evaluation:', result.error);
          alert('Fehler beim Importieren der Bewertung: ' + result.error);
        }
      } catch (error) {
        console.error('Error importing evaluation:', error);
        alert('Fehler beim Importieren der Bewertung: ' + (error as Error).message);
      }
    } else {
      alert('Bitte wählen Sie zuerst einen Mitarbeiter aus.');
    }
  };

  const handleExportEvaluationForm = async (employeeId: number) => {
    try {
      const result = await ipcRenderer.invoke('export-blank-evaluation-form', {
        employeeName: selectedEmployee!.name,
        categories,
        workLocation: '',
        jobRole: '',
        specificTask: ''
      });

      if (result.success) {
        console.log('Blank evaluation form exported successfully:', result.filePath);
        alert(`Leerer Bewertungsbogen wurde erfolgreich exportiert nach: ${result.filePath}`);

        // Increment the requested evaluations counter after successful export
        const updatedEmployee = await employeeStore.incrementRequestedEvaluations(employeeId);
        console.log('Updated employee after increment:', updatedEmployee);
        setEmployees(prevEmployees =>
          prevEmployees.map(emp =>
            emp.id === employeeId ? { ...emp, requestedEvaluations: updatedEmployee.requestedEvaluations } : emp
          )
        );
        setSelectedEmployee(updatedEmployee);
      } else {
        console.error('Failed to export blank evaluation form:', result.error);
        alert('Fehler beim Exportieren des leeren Bewertungsbogens: ' + result.error);
      }
    } catch (error) {
      console.error('Error exporting evaluation form:', error);
      setError('Fehler beim Exportieren des Bewertungsbogens');
    }
  };

  const handleEmployeeSelect = (value: string) => {
    const selected = employees.find(e => e.id.toString() === value);
    console.log('Selected employee:', selected);
    setSelectedEmployee(selected || null);
  };

  useEffect(() => {
    if (selectedEmployee) {
      console.log('Current selectedEmployee:', selectedEmployee);
      console.log('Requested evaluations:', selectedEmployee.requestedEvaluations);
    }
  }, [selectedEmployee]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Mitarbeiter</h1>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <Label htmlFor="name" className="text-sm font-medium text-gray-500">Name</Label>
              <Input
                id="name"
                placeholder="Name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="mt-1 w-full"
              />
            </div>
            <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg">
              <Wrench className="h-8 w-8 text-green-600 mb-2" />
              <Label htmlFor="beruf" className="text-sm font-medium text-gray-500">Beruf</Label>
              <Input
                id="beruf"
                placeholder="Beruf"
                value={newEmployee.beruf}
                onChange={(e) => setNewEmployee({ ...newEmployee, beruf: e.target.value })}
                className="mt-1 w-full"
              />
            </div>
            <div className="flex flex-col items-center p-6 bg-yellow-50 rounded-lg">
              <FolderOpen className="h-8 w-8 text-yellow-600 mb-2" />
              <Label htmlFor="sparte" className="text-sm font-medium text-gray-500">Sparte</Label>
              <Input
                id="sparte"
                placeholder="Sparte"
                value={newEmployee.sparte}
                onChange={(e) => setNewEmployee({ ...newEmployee, sparte: e.target.value })}
                className="mt-1 w-full"
              />
            </div>
            <div className="flex flex-col items-center p-6 bg-purple-50 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mb-2" />
              <Label htmlFor="hireDate" className="text-sm font-medium text-gray-500">Einstellungsdatum</Label>
              <Input
                id="hireDate"
                type="date"
                value={newEmployee.hireDate.toISOString().split('T')[0]}
                onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: new Date(e.target.value) })}
                className="mt-1 w-full"
              />
            </div>
          </div>
          <div className="w-full bg-gray-100 p-4 rounded-lg">
            <Button 
              onClick={addEmployee} 
              className="w-full bg-gray-200 text-blue-600 hover:bg-gray-300 transition-colors duration-200"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Mitarbeiter hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Mitarbeiter auswählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Label htmlFor="employee-select">Mitarbeiter</Label>
              <Select 
                value={selectedEmployee?.id?.toString() || ''} 
                onValueChange={handleEmployeeSelect}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Mitarbeiter auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEmployee && (
        <Card className="bg-white shadow-md">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <CardTitle>Mitarbeiterdetails</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <p className="font-medium text-pink-600 text-2xl mr-2">{selectedEmployee.evaluationCount}</p>
                  <Label>Bewertungen</Label>
                </div>
                <div className="flex items-center">
                  <p className="font-medium text-blue-600 text-2xl mr-2">{selectedEmployee.requestedEvaluations}</p>
                  <Label>Angefordert</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" 
                onClick={() => openEditDialog(selectedEmployee)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Mitarbeiter bearbeiten
              </Button>
              <Button 
                variant="outline" 
                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200" 
                onClick={() => deleteEmployee(selectedEmployee.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Mitarbeiter löschen
              </Button>
              <Button 
                variant="outline" 
                className="bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200" 
                onClick={() => showLastEvaluation(selectedEmployee.id)}
              >
                <Eye className="mr-2 h-4 w-4" /> Letzte Bewertung ansehen
              </Button>
              <Button
                variant="outline"
                className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200"
                onClick={() => exportToPDF(selectedEmployee.id, selectedEmployee.name)}
              >
                <FileDown className="mr-2 h-4 w-4" /> PDF Export alle Bewertungen
              </Button>
              <Button 
                variant="outline" 
                className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200" 
                onClick={() => handleExportEvaluationForm(selectedEmployee.id)}
              >
                <FileText className="mr-2 h-4 w-4" /> Bewertungsfragebogen exportieren
              </Button>
              <Button
                variant="outline"
                className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200"
                onClick={importEvaluation}
              >
                <Upload className="mr-2 h-4 w-4" /> Bewertungsfragebogen importieren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={editingEmployee.name}
                  onChange={handleEditChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beruf" className="text-right">
                  Beruf
                </Label>
                <Input
                  id="beruf"
                  name="beruf"
                  value={editingEmployee.beruf}
                  onChange={handleEditChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sparte" className="text-right">
                  Sparte
                </Label>
                <Input
                  id="sparte"
                  name="sparte"
                  value={editingEmployee.sparte}
                  onChange={handleEditChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hireDate" className="text-right">
                  Einstellungsdatum
                </Label>
                <Input
                  id="hireDate"
                  name="hireDate"
                  type="date"
                  value={new Date(editingEmployee.hireDate).toISOString().split('T')[0]}
                  onChange={handleEditChange}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Abbrechen
            </Button>
            <Button onClick={saveEditedEmployee}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLastEvaluationOpen} onOpenChange={setIsLastEvaluationOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-600 mb-4">Letzte Bewertung für {lastEvaluation?.employeeName}</DialogTitle>
          </DialogHeader>
          {lastEvaluation && (
            <div className="space-y-6">
              <Card className="bg-blue-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong className="font-semibold">Datum:</strong> {new Date(lastEvaluation.date).toLocaleDateString('de-DE')}</p>
                  <p><strong className="font-semibold">Arbeitsort:</strong> {lastEvaluation.workLocation}</p>
                  <p><strong className="font-semibold">Tätigkeit:</strong> {lastEvaluation.jobRole}</p>
                  <p><strong className="font-semibold">Spezifische Aufgabe:</strong> {lastEvaluation.specificTask}</p>
                </div>
              </Card>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">Bewertungen:</h3>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="bg-gray-50 p-4">
                      <h4 className="font-medium text-lg text-blue-600">{category.name}</h4>
                      <p className="mt-2">
                        Punktzahl: <span className="font-semibold text-blue-600">{lastEvaluation.scores[category.id] || 0} / {category.maxPoints}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.options.find(option => option.value === lastEvaluation.scores[category.id]?.toString())?.label || 'Keine Bewertung'}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
              <Card className="bg-green-50 p-4">
                <h3 className="text-xl font-semibold text-green-600">Gesamtpunktzahl:</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{lastEvaluation.totalScore} / 100</p>
              </Card>
              <Card className="bg-gray-50 p-4">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Kommentar:</h3>
                <p className="whitespace-pre-wrap text-gray-700">{lastEvaluation.comment}</p>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeList;

