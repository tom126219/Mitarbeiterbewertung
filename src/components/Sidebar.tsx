import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, Users, Home } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, text: 'Dashboard', path: '/' },
    { icon: Users, text: 'Mitarbeiter', path: '/employees' },
    { icon: BarChart, text: 'Auswertung', path: '/reports' },
  ];

  return (
    <Card className="w-80 bg-white h-full shadow-xl rounded-none rounded-r-xl">
      <CardContent className="p-0 h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-teal-500 leading-tight">
            Mitarbeiterbewertung<br />
            Krones Service Europe GmbH
          </h1>
        </div>
        <nav className="mt-8 space-y-2 px-4">
          {navItems.map(({ icon: Icon, text, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 shadow-sm
                ${location.pathname === path
                  ? 'bg-blue-50 shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:shadow-md'
                }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${location.pathname === path ? 'text-blue-700' : 'text-gray-500'}`} />
              <span 
                className={`text-sm font-medium ${
                  location.pathname === path 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500' 
                    : 'text-blue-900'
                }`}
              >
                {text}
              </span>
            </Link>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
};

export default Sidebar;

