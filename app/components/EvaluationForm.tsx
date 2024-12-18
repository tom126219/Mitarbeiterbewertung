import React, { useState, useEffect } from 'react';
import { Evaluation } from '../types';

interface Evaluation {
  date: string;
  totalScore: number;
  comment: string;
  workLocation: string;
  jobRole: string;
  specificTask: string;
  activityPeriod: string;
  activity: string;
}

interface EvaluationFormProps {
  employeeName: string;
  onClose: () => void;
  onSubmit: (evaluation: Evaluation) => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ employeeName, onClose, onSubmit }) => {
  const [totalScore, setTotalScore] = useState(0);
  const [formData, setFormData] = useState({
    activityPeriod: '',
    activity: '',
    // ... other form data
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = (form: HTMLFormElement) => {
    const total = Array.from(form.elements)
      .filter(element => element instanceof HTMLSelectElement)
      .reduce((sum, select) => sum + parseInt((select as HTMLSelectElement).value), 0);
    setTotalScore(total);
  };

  useEffect(() => {
    const form = document.getElementById('evaluationForm') as HTMLFormElement;
    if (form) {
      calculateTotal(form);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const evaluation: Evaluation = {
      date: new Date().toISOString().split('T')[0],
      totalScore,
      comment: formData.get('comment') as string,
      workLocation: formData.get('workLocation') as string,
      jobRole: formData.get('jobRole') as string,
      specificTask: formData.get('specificTask') as string,
      activityPeriod: formData.get('activityPeriod') as string,
      activity: formData.get('activity') as string,
    };

    onSubmit(evaluation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mitarbeiterbewertung für {employeeName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Schließen
          </button>
        </div>
        <fieldset className="mb-4">
          <legend className="font-bold mb-2">Mitarbeiterinformationen</legend>
          <div className="space-y-2">
            <div>
              <label htmlFor="employeeName" className="block">Name des Mitarbeiters:</label>
              <input type="text" id="employeeName" name="employeeName" className="w-full border rounded p-2" defaultValue={employeeName} readOnly />
            </div>
            <div>
              <label htmlFor="workLocation" className="block">Arbeitsort:</label>
              <input type="text" id="workLocation" name="workLocation" className="w-full border rounded p-2" required />
            </div>
            <div>
              <label htmlFor="activityPeriod" className="block">Tätigkeitszeitraum (Kalenderwoche von bis):</label>
              <input
                type="text"
                id="activityPeriod"
                name="activityPeriod"
                value={formData.activityPeriod}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="z.B. KW 20 - KW 22"
                required
              />
            </div>
            <div>
              <label htmlFor="activity" className="block">Tätigkeit:</label>
              <input
                type="text"
                id="activity"
                name="activity"
                value={formData.activity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="z.B. IBN, Aufstellung, Überholung, Retrofit"
                required
              />
            </div>
            <div>
              <label htmlFor="jobRole" className="block">Tätigkeit:</label>
              <input type="text" id="jobRole" name="jobRole" className="w-full border rounded p-2" required />
            </div>
            <div>
              <label htmlFor="specificTask" className="block">Spezifische Aufgabe:</label>
              <input type="text" id="specificTask" name="specificTask" className="w-full border rounded p-2" placeholder="z.B. Neuaufstellung, Überholung, Retrofit" required />
            </div>
          </div>
        </fieldset>
        <form id="evaluationForm" onSubmit={handleSubmit} onChange={(e) => calculateTotal(e.currentTarget)}>
          <fieldset className="mb-4">
            <legend className="font-bold mb-2">1. Fachliche Fähigkeiten (Max. 20 Punkte)</legend>
            <div className="space-y-2">
              <div>
                <label htmlFor="fachlicheKompetenz" className="block">Fachliche Kompetenz (10 Punkte):</label>
                <select id="fachlicheKompetenz" name="fachlicheKompetenz" className="w-full border rounded p-2">
                  <option value="10">Exzellent (10 Punkte): Beherrscht alle relevanten Technologien und Problemlösungen</option>
                  <option value="8">Gut (8 Punkte): Gute technische Fähigkeiten, geringe Unterstützung erforderlich</option>
                  <option value="6">Befriedigend (6 Punkte): Durchschnittliche technische Fähigkeiten, gelegentlich Unterstützung erforderlich</option>
                  <option value="4">Ausreichend (4 Punkte): Grundlegende Fähigkeiten, häufig Unterstützung erforderlich</option>
                  <option value="2">Unzureichend (2 Punkte): Fachliche Defizite, regelmäßige Unterstützung erforderlich</option>
                </select>
              </div>
              <div>
                <label htmlFor="zuverlaessigkeit" className="block">Zuverlässigkeit (10 Punkte):</label>
                <select id="zuverlaessigkeit" name="zuverlaessigkeit" className="w-full border rounded p-2">
                  <option value="10">Exzellent (10 Punkte): Immer pünktlich, hält alle Termine ein</option>
                  <option value="8">Gut (8 Punkte): Meist pünktlich, kleine Verspätungen</option>
                  <option value="4">Befriedigend (4 Punkte): Gelegentliche Verspätungen, häufige Terminänderungen</option>
                  <option value="2">Ausreichend (2 Punkte): Unzuverlässig, oft nicht erreichbar</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-4">
            <legend className="font-bold mb-2">2. Arbeitsqualität (Max. 20 Punkte)</legend>
            <div className="space-y-2">
              <div>
                <label htmlFor="qualitaetAusfuehrung" className="block">Qualität der Ausführung (10 Punkte):</label>
                <select id="qualitaetAusfuehrung" name="qualitaetAusfuehrung" className="w-full border rounded p-2">
                  <option value="10">Exzellent (10 Punkte): Hohe Präzision, keine Nacharbeit erforderlich</option>
                  <option value="8">Gut (8 Punkte): Gute Ausführung, minimale Nacharbeit erforderlich</option>
                  <option value="6">Befriedigend (6 Punkte): Durchschnittliche Ausführung, gelegentliche Nacharbeit erforderlich</option>
                  <option value="4">Ausreichend (4 Punkte): Häufige Nacharbeit erforderlich</option>
                  <option value="2">Unzureichend (2 Punkte): Hohe Fehlerquote, häufige Nacharbeit erforderlich</option>
                </select>
              </div>
              <div>
                <label htmlFor="dokumentation" className="block">Dokumentation und Berichtswesen (10 Punkte):</label>
                <select id="dokumentation" name="dokumentation" className="w-full border rounded p-2">
                  <option value="10">Exzellent (10 Punkte): Vollständige, präzise und zeitnahe Dokumentation</option>
                  <option value="8">Gut (8 Punkte): Gute Dokumentation, geringe Nachbesserungen erforderlich</option>
                  <option value="6">Befriedigend (6 Punkte): Durchschnittliche Dokumentation, gelegentliche Unvollständigkeiten</option>
                  <option value="4">Ausreichend (4 Punkte): Unvollständige Dokumentation, regelmäßige Nachbesserungen erforderlich</option>
                  <option value="2">Unzureichend (2 Punkte): Unvollständige oder fehlerhafte Dokumentation</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-4">
            <legend className="font-bold mb-2">3. Teamarbeit und Kommunikation (Max. 35 Punkte)</legend>
            <div className="space-y-2">
              <div>
                <label htmlFor="zusammenarbeit" className="block">Zusammenarbeit im Team (15 Punkte):</label>
                <select id="zusammenarbeit" name="zusammenarbeit" className="w-full border rounded p-2">
                  <option value="15">Exzellent (15 Punkte): Hervorragende Zusammenarbeit und Unterstützung für Kollegen</option>
                  <option value="10">Gut (10 Punkte): Gute Zusammenarbeit, gelegentliche Unterstützung erforderlich</option>
                  <option value="6">Befriedigend (6 Punkte): Durchschnittliche Zusammenarbeit, gelegentliche Konflikte</option>
                  <option value="4">Ausreichend (4 Punkte): Häufige Schwierigkeiten bei der Zusammenarbeit</option>
                  <option value="2">Unzureichend (2 Punkte): Schwierigkeiten bei der Teamarbeit, wenig Unterstützung</option>
                </select>
              </div>
              <div>
                <label htmlFor="kommunikation" className="block">Kommunikationsfähigkeiten (10 Punkte):</label>
                <select id="kommunikation" name="kommunikation" className="w-full border rounded p-2">
                  <option value="10">Exzellent (10 Punkte): Klare, präzise und effektive Kommunikation</option>
                  <option value="8">Gut (8 Punkte): Gute Kommunikation, geringe Missverständnisse</option>
                  <option value="6">Befriedigend (6 Punkte): Durchschnittliche Kommunikation, gelegentliche Missverständnisse</option>
                  <option value="4">Ausreichend (4 Punkte): Häufige Missverständnisse, Verbesserung erforderlich</option>
                  <option value="2">Unzureichend (2 Punkte): Unklare Kommunikation, häufige Missverständnisse</option>
                </select>
              </div>
              <div>
                <label htmlFor="konfliktmanagement" className="block">Konfliktmanagement (10 Punkte):</label>
                <select id="konfliktmanagement" name="konfliktmanagement" className="w-full border rounded p-2">
                  <option value="10">Exzellent (10 Punkte): Sehr guter Umgang mit Konflikten, konstruktive Lösungen</option>
                  <option value="8">Gut (8 Punkte): Guter Umgang mit Konflikten, Lösungen und Deeskalationen</option>
                  <option value="6">Befriedigend (6 Punkte): Frühzeitige Wahrnehmung von Konflikten, aktives Gegensteuern</option>
                  <option value="4">Ausreichend (4 Punkte): Durchschnittlicher Umgang, Konflikte werden hin und wieder gelöst</option>
                  <option value="2">Unzureichend (2 Punkte): Schlechter Umgang, Eskalationen werden häufig nicht vermieden</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-4">
            <legend className="font-bold mb-2">4. Eigenverantwortung und Initiative (Max. 25 Punkte)</legend>
            <div className="space-y-2">
              <div>
                <label htmlFor="selbststaendigkeit" className="block">Selbstständigkeit und Problemlösungsfähigkeiten (10 Punkte):</label>
                <select id="selbststaendigkeit" name="selbststaendigkeit" className="w-full border rounded p-2">
                  <option value="10">Exzellent (10 Punkte): Hohe Selbstständigkeit, proaktive Problemlösung</option>
                  <option value="8">Gut (8 Punkte): Gute Selbstständigkeit, schnelle Problemlösung</option>
                  <option value="6">Befriedigend (6 Punkte): Durchschnittliche Selbstständigkeit, gelegentliche Unterstützung erforderlich</option>
                  <option value="4">Ausreichend (4 Punkte): Häufige Unterstützung erforderlich, geringe Initiative</option>
                  <option value="2">Unzureichend (2 Punkte): Geringe Selbstständigkeit, wenig Initiative</option>
                </select>
              </div>
              <div>
                <label htmlFor="vorschriften" className="block">Einhalten von Vorschriften und Richtlinien (15 Punkte):</label>
                <select id="vorschriften" name="vorschriften" className="w-full border rounded p-2">
                  <option value="15">Exzellent (15 Punkte): Strikte Einhaltung aller Vorschriften und Richtlinien</option>
                  <option value="10">Gut (10 Punkte): Geringfügige Abweichungen, insgesamt gute Einhaltung</option>
                  <option value="6">Befriedigend (6 Punkte): Durchschnittliche Einhaltung, gelegentliche Verstöße</option>
                  <option value="4">Ausreichend (4 Punkte): Häufige Verstöße gegen Vorschriften</option>
                  <option value="2">Unzureichend (2 Punkte): Regelmäßige Verstöße, erheblicher Verbesserungsbedarf</option>
                </select>
              </div>
            </div>
          </fieldset>

          <div className="mb-4">
            <label htmlFor="comment" className="block font-bold mb-2">Kommentar:</label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              className="w-full border rounded p-2"
              placeholder="Zusätzliche Bemerkungen oder Empfehlungen"
            ></textarea>
          </div>

          <div className="mb-4">
            <p className="font-bold">Gesamtpunktzahl: <span id="totalScore">{totalScore}</span> / 100</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Bewertung einreichen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;

