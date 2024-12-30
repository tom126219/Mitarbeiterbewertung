// This file exports the categories used in the evaluation form

const categories = [
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

module.exports = categories;

