import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { employeeStore } from '../store/employeeStore';
import { ipcRenderer } from 'electron';
import { FileText, FileDown, Save, Upload } from 'lucide-react';

interface EmployeeEvaluationFormProps {
  employeeName?: string;
  employeeId?: number;
  onClose?: () => void;
}

interface Category {
  id: string;
  name: string;
  maxPoints: number;
  options: { value: string; label: string }[];
}

export const categories: Category[] = [
  {
    id: 'fachlicheKompetenz',
    name: 'Fachliche Kompetenz',
    maxPoints: 10,
    options: [
      { value: '10', label: 'Exzellent (10 Punkte): Beherrscht alle relevanten Technologien und Problemlösungen' },
      { value: '8', label: 'Gut (8 Punkte): Gute technische Fähigkeiten, geringe Unterstützung erforderlich' },
      { value: '6', label: 'Befriedigend (6 Punkte): Durchschnittliche technische Fähigkeiten, gelegentlich Unterstützung erforderlich' },
      { value: '4', label: 'Ausreichend (4 Punkte): Grundlegende Fähigkeiten, häufig Unterstützung erforderlich' },
      { value: '2', label: 'Unzureichend (2 Punkte): Fachliche Defizite, regelmäßige Unterstützung erforderlich' },
    ],
  },
  {
    id: 'zuverlaessigkeit',
    name: 'Zuverlässigkeit',
    maxPoints: 10,
    options: [
      { value: '10', label: 'Exzellent (10 Punkte): Immer pünktlich, hält alle Termine ein' },
      { value: '8', label: 'Gut (8 Punkte): Meist pünktlich, kleine Verspätungen' },
      { value: '6', label: 'Befriedigend (6 Punkte): Gelegentliche Verspätungen, manchmal Terminänderungen' },
      { value: '4', label: 'Ausreichend (4 Punkte): Häufige Verspätungen, öfter nicht erreichbar' },
      { value: '2', label: 'Unzureichend (2 Punkte): Unzuverlässig, oft nicht erreichbar' },
    ],
  },
  {
    id: 'qualitaetAusfuehrung',
    name: 'Qualität der Ausführung',
    maxPoints: 10,
    options: [
      { value: '10', label: 'Exzellent (10 Punkte): Hohe Präzision, keine Nacharbeit erforderlich' },
      { value: '8', label: 'Gut (8 Punkte): Gute Ausführung, minimale Nacharbeit erforderlich' },
      { value: '6', label: 'Befriedigend (6 Punkte): Durchschnittliche Ausführung, gelegentliche Nacharbeit erforderlich' },
      { value: '4', label: 'Ausreichend (4 Punkte): Häufige Nacharbeit erforderlich' },
      { value: '2', label: 'Unzureichend (2 Punkte): Hohe Fehlerquote, häufige Nacharbeit erforderlich' },
    ],
  },
  {
    id: 'dokumentation',
    name: 'Dokumentation und Berichtswesen',
    maxPoints: 10,
    options: [
      { value: '10', label: 'Exzellent (10 Punkte): Vollständige, präzise und zeitnahe Dokumentation' },
      { value: '8', label: 'Gut (8 Punkte): Gute Dokumentation, geringe Nachbesserungen erforderlich' },
      { value: '6', label: 'Befriedigend (6 Punkte): Durchschnittliche Dokumentation, gelegentliche Unvollständigkeiten' },
      { value: '4', label: 'Ausreichend (4 Punkte): Unvollständige Dokumentation, regelmäßige Nachbesserungen erforderlich' },
      { value: '2', label: 'Unzureichend (2 Punkte): Unvollständige oder fehlerhafte Dokumentation' },
    ],
  },
  {
    id: 'zusammenarbeit',
    name: 'Zusammenarbeit im Team',
    maxPoints: 15,
    options: [
      { value: '15', label: 'Exzellent (15 Punkte): Hervorragende Zusammenarbeit und Unterstützung für Kollegen' },
      { value: '10', label: 'Gut (10 Punkte): Gute Zusammenarbeit, gelegentliche Unterstützung erforderlich' },
      { value: '6', label: 'Befriedigend (6 Punkte): Durchschnittliche Zusammenarbeit, gelegentliche Konflikte' },
      { value: '4', label: 'Ausreichend (4 Punkte): Häufige Schwierigkeiten bei der Zusammenarbeit' },
      { value: '2', label: 'Unzureichend (2 Punkte): Schwierigkeiten bei der Teamarbeit, wenig Unterstützung' },
    ],
  },
  {
    id: 'kommunikation',
    name: 'Kommunikationsfähigkeiten',
    maxPoints: 10,
    options: [
      { value: '10', label: 'Exzellent (10 Punkte): Klare, präzise und effektive Kommunikation' },
      { value: '8', label: 'Gut (8 Punkte): Gute Kommunikation, geringe Missverständnisse' },
      { value: '6', label: 'Befriedigend (6 Punkte): Durchschnittliche Kommunikation, gelegentliche Missverständnisse' },
      { value: '4', label: 'Ausreichend (4 Punkte): Häufige Missverständnisse, Verbesserung erforderlich' },
      { value: '2', label: 'Unzureichend (2 Punkte): Unklare Kommunikation, häufige Missverständnisse' },
    ],
  },
  {
    id: 'konfliktmanagement',
    name: 'Konfliktmanagement',
    maxPoints: 10,
    options: [
      { value: '10', label: 'Exzellent (10 Punkte): Sehr guter Umgang mit Konflikten, konstruktive Lösungen' },
      { value: '8', label: 'Gut (8 Punkte): Guter Umgang mit Konflikten, Lösungen und Deeskalationen' },
      { value: '6', label: 'Befriedigend (6 Punkte): Frühzeitige Wahrnehmung von Konflikten, aktives Gegensteuern' },
      { value: '4', label: 'Ausreichend (4 Punkte): Durchschnittlicher Umgang, Konflikte werden hin und wieder gelöst' },
      { value: '2', label: 'Unzureichend (2 Punkte): Schlechter Umgang, Eskalationen werden häufig nicht vermieden' },
    ],
  },
  {
    id: 'selbststaendigkeit',
    name: 'Selbstständigkeit und Problemlösungsfähigkeiten',
    maxPoints: 10,
    options: [
      { value: '10', label: 'Exzellent (10 Punkte): Hohe Selbstständigkeit, proaktive Problemlösung' },
      { value: '8', label: 'Gut (8 Punkte): Gute Selbstständigkeit, schnelle Problemlösung' },
      { value: '6', label: 'Befriedigend (6 Punkte): Durchschnittliche Selbstständigkeit, gelegentliche Unterstützung erforderlich' },
      { value: '4', label: 'Ausreichend (4 Punkte): Häufige Unterstützung erforderlich, geringe Initiative' },
      { value: '2', label: 'Unzureichend (2 Punkte): Geringe Selbstständigkeit, wenig Initiative' },
    ],
  },
  {
    id: 'vorschriften',
    name: 'Einhalten von Vorschriften und Richtlinien',
    maxPoints: 15,
    options: [
      { value: '15', label: 'Exzellent (15 Punkte): Strikte Einhaltung aller Vorschriften und Richtlinien' },
      { value: '10', label: 'Gut (10 Punkte): Geringfügige Abweichungen, insgesamt gute Einhaltung' },
      { value: '6', label: 'Befriedigend (6 Punkte): Durchschnittliche Einhaltung, gelegentliche Verstöße' },
      { value: '4', label: 'Ausreichend (4 Punkte): Häufige Verstöße gegen Vorschriften' },
      { value: '2', label: 'Unzureichend (2 Punkte): Regelmäßige Verstöße, erheblicher Verbesserungsbedarf' },
    ],
  },
];

const EvaluationForm: React.FC<EmployeeEvaluationFormProps> = ({ 
  employeeName = "", 
  employeeId = 0, 
  onClose = () => {} 
}) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [workLocation, setWorkLocation] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [specificTask, setSpecificTask] = useState('');
  const [comment, setComment] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [completedCategories, setCompletedCategories] = useState(0);

  useEffect(() => {
    const newTotalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    setTotalScore(newTotalScore);
    setCompletedCategories(Object.keys(scores).length);
  }, [scores]);

  const handleScoreChange = (categoryId: string, value: string) => {
    setScores(prevScores => ({
      ...prevScores,
      [categoryId]: parseInt(value, 10)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const evaluationData = {
      employeeId,
      employeeName,
      workLocation,
      jobRole,
      specificTask,
      scores,
      comment,
      totalScore,
      date: new Date().toISOString(),
    };
    
    try {
      await employeeStore.saveEvaluation(evaluationData);
      console.log('Evaluation saved successfully');
      await employeeStore.addActivity({
        type: 'Bewertung hinzugefügt',
        employeeName: employeeName,
        timestamp: new Date()
      });
      onClose();
    } catch (error) {
      console.error('Error saving evaluation:', error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const evaluationData = {
      employeeId,
      employeeName,
      workLocation,
      jobRole,
      specificTask,
      scores,
      comment,
      totalScore,
      date: new Date().toISOString(),
    };

    try {
      const result = await ipcRenderer.invoke('save-evaluation', {
        data: JSON.stringify(evaluationData),
        suggestedFileName: `Bewertung_${employeeName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('de-DE').replace(/\./g, '-')}.json`
      });
    
      if (result.success) {
        console.log('Evaluation saved successfully:', result.filePath);
        alert('Bewertung wurde gespeichert');
        onClose(); // Close the form after successful save
      } else {
        console.error('Failed to save evaluation:', result.error);
        alert('Fehler beim Speichern der Bewertung: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Fehler beim Speichern der Bewertung: ' + error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsHTML = async () => {
    try {
      const result = await ipcRenderer.invoke('export-blank-evaluation-form', {
        employeeName,
        categories,
        workLocation,
        jobRole,
        specificTask
      });
      if (result.success) {
        console.log('Blank evaluation form exported successfully:', result.filePath);
        alert(`Leerer Bewertungsbogen wurde erfolgreich exportiert nach: ${result.filePath}`);
      } else {
        console.error('Failed to export blank evaluation form:', result.error);
        alert('Fehler beim Exportieren des leeren Bewertungsbogens: ' + result.error);
      }
    } catch (error) {
      console.error('Error exporting blank evaluation form:', error);
      alert('Fehler beim Exportieren des leeren Bewertungsbogens: ' + error);
    }
  };

  const loadEvaluation = async () => {
    try {
      const result = await ipcRenderer.invoke('load-evaluation');
      if (result.success) {
        const evaluationData = JSON.parse(result.data);
        setWorkLocation(evaluationData.workLocation);
        setJobRole(evaluationData.jobRole);
        setSpecificTask(evaluationData.specificTask);
        setScores(evaluationData.scores);
        setComment(evaluationData.comment);
        setTotalScore(evaluationData.totalScore);
        alert('Bewertung wurde erfolgreich geladen.');
      } else {
        console.error('Failed to load evaluation:', result.error);
        alert('Fehler beim Laden der Bewertung: ' + result.error);
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
      alert('Fehler beim Laden der Bewertung: ' + error);
    }
  };

  const isFormComplete = () => {
    const requiredFieldsFilled = workLocation && jobRole && specificTask && comment;
    const allCategoriesRated = completedCategories === categories.length;
    return requiredFieldsFilled && allCategoriesRated;
  };

  if (!employeeId) {
    return (
      <Card>
        <CardHeader>
          {/* <CardTitle className="text-2xl">Mitarbeiterbewertung</CardTitle> */}
        </CardHeader>
        <CardContent>
          <p>Bitte wählen Sie einen Mitarbeiter aus, um eine Bewertung durchzuführen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-600">Mitarbeiterbewertung für {employeeName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workLocation">Arbeitsort</Label>
              <Input
                id="workLocation"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="jobRole">Tätigkeit</Label>
              <Input
                id="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="specificTask">Spezifische Aufgabe</Label>
            <Input
              id="specificTask"
              value={specificTask}
              onChange={(e) => setSpecificTask(e.target.value)}
              placeholder="z.B. Neuaufstellung, Überholung, Retrofit"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardContent className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-blue-600 mb-2">{category.name} (Max. {category.maxPoints} Punkte)</h4>
              <Select onValueChange={(value) => handleScoreChange(category.id, value)} value={scores[category.id]?.toString()}>
                <SelectTrigger id={category.id}>
                  <SelectValue placeholder="Wählen Sie eine Bewertung" />
                </SelectTrigger>
                <SelectContent>
                  {category.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-blue-600">Zusätzliche Bemerkungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md"
          />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardContent className="flex justify-between items-center p-4">
          <div>
            <h3 className="text-xl font-semibold text-blue-600">Gesamtpunktzahl:</h3>
            <p className="text-3xl font-bold text-blue-600">{totalScore} / 100</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600">Bewertete Kategorien:</h3>
            <p className="text-3xl font-bold text-blue-600">{completedCategories} / {categories.length}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button
          type="button"
          onClick={handleExport}
          variant="outline"
          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
          disabled={!isFormComplete()}
        >
          <FileDown className="mr-2 h-4 w-4" /> Bewertung abschließen
        </Button>
        <Button
          type="button"
          onClick={exportAsHTML}
          variant="outline"
          className="bg-green-50 text-green-600 hover:bg-green-100"
        >
          <FileDown className="mr-2 h-4 w-4" /> Leeren Bewertungsbogen exportieren
        </Button>
      </div>
    </form>
  );
};

export default EvaluationForm;

export function importEvaluation(encodedData: string): any {
  try {
    const jsonData = atob(encodedData);
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error importing evaluation data:', error);
    return null;
  }
}

