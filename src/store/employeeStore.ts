import { ipcRenderer } from 'electron';

interface Employee {
  id: number;
  name: string;
  beruf: string;
  sparte: string;
  hireDate: Date;
  evaluationCount: number;
  evaluations?: Evaluation[];
  requestedEvaluations: number;
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

interface Activity {
  id: number;
  type: string;
  employeeName: string;
  timestamp: Date;
}

class EmployeeStore {
  async getAllEmployees(): Promise<Employee[]> {
    try {
      console.log('Fetching all employees...');
      const employees = await ipcRenderer.invoke('get-all-employees');
      console.log('Fetched employees:', employees);
      const employeesWithEvaluations = await Promise.all(employees.map(async (emp: any) => {
        const evaluations = await this.getEvaluationsForEmployee(emp.id);
        return {
          ...emp,
          hireDate: new Date(emp.hireDate),
          evaluationCount: emp.evaluationCount || 0,
          requestedEvaluations: emp.requestedEvaluations || 0,
          evaluations: evaluations
        };
      }));
      return employeesWithEvaluations;
    } catch (error) {
      console.error('Error getting all employees:', error);
      return [];
    }
  }

  async addEmployee(employee: Omit<Employee, "id" | "evaluationCount" | "requestedEvaluations">): Promise<Employee> {
    try {
      console.log('Adding employee:', employee);
      const newEmployee = await ipcRenderer.invoke('add-employee', {
        ...employee,
        hireDate: employee.hireDate.toISOString(),
      });
      console.log('Added employee:', newEmployee);
      return { ...newEmployee, hireDate: new Date(newEmployee.hireDate), evaluationCount: 0, requestedEvaluations: 0 };
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  async updateEmployee(employee: Employee): Promise<Employee> {
    try {
      console.log('Updating employee:', employee);
      const updatedEmployee = await ipcRenderer.invoke('update-employee', {
        ...employee,
        hireDate: employee.hireDate.toISOString(),
      });
      console.log('Updated employee:', updatedEmployee);
      return { ...updatedEmployee, hireDate: new Date(updatedEmployee.hireDate) };
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  async deleteEmployee(id: number): Promise<boolean> {
    try {
      console.log('Deleting employee:', id);
      const result = await ipcRenderer.invoke('delete-employee', id);
      console.log('Employee deleted:', result);
      return result;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  async getTotalEmployees(): Promise<number> {
    try {
      console.log('Getting total employees');
      const total = await ipcRenderer.invoke('db-get-total-employees');
      console.log('Total employees:', total);
      return total;
    } catch (error) {
      console.error('Error getting total employees:', error);
      throw error;
    }
  }

  async getLatestActivities(): Promise<Activity[]> {
    try {
      console.log('Fetching latest activities');
      const activities = await ipcRenderer.invoke('db-get-latest-activities');
      console.log('Fetched activities:', activities);
      return activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }));
    } catch (error) {
      console.error('Error getting latest activities:', error);
      // Return an empty array instead of throwing an error
      return [];
    }
  }

  async saveEvaluation(evaluation: Omit<Evaluation, 'id'>): Promise<void> {
    try {
      console.log('Saving evaluation:', evaluation);
      const result = await ipcRenderer.invoke('save-evaluation', {
        data: JSON.stringify(evaluation),
        suggestedFileName: `Bewertung_${evaluation.employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save evaluation');
      }

      // Update the evaluation count after successful save
      await this.incrementEvaluationCount(evaluation.employeeId);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      throw error;
    }
  }

  async incrementEvaluationCount(employeeId: number): Promise<void> {
    try {
      console.log('Incrementing evaluation count for employee:', employeeId);
      const result = await ipcRenderer.invoke('db-increment-evaluation-count', employeeId);
      if (result) {
        console.log('Evaluation count incremented successfully');
      } else {
        throw new Error('Failed to increment evaluation count');
      }
    } catch (error) {
      console.error('Error incrementing evaluation count:', error);
      throw error;
    }
  }

  async addActivity(activity: Omit<Activity, 'id'>): Promise<void> {
    try {
      console.log('Adding activity:', activity);
      const result = await ipcRenderer.invoke('add-activity', activity);
      if (result.success) {
        console.log('Activity added successfully');
      } else {
        throw new Error('Failed to add activity');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }

  async getEvaluationsForEmployee(employeeId: number): Promise<Evaluation[]> {
    try {
      console.log(`Fetching evaluations for employee ${employeeId}...`);
      const evaluations = await ipcRenderer.invoke('get-evaluations-for-employee', employeeId);
      
      if (!Array.isArray(evaluations)) {
        console.warn(`Evaluations data for employee ${employeeId} is not an array:`, evaluations);
        return [];
      }

      const processedEvaluations = evaluations.map(evaluation => ({
        ...evaluation,
        scores: typeof evaluation.scores === 'string' 
          ? JSON.parse(evaluation.scores) 
          : evaluation.scores || {}
      }));

      console.log(`Processed evaluations for employee ${employeeId}:`, processedEvaluations);
      return processedEvaluations;
    } catch (error) {
      console.error(`Error getting evaluations for employee ${employeeId}:`, error);
      return [];
    }
  }

  async getLastEvaluation(employeeId: number): Promise<Evaluation | null> {
    try {
      console.log('Fetching last evaluation for employee:', employeeId);
      const evaluations = await this.getEvaluationsForEmployee(employeeId);
      if (evaluations.length > 0) {
        return evaluations[0]; // Assuming evaluations are sorted by date in descending order
      }
      return null;
    } catch (error) {
      console.error('Error getting last evaluation for employee:', error);
      throw error;
    }
  }

  async syncEvaluationCount(employeeId: number): Promise<number> {
    try {
      console.log('Syncing evaluation count for employee:', employeeId);
      const result = await ipcRenderer.invoke('sync-evaluation-count', employeeId);
      if (result.success) {
        console.log('Evaluation count synced successfully, new count:', result.newCount);
        return result.newCount;
      } else {
        throw new Error('Failed to sync evaluation count');
      }
    } catch (error) {
      console.error('Error syncing evaluation count:', error);
      throw error;
    }
  }

  async exportEvaluationsToPDF(employeeId: number, employeeName: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      console.log('Exporting evaluations to PDF for employee:', employeeId);
      const result = await ipcRenderer.invoke('export-evaluations-pdf', employeeId, employeeName);
      if (result.success) {
        console.log('Evaluations exported successfully to:', result.filePath);
      } else {
        console.error('Failed to export evaluations:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Error exporting evaluations to PDF:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async getRequestedEvaluations(): Promise<Record<number, number>> {
    try {
      console.log('Fetching requested evaluations...');
      const requestedEvaluations = await ipcRenderer.invoke('get-requested-evaluations');
      console.log('Requested evaluations:', requestedEvaluations);
      return requestedEvaluations;
    } catch (error) {
      console.error('Error getting requested evaluations:', error);
      throw error;
    }
  }

  async saveRequestedEvaluation(employeeId: number, count: number): Promise<void> {
    try {
      console.log('Saving requested evaluation count:', employeeId, count);
      const result = await ipcRenderer.invoke('save-requested-evaluation', employeeId, count);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save requested evaluation count');
      }
      console.log('Requested evaluation count saved successfully');
    } catch (error) {
      console.error('Error saving requested evaluation count:', error);
      throw error;
    }
  }

  async resetRequestedEvaluations(employeeId: number): Promise<Employee | null> {
    try {
      console.log('Resetting requested evaluations for employee:', employeeId);
      const result = await ipcRenderer.invoke('reset-requested-evaluations', employeeId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset requested evaluations');
      }

      // Fetch the updated employee data to ensure we have the latest state
      const updatedEmployee = await this.getEmployeeById(employeeId);
      if (!updatedEmployee) {
        throw new Error('Failed to fetch updated employee data');
      }

      return updatedEmployee;
    } catch (error) {
      console.error('Error resetting requested evaluations:', error);
      throw error;
    }
  }

  async getEmployeeById(employeeId: number): Promise<Employee | null> {
    try {
      const result = await ipcRenderer.invoke('db-get-employee', employeeId);
      if (result) {
        return {
          ...result,
          hireDate: new Date(result.hireDate),
          evaluationCount: result.evaluationCount || 0,
          requestedEvaluations: result.requestedEvaluations || 0
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting employee by ID:', error);
      throw error;
    }
  }

  async incrementRequestedEvaluations(employeeId: number): Promise<Employee> {
    try {
      console.log('Incrementing requested evaluations for employee:', employeeId);
      const result = await ipcRenderer.invoke('increment-requested-evaluations', employeeId);
      if (result.success) {
        console.log('Requested evaluations incremented successfully');
        console.log('Updated employee data:', result.employee);
        return result.employee;
      } else {
        throw new Error('Failed to increment requested evaluations');
      }
    } catch (error) {
      console.error('Error incrementing requested evaluations:', error);
      throw error;
    }
  }

  async decrementRequestedEvaluations(employeeId: number): Promise<Employee> {
    try {
      console.log('Decrementing requested evaluations for employee:', employeeId);
      const result = await ipcRenderer.invoke('decrement-requested-evaluations', employeeId);
      if (result.success) {
        console.log('Requested evaluations decremented successfully');
        return result.employee;
      } else {
        throw new Error('Failed to decrement requested evaluations');
      }
    } catch (error) {
      console.error('Error decrementing requested evaluations:', error);
      throw error;
    }
  }

  async getAllRequestedEvaluations(): Promise<Record<number, number>> {
    try {
      console.log('Fetching all requested evaluations...');
      const requestedEvaluations = await ipcRenderer.invoke('get-all-requested-evaluations');
      console.log('All requested evaluations:', requestedEvaluations);
      return requestedEvaluations;
    } catch (error) {
      console.error('Error getting all requested evaluations:', error);
      throw error; // Re-throw the error to be handled in the component
    }
  }

  async updateCountersAfterImport(employeeId: number): Promise<Employee> {
    try {
      console.log('Updating counters after import for employee:', employeeId);
      const result = await ipcRenderer.invoke('update-counters-after-import', employeeId);
      if (result.success) {
        console.log('Counters updated successfully after import:', result.employee);
        return result.employee;
      } else {
        throw new Error('Failed to update counters after import');
      }
    } catch (error) {
      console.error('Error updating counters after import:', error);
      throw error;
    }
  }
}

export const employeeStore = new EmployeeStore();

