import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EvaluationForm from './pages/EvaluationForm';
import Reports from './pages/Reports';
import { Card, CardContent } from './components/ui/card';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Card className="m-4 h-[calc(100vh-2rem)]">
            <CardContent className="p-6 h-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<EmployeeList />} />
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

