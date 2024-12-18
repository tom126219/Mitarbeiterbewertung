export interface Employee {
  id: string
  name: string
  hireDate: string
  qualification: string
  sparte: string
  evaluations?: Evaluation[]
}

export interface Evaluation {
  employeeName: string;
  workLocation: string;
  activityPeriod: string;
  activity: string;
  fachlicheKompetenz: number;
  zuverlaessigkeit: number;
  qualitaetAusfuehrung: number;
  dokumentation: number;
  zusammenarbeit: number;
  kommunikation: number;
  konfliktmanagement: number;
  selbststaendigkeit: number;
  vorschriften: number;
  totalScore: number;
  comment: string;
  date: string;
}

