export interface Employee {
  id: number;
  name: string;
  evaluations?: Evaluation[];
}

export interface Evaluation {
  id: number;
  employeeId: number;
  employeeName: string;
  workLocation: string;
  jobRole: string;
  specificTask: string;
  scores: Record<string, number>;
  comment: string;
  totalScore: number;
  date: string;
}

