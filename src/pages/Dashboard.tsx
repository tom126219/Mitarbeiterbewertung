'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Users, UserCheck, TrendingUp } from 'lucide-react';
import { employeeStore } from '../store/employeeStore';
import { calculationService } from '../services/calculationService';
import { ipcRenderer } from 'electron';

interface Activity {
  id: number;
  type: string;
  employeeName: string;
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [latestActivities, setLatestActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [staffDilution, setStaffDilution] = useState<string>('Laden...');
  const [averageScore, setAverageScore] = useState<string>('Laden...');
  const [completionRate, setCompletionRate] = useState<string>('Laden...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...');
        const [total, activities, employees] = await Promise.all([
          employeeStore.getTotalEmployees(),
          employeeStore.getLatestActivities(),
          employeeStore.getAllEmployees(),
        ]);
        setTotalEmployees(total);
        setLatestActivities(activities);
        
        if (Array.isArray(employees) && employees.length > 0) {
          const dilution = await calculationService.calculateStaffDilution(employees);
          setStaffDilution(`${dilution.toFixed(1)}%`);
          
          const avgScore = await calculationService.getAverageScore();
          setAverageScore(avgScore.toFixed(1));

          const complRate = await calculationService.getCompletionRate();
          setCompletionRate(`${complRate.toFixed(0)}%`);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Fehler beim Laden der Dashboard-Daten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Listen for evaluation updates and refresh activities
    const updateActivitiesListener = () => {
      fetchData(); // Refetch data when an evaluation is updated
    };

    ipcRenderer.on('evaluation-updated', updateActivitiesListener);

    return () => {
      ipcRenderer.removeListener('evaluation-updated', updateActivitiesListener);
    };
  }, []);

  if (isLoading) {
    return <div className="text-center">Lade Daten...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-between p-4 bg-blue-50 rounded-lg h-full">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-500">Erfasste Mitarbeiter</p>
              <p className="text-2xl font-bold mt-auto">{totalEmployees !== null ? totalEmployees : 'Laden...'}</p>
            </div>
            <div className="flex flex-col items-center justify-between p-4 bg-green-50 rounded-lg h-full">
              <UserCheck className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-500">Stammpersonal verwässert</p>
              <p className="text-2xl font-bold mt-auto">{staffDilution}</p>
            </div>
            <div className="flex flex-col items-center justify-between p-4 bg-yellow-50 rounded-lg h-full">
              <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-sm font-medium text-gray-500">Durchschnittliche Bewertung</p>
              <p className="text-2xl font-bold mt-auto">{averageScore}</p>
            </div>
            <div className="flex flex-col items-center justify-between p-4 bg-purple-50 rounded-lg h-full">
              <BarChart className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-500">Abgeschlossene Bewertungen</p>
              <p className="text-2xl font-bold mt-auto">{completionRate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Neueste Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {latestActivities.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                <div>
                  <p className="font-medium">{activity.employeeName}</p>
                  <p className="text-sm text-gray-500">{activity.type}</p>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(activity.timestamp).toLocaleString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

