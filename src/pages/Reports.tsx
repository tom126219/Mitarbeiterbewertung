import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { BarChart, TrendingUp, Star, UserMinus, ArrowUpDown, LineChart, Cloud, Loader2 } from 'lucide-react';
import { calculationService } from '../services/calculationService';
import { employeeStore } from '../store/employeeStore';
import MiniChart from '../components/MiniChart';
import ErrorBoundary from '../components/ErrorBoundary';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Filler } from 'chart.js';
import { Doughnut, Bar, Line, Radar } from 'react-chartjs-2';
import { Button } from '../components/ui/button';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  RadialLinearScale,
  Filler
);

// Lazy load the ChartComponent with a loading fallback
const ChartComponent = lazy(() => import('./ChartComponent'));

interface Employee {
  id: number;
  name: string;
  evaluations?: { workLocation: string; date: string }[];
  requestedEvaluations: number;
}

const Reports: React.FC = () => {
  const [averageScore, setAverageScore] = useState<number>(0);
  const [scoreDevelopment, setScoreDevelopment] = useState<{ date: string; averageScore: number }[]>([]);
  const [topPerformers, setTopPerformers] = useState<{ name: string; averageScore: number }[]>([]);
  const [improvement, setImprovement] = useState<{ category: string; averageScore: number }[]>([]);
  const [strengths, setStrengths] = useState<{ category: string; averageScore: number }[]>([]);
  const [changes, setChanges] = useState<{ name: string; changes: { date: string; score: number }[]; trend: number }[]>([]);
  const [trends, setTrends] = useState<{ date: string; averageScore: number; totalEvaluations: number }[]>([]);
  const [wordCloud, setWordCloud] = useState<{ word: string; count: number }[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requestedEvaluations, setRequestedEvaluations] = useState<{ [key: number]: number }>({});
  const [requestedEvaluationsError, setRequestedEvaluationsError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    let isMounted = true;
    const fetchData = async () => {
      try {
        console.log('Starting data fetch...');
        setIsLoading(true);
        setError(null);

        if (isMounted) {
          console.log('Fetching improvement potential...');
          const imp = await calculationService.getImprovementPotential();
          console.log('Improvement potential data:', imp);
          if (imp.length !== 5) {
            console.warn(`Expected 5 improvement areas, but got ${imp.length}`);
          }
          setImprovement(imp);
        }

        if (isMounted) {
          console.log('Fetching average score...');
          const avgScore = await calculationService.getAverageScore();
          console.log('Average score:', avgScore);
          setAverageScore(avgScore);
        }

        if (isMounted) {
          console.log('Fetching score development...');
          const scoreDev = await calculationService.getScoreDevelopment();
          console.log('Score development:', scoreDev);
          if (scoreDev.length > 0) {
            setScoreDevelopment(scoreDev);
            console.log('Updated scoreDevelopment state:', scoreDev);
          } else {
            console.warn('Received empty score development data');
          }
        }

        if (isMounted) {
          console.log('Fetching top performers...');
          const topPerf = await calculationService.getTopPerformers();
          console.log('Top performers:', topPerf);
          setTopPerformers(topPerf);
        }

        if (isMounted) {
          console.log('Fetching strengths and weaknesses...');
          const str = await calculationService.getStrengthsAndWeaknesses();
          console.log('Strengths and weaknesses:', str);
          setStrengths(str);
        }

        if (isMounted) {
          console.log('Fetching changes...');
          const chg = await calculationService.getScoreChangesOverTime();
          console.log('Changes:', chg);
          setChanges(chg);
        }

        if (isMounted) {
          console.log('Fetching trends...');
          const trd = await calculationService.getEvaluationTrends();
          console.log('Trends:', trd);
          setTrends(trd);
        }

        if (isMounted) {
          console.log('Fetching word cloud...');
          const wc = await calculationService.getWordCloud();
          console.log('Word cloud:', wc);
          setWordCloud(wc);
        }

        if (isMounted) {
          console.log('Fetching employees...');
          const emp = await employeeStore.getAllEmployees();
          console.log('Employees:', emp);
          setEmployees(emp);
        }

        if (isMounted) {
          console.log('Fetching requested evaluations...');
          try {
            const reqEval = await employeeStore.getRequestedEvaluations();
            console.log('Requested evaluations:', reqEval);
            setRequestedEvaluations(reqEval);
          } catch (error) {
            console.error('Error fetching requested evaluations:', error);
            setRequestedEvaluations({});
          }
        }
        if (isMounted) {
          console.log('Fetching all requested evaluations...');
          try {
            const allReqEval = await employeeStore.getAllRequestedEvaluations();
            console.log('All requested evaluations:', allReqEval);
            setRequestedEvaluations(allReqEval);
          } catch (error) {
            console.error('Error fetching all requested evaluations:', error);
            setRequestedEvaluationsError('Fehler beim Laden der angeforderten Bewertungen.');
          }
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError('Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    console.log('scoreDevelopment state updated:', scoreDevelopment);
  }, [scoreDevelopment]);

  const getPreviewData = (reportId: string) => {
    switch (reportId) {
      case 'changes':
        return changes.flatMap(performer => performer.changes);
      case 'scoreDevelopment':
        return scoreDevelopment.map(d => ({ date: d.date, score: d.averageScore }));
      case 'evaluationDensity':
        return trends.map(d => ({ date: d.date, score: d.averageScore }));
      default:
        return [];
    }
  };

  const calculateMissingEvaluations = (employees: Employee[]): number => {
    if (employees.length === 0) return 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const employeesWithOpenEvaluations = employees.filter(employee => {
      const recentEvaluations = (employee.evaluations || []).filter(
        evaluation => new Date(evaluation.date) >= sixMonthsAgo
      );
      return recentEvaluations.length === 0 || employee.requestedEvaluations > 0;
    });

    return employeesWithOpenEvaluations.length;
  };

  const getEmployeesWithOpenEvaluations = (): Employee[] => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return employees.filter(employee => {
      // Check if employee has any evaluations
      const hasEvaluations = employee.evaluations && employee.evaluations.length > 0;
      
      // Get the date of the last evaluation if it exists
      const lastEvaluationDate = hasEvaluations 
        ? new Date(employee.evaluations[employee.evaluations.length - 1].date)
        : null;

      // Get the number of requested evaluations
      const requestedCount = requestedEvaluations[employee.id] || 0;

      // Employee needs evaluation if:
      // 1. They have no evaluations, OR
      // 2. Their last evaluation is older than 6 months, OR
      // 3. They have requested evaluations pending
      return !hasEvaluations || 
             (lastEvaluationDate && lastEvaluationDate < sixMonthsAgo) || 
             requestedCount > 0;
    });
  };

  const generatePDFContent = (employeesWithOpenEvaluations: Employee[]): string => {
    const currentDate = new Date().toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });

    let content = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            h1, h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Mitarbeiter mit offenen Bewertungen</h1>
          <h2>Bericht erstellt am: ${currentDate}</h2>
          <table>
            <tr>
              <th>Name</th>
              <th>Letzte Bewertung</th>
              <th>Angeforderte Bewertungen</th>
              <th>Exportdatum Bewertungsbogen</th>
            </tr>
    `;

    employeesWithOpenEvaluations.forEach(employee => {
      const lastEvaluation = employee.evaluations && employee.evaluations.length > 0
        ? new Date(employee.evaluations[employee.evaluations.length - 1].date).toLocaleDateString('de-DE')
        : 'Keine';
      const exportDate = employee.requestedEvaluations > 0
        ? new Date().toLocaleDateString('de-DE')
        : 'Nicht exportiert';
      content += `
        <tr>
          <td>${employee.name}</td>
          <td>${lastEvaluation}</td>
          <td>${employee.requestedEvaluations}</td>
          <td>${exportDate}</td>
        </tr>
      `;
    });

    content += `
          </table>
        </body>
      </html>
    `;

    return content;
  };

  const downloadPDF = (employeesWithOpenEvaluations: Employee[]) => {
    const content = generatePDFContent(employeesWithOpenEvaluations);
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    link.download = `Mitarbeiter_mit_offenen_Bewertungen_${currentDate}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCategoryName = (category: string): string => {
    const translations: Record<string, string> = {
      'fachlicheKompetenz': 'Fachliche Kompetenz',
      'zuverlaessigkeit': 'Zuverlässigkeit',
      'qualitaetAusfuehrung': 'Qualität',
      'dokumentation': 'Dokumentation',
      'zusammenarbeit': 'Zusammenarbeit',
      'kommunikation': 'Kommunikation',
      'konfliktmanagement': 'Konfliktmanagement',
      'selbststaendigkeit': 'Selbstständigkeit',
      'vorschriften': 'Vorschriften'
    };
    return translations[category] || category;
  };

  const renderReportDetails = () => {
    console.log('Rendering report:', selectedReport);

    if (!selectedReport) return null;

    const report = reports.find(r => r.id === selectedReport);
    if (!report) return null;

    switch (selectedReport) {
      case 'averageScore':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">{report.title}</h2>
            <p className="text-lg mb-2">Durchschnittliche Gesamtpunktzahl: <span className="font-bold">{averageScore.toFixed(1)}</span></p>
            <p>Diese Zahl repräsentiert die durchschnittliche Leistung aller Mitarbeiter.</p>
          </div>
        );

      case 'scoreDevelopment':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Entwicklung der Gesamtpunktzahl</h2>
            <p className="mb-2">Diese Daten zeigen die Entwicklung der durchschnittlichen Gesamtpunktzahl über die letzten 12 Monate, basierend auf 50% der erfassten Mitarbeiter.</p>
            <div className="h-64 w-full">
              <Line
                data={{
                  labels: scoreDevelopment.map(score => score.date),
                  datasets: [{
                    label: 'Durchschnittliche Punktzahl',
                    data: scoreDevelopment.map(score => score.averageScore),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      display: true,
                      title: {
                        display: true,
                        text: 'Durchschnittliche Punktzahl'
                      }
                    },
                    x: {
                      display: true,
                      title: {
                        display: true,
                        text: 'Monat'
                      }
                    },
                  },
                }}
              />
            </div>
            <ul className="list-disc pl-5 mt-4">
              {scoreDevelopment.map((score, index) => (
                <li key={index}>
                  {score.date}: <span className="font-bold">{score.averageScore.toFixed(1)}</span> Punkte
                </li>
              ))}
            </ul>
          </div>
        );

      case 'topPerformers':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Top-Performer</h2>
            <p className="mb-4">Hier sind die Mitarbeiter mit den höchsten durchschnittlichen Bewertungen aufgeführt.</p>
            <div className="h-64 w-full">
              <Bar
                data={{
                  labels: topPerformers.slice(0, 5).map(p => p.name),
                  datasets: [{
                    label: 'Durchschnittliche Punktzahl',
                    data: topPerformers.slice(0, 5).map(p => p.averageScore),
                    backgroundColor: topPerformers.slice(0, 5).map((_, index) => `rgba(0, 128, 0, ${1 - index * 0.15})`),
                    borderColor: topPerformers.slice(0, 5).map((_, index) => `rgba(0, 128, 0, ${1 - index * 0.15})`),
                    borderWidth: 1
                  }]
                }}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }}
              />
            </div>
          </div>
        );

      case 'improvement':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Verbesserungspotential</h2>
            <p className="mb-4">Diese Bereiche zeigen das größte Potenzial für Verbesserungen.</p>
            <div className="h-64 w-full">
              <Bar
                data={{
                  labels: improvement.slice(0, 5).map(area => formatCategoryName(area.category)),
                  datasets: [{
                    label: 'Durchschnittliche Punktzahl',
                    data: improvement.slice(0, 5).map(area => area.averageScore),
                    backgroundColor: improvement.slice(0, 5).map((_, index) => `rgba(255, 0, 0, ${0.2 + index * 0.2})`),
                    borderColor: improvement.slice(0, 5).map((_, index) => `rgba(255, 0, 0, ${0.4 + index * 0.2})`),
                    borderWidth: 1
                  }]
                }}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 10
                    }
                  }
                }}
              />
            </div>
          </div>
        );

      case 'strengths':
        const topStrengths = strengths.slice(0, 3);
        const bottomWeaknesses = strengths.slice(-3).reverse();
        const combinedData = [...topStrengths, ...bottomWeaknesses];

        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Stärken und Schwächen</h2>
            <p className="mb-4">Hier sehen Sie eine Gegenüberstellung der Top 3 Stärken und der 3 größten Schwächen.</p>
            <div className="h-64 w-full">
              <Bar
                data={{
                  labels: combinedData.map(item => formatCategoryName(item.category)),
                  datasets: [{
                    label: 'Durchschnittliche Punktzahl',
                    data: combinedData.map(item => item.averageScore),
                    backgroundColor: combinedData.map((_, index) =>
                      index < 3
                        ? `rgba(0, 0, 255, ${1 - index * 0.2})`
                        : `rgba(255, 0, 0, ${0.4 + (index - 3) * 0.3})`
                    ),
                    borderColor: combinedData.map((_, index) =>
                      index < 3
                        ? `rgba(0, 0, 255, ${1 - index * 0.2})`
                        : `rgba(255, 0, 0, ${0.4 + (index - 3) * 0.3})`
                    ),
                    borderWidth: 1
                  }]
                }}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 10
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        );

      case 'changes':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Veränderung im Zeitverlauf</h2>
            <p className="mb-4">Diese Grafik zeigt die Entwicklung der Bewertungen für die 3 Mitarbeiter mit dem stärksten Aufwärtstrend und die 3 Mitarbeiter mit dem stärksten Abwärtstrend über die letzten 12 Monate.</p>

            {isClient && changes.length > 0 && (
              <div className="h-[400px] w-full">
                <Line
                  data={{
                    labels: changes[0].changes.map(c => new Date(c.date).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })),
                    datasets: changes.map((employee, index) => ({
                      label: employee.name,
                      data: employee.changes.map(c => c.score),
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                      ][index],
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                      ][index],
                      fill: false,
                      tension: 0.1
                    }))
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Datum'
                        }
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Punktzahl'
                        },
                        min: 0,
                        max: 100
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      }
                    }
                  }}
                />
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2 text-blue-600">Stärkster Aufwärtstrend</h3>
                <ul className="list-disc pl-5">
                  {changes.slice(0, 3).map((employee, index) => (
                    <li key={index} className="mb-1">
                      {employee.name} (Trend: {employee.trend.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-red-600">Stärkster Abwärtstrend</h3>
                <ul className="list-disc pl-5">
                  {changes.slice(3).map((employee, index) => (
                    <li key={index} className="mb-1">
                      {employee.name} (Trend: {employee.trend.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'evaluationDensity':
        const employeesWithOpenEvaluations = getEmployeesWithOpenEvaluations();
        const currentDate = new Date().toLocaleDateString('de-DE', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Offene Bewertungen</h2>
            <p className="mb-2">Diese Kennzahl zeigt die Anzahl der Mitarbeiter, die in den letzten 6 Monaten keine Bewertung erhalten haben oder für die eine Bewertung angefordert wurde.</p>
            <p className="mb-4">Bericht erstellt am: {currentDate}</p>
            <div className="text-5xl font-bold text-pink-600 mb-4">
              {employeesWithOpenEvaluations.length} Mitarbeiter
            </div>
            {employeesWithOpenEvaluations.length > 0 ? (
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Betroffene Mitarbeiter:</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">Name</th>
                      <th className="border border-gray-300 px-4 py-2">Letzte Bewertung</th>
                      <th className="border border-gray-300 px-4 py-2">Angefordert</th>
                      <th className="border border-gray-300 px-4 py-2">Exportdatum Bewertungsbogen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeesWithOpenEvaluations.map(employee => (
                      <tr key={employee.id}>
                        <td className="border border-gray-300 px-4 py-2">{employee.name}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {employee.evaluations && employee.evaluations.length > 0
                            ? new Date(employee.evaluations[employee.evaluations.length - 1].date).toLocaleDateString('de-DE')
                            : 'Keine'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {requestedEvaluationsError 
                            ? requestedEvaluationsError 
                            : (requestedEvaluations[employee.id] || 0)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {requestedEvaluations[employee.id] > 0 ? currentDate : 'Nicht exportiert'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mb-4 text-gray-600">Keine Mitarbeiter mit offenen Bewertungen gefunden.</p>
            )}
            <Button onClick={() => downloadPDF(employeesWithOpenEvaluations)}>
              Als HTML herunterladen
            </Button>
            <p className="mt-4">Eine regelmäßige Bewertung (mindestens alle 6 Monate) wird für jeden Mitarbeiter empfohlen.</p>
          </div>
        );

      case 'wordCloud':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Häufigste Begriffe in Bewertungen</h2>
            <p className="mb-2">Dieses Spinnendiagramm zeigt die 5 häufigsten Wörter mit mindestens 4 Buchstaben in den Bewertungen.</p>
            <div className="h-[400px] w-full">
              <Radar
                data={{
                  labels: wordCloud.slice(0, 5).map(w => w.word),
                  datasets: [{
                    data: wordCloud.slice(0, 5).map(w => w.count),
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgb(99, 102, 241)',
                    pointBackgroundColor: 'rgb(99, 102, 241)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(99, 102, 241)'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scale: {
                    ticks: { beginAtZero: true }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const reports = [
    {
      id: 'averageScore',
      title: "Durchschnittliche Gesamtpunktzahl",
      value: `${averageScore.toFixed(1)} Punkte`,
      icon: BarChart,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      render: () => (
        <div className="relative w-full h-32">
          <Doughnut
            data={{
              datasets: [{
                data: [averageScore, 100 - averageScore],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderWidth: 0,
              }],
            }}
            options={{
              cutout: '70%',
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
              },
            }}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-2xl font-bold text-blue-600">{averageScore.toFixed(1)}</p>
            <p className="text-xs text-gray-500">von 100</p>
          </div>
        </div>
      )
    },
    {
      id: 'scoreDevelopment',
      title: "Entwicklung der Gesamtpunktzahl",
      value: `Letzte 12 Monate`,
      icon: TrendingUp,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      render: () => {
        console.log('Rendering scoreDevelopment chart. Data:', scoreDevelopment);
        return (
          <div className="w-full h-24">
            <Line
              data={{
                labels: scoreDevelopment.map(score => score.date),
                datasets: [{
                  label: 'Durchschnittliche Punktzahl',
                  data: scoreDevelopment.map(score => score.averageScore),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    display: true,
                    ticks: {
                      display: false,
                    },
                    grid: {
                      display: false,
                    },
                    border: {
                      display: true,
                    },
                  },
                  x: {
                    display: true,
                    ticks: {
                      display: false,
                    },
                    grid: {
                      display: false,
                    },
                    border: {
                      display: true,
                    },
                  },
                },
              }}
            />
          </div>
        );
      }
    },
    {
      id: 'topPerformers',
      title: "Top-Performer",
      value: `${topPerformers.length} Mitarbeiter`,
      icon: Star,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      render: () => (
        <div className="w-full h-32 flex items-center justify-center">
          <MiniChart
            data={topPerformers.slice(0, 5).map((p, index) => ({
              label: p.name,
              value: p.averageScore,
              color: `rgba(34, 197, 94, ${1 - index * 0.15})`
            }))}
            type="bar"
            horizontal={true}
            height={80}
          />
        </div>
      )
    },
    {
      id: 'improvement',
      title: "Verbesserungspotential",
      value: "5 Bereiche",
      icon: UserMinus,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      render: () => (
        <div className="w-full h-32 flex items-center justify-center">
          <MiniChart
            data={improvement.slice(0, 5).map((area, index) => ({
              label: formatCategoryName(area.category),
              value: area.averageScore,
              color: `rgba(239, 68, 68, ${0.2 + index * 0.2})`
            }))}
            type="bar"
            horizontal={true}
            height={80}
          />
        </div>
      )
    },
    {
      id: 'strengths',
      title: "Stärken und Schwächen",
      value: "Top 3 vs. Bottom 3",
      icon: ArrowUpDown,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      render: () => {
        const topStrengths = strengths.slice(0, 3);
        const bottomWeaknesses = strengths.slice(-3).reverse();
        const combinedData = [...topStrengths, ...bottomWeaknesses];

        return (
          <div className="w-full h-full flex items-center justify-center">
            <MiniChart
              data={combinedData.map((item, index) => ({
                label: formatCategoryName(item.category),
                value: item.averageScore,
                color: index < 3
                  ? `rgba(0, 0, 255, ${1 - index * 0.2})`
                  : `rgba(255, 0, 0, ${0.4 + (index - 3) * 0.3})`
              }))}
              type="bar"
              horizontal={true}
              height={100}
            />
          </div>
        );
      }
    },
    {
      id: 'changes',
      title: "Veränderung im Zeitverlauf",
      value: "Top 3 Auf- und Abwärtstrends",
      icon: TrendingUp,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      render: () => (
        <div className="w-full h-full flex items-center justify-center">
          <MiniChart
            data={changes.map((employee, index) => ({
              label: employee.name,             value: employee.trend,
              color: index < 3 ? `rgba(0, 0, 255, ${1 - index * 0.2})` : `rgba(255, 0, 0, ${0.4 + (index - 3) * 0.2})`
            }))}
            type="bar"
            horizontal={true}
            height={100}
          />
        </div>
      )
    },
    {
      id: 'evaluationDensity',
      title: "Offene Bewertungen",
      value: `${calculateMissingEvaluations(employees)} Mitarbeiter`,
      icon: LineChart,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50",
      render: () => (
        <div className="w-full h-32 flex items-center justify-center">
          <div className="text-3xl font-bold text-pink-600">
            {calculateMissingEvaluations(employees)} MA
          </div>
        </div>
      )
    },
    {
      id: 'wordCloud',
      title: "Häufigste Begriffe",
      value:"Top 5 Begriffe",
      icon: Cloud,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      render: () => (
        <div className="w-full h-32 flex items-center justify-center">
          <Radar
            data={{
              labels: wordCloud.slice(0, 5).map(w => w.word),
              datasets: [{
                data: wordCloud.slice(0, 5).map(w => w.count),
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgb(99, 102, 241)',
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(99, 102, 241)'
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scale: {
                ticks: { beginAtZero: true }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      )
    }
  ];

  const handleCardClick = (reportId: string) => {
    console.log('Clicked report:', reportId);
    setSelectedReport(reportId);
  };

  const closeDialog = () => {
    setSelectedReport(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Lade Auswertungen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Auswertungen</h1>

      <Card className="bg-white shadow-md">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Übersicht</h2>
          <p className="text-gray-600 mb-4">Klicken Sie auf einen Bericht, um Details anzuzeigen.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`group relative flex flex-col items-center p-4 ${report.bgColor} rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden`}
                onClick={() => handleCardClick(report.id)}
              >
                <report.icon className={`h-6 w-6 ${report.iconColor} mb-2`} />
                <h3 className="text-sm font-medium text-gray-500 text-center mb-4">{report.title}</h3>

                {/* Chart/Visual Area */}
                <div className="w-full h-24 flex items-center justify-center">
                  {report.render()}
                </div>

                <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg p-4 flex flex-col justify-center">
                  <div className="flex flex-col justify-center">
                    <p className="font-medium text-gray-900">{report.title}</p>
                    {report.id === 'averageScore' && (
                      <p className="text-sm text-gray-700 mt-2">Durchschnitt: {averageScore.toFixed(1)} Punkte</p>
                    )}
                    {report.id === 'scoreDevelopment' && scoreDevelopment.length > 0 && (
                      <p className="text-sm text-gray-700 mt-2">Letzte Entwicklung: {scoreDevelopment[scoreDevelopment.length - 1].averageScore.toFixed(1)} Punkte</p>
                    )}
                    {report.id === 'topPerformers' && topPerformers.length > 0 && (
                      <p className="text-sm text-gray-700 mt-2">Bester Performer: {topPerformers[0].name} ({topPerformers[0].averageScore.toFixed(1)} Punkte)</p>
                    )}
                    {report.id === 'improvement' && improvement.length > 0 && (
                      <p className="text-sm text-gray-700 mt-2">Größtes Potenzial: {formatCategoryName(improvement[0].category)} ({improvement[0].averageScore.toFixed(1)} Punkte)</p>
                    )}
                    {report.id === 'strengths' && strengths.length > 0 && (
                      <p className="text-sm text-gray-700 mt-2">
                        Top Stärke: {formatCategoryName(strengths[0].category)} ({strengths[0].averageScore.toFixed(1)})
                        <br />
                        Größte Schwäche: {formatCategoryName(strengths[strengths.length - 1].category)} ({strengths[strengths.length - 1].averageScore.toFixed(1)})
                      </p>
                    )}
                    {report.id === 'changes' && changes.length > 0 && (
                      <p className="text-sm text-gray-700 mt-2">Anzahl der Mitarbeiter: {changes.length}</p>
                    )}
                    {report.id === 'evaluationDensity' && employees.length > 0 && (
                      <p className="text-sm text-gray-700 mt-2">Anzahl: {calculateMissingEvaluations(employees)} Mitarbeiter ohne aktuelle Bewertung</p>
                    )}
                    {report.id === 'wordCloud' && wordCloud.length > 0 && (
                      <p className="text-sm text-gray-700 mt-2">
                        Top 5 Wörter mit mind. 4 Buchstaben
                      </p>
                    )}
                    <p className="text-sm text-blue-600 mt-2">Klicken für Details</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedReport !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{reports.find(r => r.id === selectedReport)?.title || 'Berichtsdetails'}</DialogTitle>
            <DialogDescription>Details zum ausgewählten Bericht</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {renderReportDetails()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;

