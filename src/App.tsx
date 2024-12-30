import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EvaluationForm from './pages/EvaluationForm';
import Reports from './pages/Reports';
import { Card, CardContent } from './components/ui/card';
import { employeeStore } from './store/employeeStore'; // Updated import statement

const App: React.FC = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const fetchedEmployees = await employeeStore.getAllEmployees();
        setEmployees(fetchedEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        // Handle error (e.g., show an error message)
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleUpdateEmployee = (updatedEmployee: any) => {
    // Implement update logic here
  };

  const handleDeleteEmployee = (employeeId: any) => {
    // Implement delete logic here
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Card className="m-4 h-[calc(100vh-2rem)]">
            <CardContent className="p-6 h-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<EmployeeList employees={employees} onUpdate={handleUpdateEmployee} onDelete={handleDeleteEmployee} isLoading={isLoading} />} />
                <Route path="/evaluation" element={<EvaluationForm />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </CardContent>
          </Card>
        </div>
      </div>
    </Router>
  );
};

export default App;

