import { employeeStore } from '../store/employeeStore';

interface Employee {
  id: number;
  name: string;
  beruf: string;
  sparte: string;
  hireDate: Date;
  evaluationCount: number;
}

interface Evaluation {
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

const DEFAULT_DATA = {
  averageScore: 75,
  scoreDevelopment: [
    { date: '2024-01', averageScore: 70 },
    { date: '2024-02', averageScore: 75 },
    { date: '2024-03', averageScore: 80 }
  ],
  topPerformers: [
    { name: 'Beispiel Mitarbeiter 1', averageScore: 90 },
    { name: 'Beispiel Mitarbeiter 2', averageScore: 85 }
  ],
  improvementPotential: [
    { category: 'dokumentation', averageScore: 65 },
    { category: 'kommunikation', averageScore: 70 },
    { category: 'konfliktmanagement', averageScore: 72 },
    { category: 'selbststaendigkeit', averageScore: 75 },
    { category: 'qualitaetAusfuehrung', averageScore: 78 }
  ],
  strengths: [
    { category: 'fachlicheKompetenz', averageScore: 85 },
    { category: 'zuverlaessigkeit', averageScore: 82 }
  ],
  wordCloud: [
    { word: 'Zuverlässig', count: 15 },
    { word: 'Kompetent', count: 12 }
  ]
};

export const calculationService = {
  async getAverageScore(): Promise<number> {
    try {
      console.log('Calculating average score...');
      const employees = await employeeStore.getAllEmployees();
      let totalScore = 0;
      let totalEvaluations = 0;

      for (const employee of employees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        evaluations.forEach(evaluation => {
          totalScore += evaluation.totalScore;
          totalEvaluations++;
        });
      }

      return totalEvaluations > 0 ? totalScore / totalEvaluations : 0;
    } catch (error) {
      console.error('Error calculating average score:', error);
      return DEFAULT_DATA.averageScore;
    }
  },

  async getScoreDevelopment(): Promise<{ date: string; averageScore: number }[]> {
    try {
      console.log('Calculating score development...');
      const employees = await employeeStore.getAllEmployees();
      const sampleSize = Math.ceil(employees.length / 2);
      const sampledEmployees = employees.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
  
      const scoresByDate: Record<string, { total: number; count: number }> = {};
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Process each employee's evaluations
      for (const employee of sampledEmployees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        
        // Filter and process evaluations
        evaluations
          .filter(evaluation => new Date(evaluation.date) >= oneYearAgo)
          .forEach(evaluation => {
            // Format date to YYYY-MM
            const date = evaluation.date.substring(0, 7);
            if (!scoresByDate[date]) {
              scoresByDate[date] = { total: 0, count: 0 };
            }
            scoresByDate[date].total += evaluation.totalScore;
            scoresByDate[date].count++;
          });
      }

      // Convert to array and sort by date
      const result = Object.entries(scoresByDate)
        .map(([date, { total, count }]) => ({
          date: date,
          averageScore: Math.round((total / count) * 10) / 10 // Round to 1 decimal
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      console.log('Score development data:', result);
      
      // If no data, return default data
      if (result.length === 0) {
        return [
          { date: '2024-01', averageScore: 70 },
          { date: '2024-02', averageScore: 75 },
          { date: '2024-03', averageScore: 80 }
        ];
      }

      return result;
    } catch (error) {
      console.error('Error calculating score development:', error);
      return DEFAULT_DATA.scoreDevelopment;
    }
  },

  async getTopPerformers(): Promise<{ name: string; averageScore: number }[]> {
    try {
      console.log('Calculating top performers...');
      const employees = await employeeStore.getAllEmployees();
      const performerScores: { name: string; averageScore: number }[] = [];

      for (const employee of employees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        if (evaluations.length > 0) {
          const averageScore = evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / evaluations.length;
          performerScores.push({ name: employee.name, averageScore });
        }
      }

      return performerScores.sort((a, b) => b.averageScore - a.averageScore).slice(0, 5);
    } catch (error) {
      console.error('Error calculating top performers:', error);
      return DEFAULT_DATA.topPerformers;
    }
  },

  async calculateStaffDilution(employees: Employee[]): Promise<number> {
    try {
      console.log('Calculating staff dilution...');
      const totalEmployees = employees.length;
      if (totalEmployees === 0) return 0;

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const newEmployees = employees.filter(emp => new Date(emp.hireDate) >= oneYearAgo);
      const dilutionRate = (newEmployees.length / totalEmployees) * 100;

      return dilutionRate;
    } catch (error) {
      console.error('Error calculating staff dilution:', error);
      return 0;
    }
  },

  async getCompletionRate(): Promise<number> {
    try {
      console.log('Calculating completion rate...');
      const employees = await employeeStore.getAllEmployees();
      const totalEmployees = employees.length;
      if (totalEmployees === 0) return 0;

      let employeesWithEvaluations = 0;

      for (const employee of employees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        if (evaluations.length > 0) {
          employeesWithEvaluations++;
        }
      }

      return (employeesWithEvaluations / totalEmployees) * 100;
    } catch (error) {
      console.error('Error calculating completion rate:', error);
      return 0;
    }
  },

  async getImprovementPotential(): Promise<{ category: string; averageScore: number }[]> {
    try {
      console.log('Calculating improvement potential...');
      const employees = await employeeStore.getAllEmployees();
      const categoryScores: Record<string, { total: number; count: number }> = {};

      // Initialize all possible categories
      const allCategories = [
        'fachlicheKompetenz',
        'zuverlaessigkeit',
        'qualitaetAusfuehrung',
        'dokumentation',
        'zusammenarbeit',
        'kommunikation',
        'konfliktmanagement',
        'selbststaendigkeit',
        'vorschriften'
      ];

      // Initialize all categories with zero scores
      allCategories.forEach(category => {
        categoryScores[category] = { total: 0, count: 0 };
      });

      for (const employee of employees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        evaluations.forEach(evaluation => {
          try {
            const scores = typeof evaluation.scores === 'string' 
              ? JSON.parse(evaluation.scores) 
              : evaluation.scores;

            Object.entries(scores).forEach(([category, score]) => {
              if (categoryScores[category]) {
                categoryScores[category].total += Number(score);
                categoryScores[category].count += 1;
              }
            });
          } catch (err) {
            console.error('Error processing evaluation scores:', err);
          }
        });
      }

      // Calculate average scores and sort by lowest scores first
      const result = Object.entries(categoryScores)
        .map(([category, { total, count }]) => ({
          category,
          averageScore: count > 0 ? total / count : 0
        }))
        .sort((a, b) => a.averageScore - b.averageScore) // Sort ascending (worst scores first)
        .slice(0, 5); // Take exactly 5 items

      console.log('Improvement potential results:', result);
      return result;
    } catch (error) {
      console.error('Error calculating improvement potential:', error);
      // Return 5 default items if there's an error
      return [
        { category: 'dokumentation', averageScore: 65 },
        { category: 'kommunikation', averageScore: 70 },
        { category: 'konfliktmanagement', averageScore: 72 },
        { category: 'selbststaendigkeit', averageScore: 75 },
        { category: 'qualitaetAusfuehrung', averageScore: 78 }
      ];
    }
  },

  async getStrengthsAndWeaknesses(): Promise<{ category: string; averageScore: number }[]> {
    try {
      console.log('Calculating strengths and weaknesses...');
      const employees = await employeeStore.getAllEmployees();
      const categories = [
        'fachlicheKompetenz',
        'zuverlaessigkeit',
        'qualitaetAusfuehrung',
        'dokumentation',
        'zusammenarbeit',
        'kommunikation',
        'konfliktmanagement',
        'selbststaendigkeit',
        'vorschriften'
      ];

      const categoryScores: Record<string, { total: number; count: number }> = {};

      // Initialize categories
      categories.forEach(category => {
        categoryScores[category] = { total: 0, count: 0 };
      });

      // Calculate scores for each category
      for (const employee of employees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        const processedEvaluations = evaluations.map(evaluation => ({
          ...evaluation,
          scores: typeof evaluation.scores === 'string' 
            ? JSON.parse(evaluation.scores) 
            : evaluation.scores || {}
        }));
        processedEvaluations.forEach(evaluation => {
          Object.entries(evaluation.scores).forEach(([category, score]) => {
            if (categoryScores[category]) {
              categoryScores[category].total += Number(score);
              categoryScores[category].count += 1;
            }
          });
        });
      }

      // Calculate averages and sort by highest scores
      return Object.entries(categoryScores)
        .map(([category, { total, count }]) => ({
          category,
          averageScore: count > 0 ? total / count : 0
        }))
        .sort((a, b) => b.averageScore - a.averageScore);
    } catch (error) {
      console.error('Error calculating strengths and weaknesses:', error);
      return DEFAULT_DATA.strengths;
    }
  },

  async getScoreChangesOverTime(): Promise<{ name: string; changes: { date: string; score: number }[]; trend: number }[]> {
    try {
      console.log('Calculating score changes over time...');
      const employees = await employeeStore.getAllEmployees();
      const result = [];

      for (const employee of employees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        if (evaluations.length > 0) {
          // Sort evaluations by date
          const sortedEvaluations = evaluations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Get evaluations for the last 12 months
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          const recentEvaluations = sortedEvaluations.filter(evaluation => new Date(evaluation.date) >= oneYearAgo);

          if (recentEvaluations.length >= 2) {
            const changes = recentEvaluations.map(evaluation => ({
              date: evaluation.date,
              score: evaluation.totalScore
            }));

            // Calculate trend (simple linear regression)
            const xValues = changes.map((_, index) => index);
            const yValues = changes.map(change => change.score);
            const trend = this.calculateTrend(xValues, yValues);

            result.push({
              name: employee.name,
              changes,
              trend
            });
          }
        }
      }

      // Sort by trend and get top 3 upward and top 3 downward
      const sortedResult = result.sort((a, b) => b.trend - a.trend);
      const topUpward = sortedResult.slice(0, 3);
      const topDownward = sortedResult.slice(-3).reverse();

      return [...topUpward, ...topDownward];
    } catch (error) {
      console.error('Error calculating score changes:', error);
      return [];
    }
  },

  calculateTrend(xValues: number[], yValues: number[]): number {
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  },

  async getWordCloud(): Promise<{ word: string; count: number }[]> {
    try {
      console.log('Generating word cloud...');
      const employees = await employeeStore.getAllEmployees();
      const wordCount: Record<string, number> = {};

      for (const employee of employees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        
        evaluations.forEach(evaluation => {
          const words = evaluation.comment
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3); // Only count words longer than 3 characters

          words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
          });
        });
      }

      return Object.entries(wordCount)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Return top 20 words
    } catch (error) {
      console.error('Error generating word cloud:', error);
      return DEFAULT_DATA.wordCloud;
    }
  },

  async getEvaluationTrends(): Promise<{ date: string; averageScore: number; totalEvaluations: number }[]> {
    try {
      console.log('Calculating evaluation trends...');
      const employees = await employeeStore.getAllEmployees();
      const monthlyData: Record<string, { total: number; count: number }> = {};

      for (const employee of employees) {
        const evaluations = await employeeStore.getEvaluationsForEmployee(employee.id);
        
        evaluations.forEach(evaluation => {
          const monthYear = evaluation.date.substring(0, 7); // YYYY-MM
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { total: 0, count: 0 };
          }
          monthlyData[monthYear].total += evaluation.totalScore;
          monthlyData[monthYear].count += 1;
        });
      }

      return Object.entries(monthlyData)
        .map(([date, { total, count }]) => ({
          date,
          averageScore: total / count,
          totalEvaluations: count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error calculating evaluation trends:', error);
      return [];
    }
  }
};

