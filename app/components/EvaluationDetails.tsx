import React from 'react';

const EvaluationDetails = ({ evaluation }) => {
  return (
    <div>
      {/* Existing code */}
      <h2>Evaluierungsdetails</h2>
      <p><strong>Mitarbeiter:</strong> {evaluation.employee}</p>
      <p><strong>Bewerter:</strong> {evaluation.evaluator}</p>
      <p><strong>Datum:</strong> {evaluation.date}</p>

      {/* Updated code to include new fields */}
      <p><strong>Arbeitsort:</strong> {evaluation.workLocation}</p>
      <p><strong>Tätigkeitszeitraum:</strong> {evaluation.activityPeriod}</p>
      <p><strong>Tätigkeit:</strong> {evaluation.activity}</p>

      {/* Rest of the existing code */}
      <p><strong>Gesamtbewertung:</strong> {evaluation.overallRating}</p>
      {/* ... more evaluation details ... */}
    </div>
  );
};

export default EvaluationDetails;

