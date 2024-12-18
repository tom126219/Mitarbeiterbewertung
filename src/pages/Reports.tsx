import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { BarChart, TrendingUp, Star, Cloud, UserMinus, PieChart, LineChart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const reportOptions = [
  {
    id: 'averageScore',
    name: 'Durchschnittliche Gesamtpunktzahl',
    description: 'Zeigt die durchschnittliche Gesamtpunktzahl aller Mitarbeiter an.',
  },
  {
    id: 'scoreOverTime',
    name: 'Entwicklung der Gesamtpunktzahl',
    description: 'Visualisiert die Entwicklung der durchschnittlichen Gesamtpunktzahl über die Zeit.',
  },
  {
    id: 'topPerformers',
    name: 'Top-Performer',
    description: 'Zeigt eine Liste der Top 5 Mitarbeiter mit den höchsten Gesamtpunktzahlen.',
  },
  {
    id: 'changeOverTime',
    name: 'Veränderung im Zeitverlauf',
    description: 'Visualisiert die Veränderung der durchschnittlichen Punktzahl über die Zeit.',
  },
  {
    id: 'categoryStrengthsWeaknesses',
    name: 'Stärken und Schwächen nach Kategorien',
    description: 'Zeigt die Stärken und Schwächen in verschiedenen Kategorien.',
  },
  {
    id: 'improvementPotential',
    name: 'Verbesserungspotential',
    description: 'Zeigt eine Liste der Mitarbeiter mit dem größten Verbesserungspotential.',
  },
  {
    id: 'evaluationTrends',
    name: 'Bewertungstrends',
    description: 'Zeigt die Trends in verschiedenen Bewertungskategorien.',
  },
  {
    id: 'wordCloud',
    name: 'Wortwolke',
    description: 'Zeigt häufig verwendete Wörter in den Bewertungskommentaren.',
  },
];

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState(reportOptions[0].id);
  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllReportData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allData = await Promise.all(
          reportOptions.map(async (option) => {
            const data = await getMockDataForReport(option.id);
            return { [option.id]: data };
          })
        );
        setReportData(Object.assign({}, ...allData));
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError('Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllReportData();
  }, []);

  const renderReportContent = (reportId: string, miniature: boolean = false) => {
    if (isLoading) return <p className="text-center">Laden...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!reportData[reportId]) return <p className="text-center">Keine Daten verfügbar</p>;

    const commonProps = {
      data: reportData[reportId],
      miniature,
      className: miniature ? 'h-full w-full' : 'h-[400px] w-full'
    };

    switch (reportId) {
      case 'averageScore':
        return <AverageScoreReport {...commonProps} />;
      case 'scoreOverTime':
      case 'changeOverTime':
        return <ScoreOverTimeReport {...commonProps} />;
      case 'topPerformers':
      case 'improvementPotential':
        return <TopPerformersReport {...commonProps} />;
      case 'categoryStrengthsWeaknesses':
        return <CategoryStrengthsWeaknessesReport {...commonProps} />;
      case 'evaluationTrends':
        return <EvaluationTrendsReport {...commonProps} />;
      case 'wordCloud':
        return <WordCloudReport {...commonProps} />;
      default:
        return <p className="text-center">Bitte wählen Sie einen Bericht aus.</p>;
    }
  };

  const handleReportClick = (reportId: string) => {
    setSelectedReport(reportId);
    setDialogContent(renderReportContent(reportId, false));
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Auswertungen</h1>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
          <CardDescription>Klicken Sie auf einen Bericht, um Details anzuzeigen.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {reportOptions.map((option) => (
              <div
                key={option.id}
                className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  option.id === 'averageScore' ? 'bg-blue-50' :
                    option.id === 'scoreOverTime' ? 'bg-green-50' :
                      option.id === 'topPerformers' ? 'bg-yellow-50' :
                        option.id === 'improvementPotential' ? 'bg-red-50' :
                          option.id === 'categoryStrengthsWeaknesses' ? 'bg-orange-50' :
                            option.id === 'changeOverTime' ? 'bg-green-50' :
                              option.id === 'evaluationTrends' ? 'bg-pink-50' :
                                'bg-purple-50'
                }`}
                onClick={() => handleReportClick(option.id)}
              >
                {/* Icon */}
                <div className="h-6 w-6 mb-1">
                  {option.id === 'averageScore' && <BarChart className="text-blue-600" />}
                  {option.id === 'scoreOverTime' && <TrendingUp className="text-green-600" />}
                  {option.id === 'topPerformers' && <Star className="text-yellow-600" />}
                  {option.id === 'improvementPotential' && <UserMinus className="text-red-600" />}
                  {option.id === 'categoryStrengthsWeaknesses' && <PieChart className="text-orange-600" />}
                  {option.id === 'changeOverTime' && <TrendingUp className="text-green-600" />}
                  {option.id === 'evaluationTrends' && <LineChart className="text-pink-600" />}
                  {option.id === 'wordCloud' && <Cloud className="text-purple-600" />}
                </div>
                <p className="text-xs font-medium text-gray-500 mb-2">{option.name}</p>
                <div className="w-full h-32">
                  {renderReportContent(option.id, true)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{reportOptions.find(r => r.id === selectedReport)?.name}</DialogTitle>
            <DialogDescription>
              {reportOptions.find(r => r.id === selectedReport)?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {dialogContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AverageScoreReport: React.FC<{ data: { averageScore?: number }, miniature?: boolean, className?: string }> = ({ data, miniature = false, className = '' }) => {
  const size = miniature ? '100%' : '300px';
  const averageScore = data.averageScore ?? 0;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div style={{ width: size, height: size }} className="relative">
        <Doughnut
          data={{
            datasets: [{
              data: [averageScore, 100 - averageScore],
              backgroundColor: ['#3b82f6', '#e5e7eb'],
              borderWidth: 0,
            }],
          }}
          options={{
            cutout: '80%',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className={`${miniature ? 'text-lg' : 'text-4xl'} font-bold text-blue-600`}>{averageScore.toFixed(1)}</p>
          <p className={`${miniature ? 'text-xs' : 'text-sm'} text-gray-500`}>von 100</p>
        </div>
      </div>
    </div>
  );
};

const ScoreOverTimeReport: React.FC<{ data: { labels: string[], scores: number[] }, miniature?: boolean, className?: string }> = ({ data, miniature = false, className = '' }) => {
  return (
    <div className={`${className} ${miniature ? 'h-full' : 'h-[400px]'}`}>
      <Line
        data={{
          labels: data.labels,
          datasets: [{
            label: 'Durchschnittliche Punktzahl',
            data: data.scores,
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
              display: !miniature,
              position: 'top' as const,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              display: !miniature,
            },
            x: {
              display: !miniature,
            },
          },
        }}
      />
    </div>
  );
};

const TopPerformersReport: React.FC<{ data: { name: string, score: number }[], miniature?: boolean, className?: string }> = ({ data, miniature = false, className = '' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>Keine Daten verfügbar</p>;
  }
  const sortedData = [...data].sort((a, b) => b.score - a.score).slice(0, 5);
  //const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className={`${className} ${miniature ? 'h-full' : 'h-[400px]'}`}>
      <Bar
        data={{
          labels: sortedData.map(d => d.name),
          datasets: [{
            label: 'Punktzahl',
            data: sortedData.map(d => d.score),
            backgroundColor: sortedData.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`),
          }],
        }}
        options={{
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: !miniature,
              text: 'Top 5 Performer',
              font: {
                size: 16,
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              title: {
                display: !miniature,
                text: 'Punktzahl',
              },
              display: !miniature,
            },
            y: {
              title: {
                display: !miniature,
                text: 'Mitarbeiter',
              },
              display: !miniature,
            },
          },
        }}
      />
    </div>
  );
};

const CategoryStrengthsWeaknessesReport: React.FC<{ data: { category: string, score: number }[], miniature?: boolean, className?: string }> = ({ data, miniature = false, className = '' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>Keine Daten verfügbar</p>;
  }
  return (
    <div className={`${className} ${miniature ? 'h-full' : 'h-[400px]'}`}>
      <Bar
        data={{
          labels: data.map(d => d.category),
          datasets: [{
            label: 'Punktzahl',
            data: data.map(d => d.score),
            backgroundColor: '#3b82f6',
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: !miniature,
              position: 'top' as const,
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 10,
              display: !miniature,
            },
            y: {
              display: !miniature,
            },
          },
        }}
      />
    </div>
  );
};

const EvaluationTrendsReport: React.FC<{ data: { labels: string[], datasets: { label: string, data: number[] }[] }, miniature?: boolean, className?: string }> = ({ data, miniature = false, className = '' }) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  if (!data.labels || !Array.isArray(data.datasets) || data.datasets.length === 0) {
    return <p>Keine Daten verfügbar</p>;
  }
  return (
    <div className={`${className} ${miniature ? 'h-full' : 'h-[400px]'}`}>
      <Line
        data={{
          labels: data.labels,
          datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            borderColor: colors[index % colors.length],
            backgroundColor: `${colors[index % colors.length]}33`,
            fill: true,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: !miniature,
              position: 'top' as const,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              display: !miniature,
            },
            x: {
              display: !miniature,
            },
          },
          elements: {
            line: {
              tension: 0.3
            }
          },
        }}
      />
    </div>
  );
};

const WordCloudReport: React.FC<{ data: { text: string, value: number }[], miniature?: boolean, className?: string }> = ({ data, miniature = false, className = '' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>Keine Daten verfügbar</p>;
  }
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, miniature ? 5 : 10);

  return (
    <div className={`${className} ${miniature ? 'h-full' : 'h-[400px]'}`}>
      <Bar
        data={{
          labels: sortedData.map(d => d.text),
          datasets: [{
            label: 'Häufigkeit',
            data: sortedData.map(d => d.value),
            backgroundColor: sortedData.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`),
          }],
        }}
        options={{
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: !miniature,
              text: 'Häufig verwendete Wörter in Bewertungen'
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              display: !miniature,
            },
            y: {
              display: !miniature,
            }
          }
        }}
      />
    </div>
  );
};

const getMockDataForReport = async (reportId: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  switch (reportId) {
    case 'averageScore':
      return { averageScore: 78.5 };
    case 'scoreOverTime':
    case 'changeOverTime':
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun'],
        scores: [75, 76, 78, 77, 79, 78.5],
      };
    case 'topPerformers':
    case 'improvementPotential':
      return [
        { name: 'Max Mustermann', score: 95 },
        { name: 'Anna Schmidt', score: 92 },
        { name: 'Tom Müller', score: 90 },
        { name: 'Lisa Weber', score: 89 },
        { name: 'Jan Becker', score: 88 },
      ];
    case 'categoryStrengthsWeaknesses':
      return [
        { category: 'Fachliche Kompetenz', score: 8.5 },
        { category: 'Zuverlässigkeit', score: 9.2 },
        { category: 'Qualität der Ausführung', score: 7.8 },
        { category: 'Dokumentation', score: 6.9 },
        { category: 'Zusammenarbeit im Team', score: 8.7 },
      ];
    case 'evaluationTrends':
      return {
        labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Fachliche Kompetenz',
            data: [7, 7.5, 8, 8.2, 8.5, 8.7],
          },
          {
            label: 'Kommunikation',
            data: [6, 6.5, 7, 7.5, 8, 8.2],
          },
          {
            label: 'Teamarbeit',
            data: [7.5, 8, 8.2, 8.5, 8.7, 9],
          },
        ],
      };
    case 'wordCloud':
      return [
        { text: 'Kompetent', value: 64 },
        { text: 'Zuverlässig', value: 55 },
        { text: 'Teamplayer', value: 41 },
        { text: 'Engagiert', value: 38 },
        { text: 'Kreativ', value: 32 },
      ];
    default:
      return null;
  }
};

export default Reports;

