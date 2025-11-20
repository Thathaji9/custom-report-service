import { useState, useEffect, useCallback } from "react";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  joiningDate: string;
  salary: number;
}

let employeeDataState: Employee[] = [];
const listeners: Set<(data: Employee[]) => void> = new Set();

const notifyListeners = (data: Employee[]) => {
  listeners.forEach((listener) => listener(data));
};

export const useEmployeeData = () => {
  const [employeeData, setEmployeeData] =
    useState<Employee[]>(employeeDataState);

  useEffect(() => {
    const listener = (data: Employee[]) => {
      setEmployeeData(data);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateEmployeeData = useCallback((data: Employee[]) => {
    employeeDataState = data;
    setEmployeeData(data);
    notifyListeners(data);
  }, []);

  const loadEmployeeData = useCallback(async () => {
    try {
      const response = await fetch("/employees.json");
      const data = await response.json();
      console.log("Fetched employee data:", data);
      updateEmployeeData(data);
      console.log("Employee data loaded:", data.length, "employees");
    } catch (error) {
      console.error("Failed to load employee data:", error);
    }
  }, [updateEmployeeData]);

  return {
    employeeData,
    updateEmployeeData,
    loadEmployeeData,
  };
};
