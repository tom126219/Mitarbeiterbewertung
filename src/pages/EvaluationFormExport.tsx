import React from 'react';
import { ipcRenderer } from 'electron';

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
  // ... (include all other categories here)
];

interface EvaluationData {
  employeeId: number;
  employeeName: string;
  workLocation: string;
  jobRole: string;
  specificTask: string;
  scores: Record<string, number>;
  comment: string;
  totalScore: number;
}

interface EvaluationFormExportProps {
  data: EvaluationData;
  onClose: () => void;
}

const EvaluationFormExport: React.FC<EvaluationFormExportProps> = ({ data, onClose }) => {
  const completedCategories = Object.keys(data.scores).length;

  const handleFinishEvaluation = async () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const suggestedFileName = `Bewertung_${data.employeeName.replace(/\s+/g, '_')}_${currentDate}.json`;

    try {
      const result = await ipcRenderer.invoke('save-evaluation', {
        data: JSON.stringify(data),
        suggestedFileName
      });

      if (result.success) {
        alert(`Bewertung wurde erfolgreich gespeichert unter: ${result.filePath}`);
        onClose();
      } else {
        alert('Fehler beim Speichern der Bewertung: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Fehler beim Speichern der Bewertung: ' + error);
    }
  };

  return (
    <div className="bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Mitarbeiterbewertung für {data.employeeName}</h1>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Arbeitsort</label>
            <input type="text" value={data.workLocation} readOnly className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tätigkeit</label>
            <input type="text" value={data.jobRole} readOnly className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Spezifische Aufgabe</label>
          <input type="text" value={data.specificTask} readOnly className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Bewertungskategorien</h2>
        {categories.map(category => (
          <div key={category.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-600 mb-2">{category.name} (Max. {category.maxPoints} Punkte)</h3>
            <select value={data.scores[category.id]} disabled className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              {category.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Zusätzliche Bemerkungen</h2>
        <textarea value={data.comment} readOnly className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows={4} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-blue-600">Gesamtpunktzahl:</h3>
          <p className="text-3xl font-bold text-blue-600">{data.totalScore} / 100</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-600">Bewertete Kategorien:</h3>
          <p className="text-3xl font-bold text-blue-600">{completedCategories} / {categories.length}</p>
        </div>
      </div>

      <button
        onClick={handleFinishEvaluation}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
      >
        Bewertung abschließen
      </button>
    </div>
  );
};

export default EvaluationFormExport;

