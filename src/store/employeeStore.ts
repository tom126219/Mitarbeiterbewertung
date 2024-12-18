import { ipcRenderer } from 'electron';

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

interface Activity {
  id: number;
  type: string;
  employeeName: string;
  timestamp: Date;
}

class EmployeeStore {
  async getAllEmployees(): Promise<Employee[]> {
    try {
      console.log('Fetching all employees');
      const employees = await ipcRenderer.invoke('db-get-all-employees');
      console.log('Fetched employees:', employees);
      return employees.map((emp: any) => ({
        ...emp,
        hireDate: new Date(emp.hireDate),
        evaluationCount: emp.evaluationCount || 0
      }));
    } catch (error) {
      console.error('Error getting all employees:', error);
      throw error;
    }
  }

  async addEmployee(employee: Omit<Employee, "id" | "evaluationCount">): Promise<Employee> {
    try {
      console.log('Adding employee:', employee);
      const newEmployee = await ipcRenderer.invoke('db-add-employee', {
        ...employee,
        hireDate: employee.hireDate.toISOString()
      });
      console.log('Added employee:', newEmployee);
      if (!newEmployee || !newEmployee.id) {
        throw new Error('Failed to add employee: No id returned');
      }
      return { ...newEmployee, hireDate: new Date(newEmployee.hireDate), evaluationCount: 0 };
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  async updateEmployee(employee: Employee): Promise<Employee> {
    try {
      console.log('Updating employee:', employee);
      const hireDateAsDate = new Date(employee.hireDate);
      if (isNaN(hireDateAsDate.getTime())) {
        throw new Error('Ungültiges Datum für hireDate');
      }
      const updatedEmployee = await ipcRenderer.invoke('db-update-employee', {
        ...employee,
        hireDate: hireDateAsDate.toISOString()
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
      const result = await ipcRenderer.invoke('db-delete-employee', id);
      console.log('Employee deleted:', result);
      return result > 0;
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
      throw error;
    }
  }

  async saveEvaluation(evaluation: Omit<Evaluation, 'id'>): Promise<void> {
    try {
      console.log('Saving evaluation:', evaluation);
      const result = await ipcRenderer.invoke('save-evaluation', evaluation);
      if (result.success) {
        console.log('Evaluation saved successfully, new count:', result.newCount);
        // Update the local employee object if it exists in memory
        // This step depends on how you're managing state in your application
      } else {
        throw new Error('Failed to save evaluation');
      }
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

  async getEvaluationsForEmployee(employeeId: number): Promise<any[]> {
    try {
      console.log('Fetching evaluations for employee:', employeeId);
      const evaluations = await ipcRenderer.invoke('get-evaluations-for-employee', employeeId);
      console.log('Fetched evaluations:', evaluations);
      return evaluations;
    } catch (error) {
      console.error('Error getting evaluations for employee:', error);
      throw error;
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
}

export const employeeStore = new EmployeeStore();

