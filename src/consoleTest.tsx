import React from 'react';
import { create } from 'react-test-renderer';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EvaluationForm from './pages/EvaluationForm';
import Reports from './pages/Reports';

console.log('Starting console test...');

// Test Dashboard
console.log('\n--- Dashboard ---');
const dashboardComponent = create(<Dashboard />);
console.log(dashboardComponent.toJSON());

// Test EmployeeList
console.log('\n--- Employee List ---');
const employeeListComponent = create(<EmployeeList />);
console.log(employeeListComponent.toJSON());

// Test EvaluationForm
console.log('\n--- Evaluation Form ---');
const evaluationFormComponent = create(<EvaluationForm />);
console.log(evaluationFormComponent.toJSON());

// Test Reports
console.log('\n--- Reports ---');
const reportsComponent = create(<Reports />);
console.log(reportsComponent.toJSON());

console.log('\nConsole test completed.');

