import React, { useEffect, useState, useMemo } from "react";
import { Bar, Pie, Line, Doughnut, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEmployeeData } from "../hooks/useEmployeeData";
import { ChartType } from "../hooks/useDashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface ChartWidgetProps {
  type: ChartType;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ type }) => {
  const { employeeData } = useEmployeeData();
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    console.log("Employee data changed:", employeeData);
    if (employeeData.length > 0) {
      console.log("Updating chart for type:", type);
      updateChart();
    }
  }, [employeeData, type]);

  const updateChart = () => {
    switch (type) {
      case "employees-by-department":
        console.log("Generating Employees by Department chart");
        generateEmployeesByDepartment();
        break;
      case "employees-by-location":
        generateEmployeesByLocation();
        break;
      case "avg-salary-by-department":
        generateAvgSalaryByDepartment();
        break;
      case "salary-distribution":
        generateSalaryDistribution();
        break;
      case "department-salary-comparison":
        generateDepartmentSalaryComparison();
        break;
    }
  };

  console.log(type, chartData);

  const generateEmployeesByDepartment = () => {
    const departmentCount: { [key: string]: number } = {};
    console.log(employeeData);

    employeeData.forEach((emp) => {
      departmentCount[emp.department] =
        (departmentCount[emp.department] || 0) + 1;
    });

    setChartData({
      labels: Object.keys(departmentCount),
      datasets: [
        {
          label: "Number of Employees",
          data: Object.values(departmentCount),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  const generateEmployeesByLocation = () => {
    const locationCount: { [key: string]: number } = {};

    employeeData.forEach((emp) => {
      locationCount[emp.location] = (locationCount[emp.location] || 0) + 1;
    });

    setChartData({
      labels: Object.keys(locationCount),
      datasets: [
        {
          label: "Employees by Location",
          data: Object.values(locationCount),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  const generateAvgSalaryByDepartment = () => {
    const departmentData: { [key: string]: { total: number; count: number } } =
      {};

    employeeData.forEach((emp) => {
      if (!departmentData[emp.department]) {
        departmentData[emp.department] = { total: 0, count: 0 };
      }
      departmentData[emp.department].total += emp.salary;
      departmentData[emp.department].count++;
    });

    const departments = Object.keys(departmentData);
    const avgSalaries = departments.map((dept) =>
      Math.round(departmentData[dept].total / departmentData[dept].count)
    );

    setChartData({
      labels: departments,
      datasets: [
        {
          label: "Average Salary (₹)",
          data: avgSalaries,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    });
  };

  const generateSalaryDistribution = () => {
    const salaryRanges = {
      "50k-70k": 0,
      "70k-80k": 0,
      "80k-90k": 0,
      "90k+": 0,
    };

    employeeData.forEach((emp) => {
      if (emp.salary < 70000) {
        salaryRanges["50k-70k"]++;
      } else if (emp.salary < 80000) {
        salaryRanges["70k-80k"]++;
      } else if (emp.salary < 90000) {
        salaryRanges["80k-90k"]++;
      } else {
        salaryRanges["90k+"]++;
      }
    });

    setChartData({
      labels: Object.keys(salaryRanges),
      datasets: [
        {
          label: "Number of Employees",
          data: Object.values(salaryRanges),
          backgroundColor: [
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  const generateDepartmentSalaryComparison = () => {
    const departmentData: { [key: string]: number[] } = {};

    employeeData.forEach((emp) => {
      if (!departmentData[emp.department]) {
        departmentData[emp.department] = [];
      }
      departmentData[emp.department].push(emp.salary);
    });

    const departments = Object.keys(departmentData);
    const minSalaries = departments.map((dept) =>
      Math.min(...departmentData[dept])
    );
    const maxSalaries = departments.map((dept) =>
      Math.max(...departmentData[dept])
    );
    const avgSalaries = departments.map((dept) =>
      Math.round(
        departmentData[dept].reduce((a, b) => a + b, 0) /
          departmentData[dept].length
      )
    );

    setChartData({
      labels: departments,
      datasets: [
        {
          label: "Min Salary",
          data: minSalaries,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Avg Salary",
          data: avgSalaries,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Max Salary",
          data: maxSalaries,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    });
  };

  const getChartTitle = (type: ChartType): string => {
    switch (type) {
      case "employees-by-department":
        return "Employees by Department";
      case "employees-by-location":
        return "Employees by Location";
      case "avg-salary-by-department":
        return "Average Salary by Department";
      case "salary-distribution":
        return "Salary Distribution";
      case "department-salary-comparison":
        return "Department Salary Comparison";
      default:
        return "Chart";
    }
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: getChartTitle(type),
        },
      },
    }),
    [type]
  );

  const renderChart = () => {
    if (!chartData) return null;

    switch (type) {
      case "employees-by-department":
        return <Bar data={chartData} options={chartOptions} />;
      case "employees-by-location":
        return <Pie data={chartData} options={chartOptions} />;
      case "avg-salary-by-department":
        return <Bar data={chartData} options={chartOptions} />;
      case "salary-distribution":
        return <Doughnut data={chartData} options={chartOptions} />;
      case "department-salary-comparison":
        return <Bar data={chartData} options={chartOptions} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", padding: "10px" }}>
      {renderChart()}
    </div>
  );
};

export default ChartWidget;
