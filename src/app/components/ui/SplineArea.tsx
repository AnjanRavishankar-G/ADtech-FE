"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

type ChartData = {
  Date: string;
  DailySales: number;
  Spend: number;
};

type SplineAreaProps = {
  data: ChartData[];
  height?: number;
  theme?: "light" | "dark"; // Added a theme prop
};

const SplineArea: React.FC<SplineAreaProps> = ({
  data,
  height = 300,
  theme = "light", // Default to light mode
}) => {
  const categories = data.map((item) => item.Date);
  const series = [
    { name: "Daily Sales", data: data.map((item) => item.DailySales) },
    { name: "Daily Spend", data: data.map((item) => item.Spend) },
  ];

  const isDarkMode = theme === "dark";

  const chartOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 4 },
    colors: ["#4CAF50", "#2196F3"],
    tooltip: { theme: isDarkMode ? "dark" : "light" },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: isDarkMode ? "#FFFFFF" : "#000000", // White in dark mode, black in light mode
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDarkMode ? "#FFFFFF" : "#000000", // White in dark mode, black in light mode
        },
      },
    },
    grid: {
      borderColor: isDarkMode ? "#FFFFFF" : "#000000", // Optional: grid lines color
    },
    legend: {
      labels: {
        colors: isDarkMode ? "#FFFFFF" : "#000000", // Legend text color
      },
    },
  };

  return (
    <ApexCharts
      options={chartOptions}
      series={series}
      type="area"
      height={height}
      width="100%"
    />
  );
};

export default SplineArea;
