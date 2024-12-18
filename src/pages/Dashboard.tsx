import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Users, UserCheck, TrendingUp } from 'lucide-react';
import { employeeStore } from '../store/employeeStore';

interface Activity {
  id: number;
  type: string;
  employeeName: string;
  timestamp: Date;
}

interface Employee {
  id: number;
  name: string;
  hireDate: Date;
}

const Dashboard: React.FC = () => {
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [latestActivities, setLatestActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [staffDilution, setStaffDilution] = useState<string>('Laden...');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [total, activities, employees] = await Promise.all([
          employeeStore.getTotalEmployees(),
          employeeStore.getLatestActivities(),
          employeeStore.getAllEmployees()
        ]);
        setTotalEmployees(total);
        setLatestActivities(activities.slice(0, 2));
    
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      
        const shortTermEmployees = employees.filter(emp => new Date(emp.hireDate) > fiveYearsAgo).length;
        const longTermEmployees = employees.length - shortTermEmployees;
      
        const dilutionPercentage = ((shortTermEmployees - longTermEmployees) / employees.length) * 100;
        const finalDilution = Math.max(0, Math.ceil(dilutionPercentage));
        setStaffDilution(`${finalDilution}%`);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Fehler beim Laden der Dashboard-Daten');
      }
    };

    fetchData();
  }, []);

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
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-500">Gesamtmitarbeiter</p>
              <p className="text-2xl font-bold">{totalEmployees !== null ? totalEmployees : 'Laden...'}</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <UserCheck className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-500">Stammpersonal verwässert</p>
              <p className="text-2xl font-bold">{staffDilution}</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-sm font-medium text-gray-500">Durchschnittliche Bewertung</p>
              <p className="text-2xl font-bold">8.7</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
              <BarChart className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-500">Abgeschlossene Bewertungen</p>
              <p className="text-2xl font-bold">89%</p>
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

