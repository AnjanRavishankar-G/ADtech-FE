"use client";
import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

// Import types from 'react-apexcharts' for type safety
import { ApexOptions } from "apexcharts";
import { useState } from "react";

type BasicPieChartProps = {
  series: number[]; // Array of data values for each slice
  height: number; // Height of the chart
  labels?: string[]; // Labels for each slice (optional)
  width?: number; // Width of the chart (optional)
  responsiveBreakpoint?: number; // Breakpoint for responsive design (optional)
  colors?: string[]; // Custom colors for each slice (optional)
};

const BasicPieChart: React.FC<BasicPieChartProps> = ({
  series,
  height,
  labels = [], // Default labels
  width = 380, // Default width
  responsiveBreakpoint = 480, // Default breakpoint
  colors = [], // Default empty array for colors
}) => {
  const chartOptions: ApexOptions = {
    dataLabels: {
      enabled: false, // This will remove the percentage labels
      style: {
        colors: ['#FFFFFF'], // Set data label colors to white
      },
    },
    series: series,
    chart: {
      width: width,
      type: "pie",
    },
    labels: labels,
    colors: colors.length > 0 ? colors : undefined , // Use custom colors if provided
    legend: {
      labels: {
        colors: 'var(--label-color)', // Use CSS variable for dynamic color
      },
    },
  
    
    responsive: [
      {
        breakpoint: responsiveBreakpoint,
        options: {
          chart: {
            width: 200, // Adjust width for smaller screens
          },
          legend: {
            position: "bottom", // Move legend to the bottom for smaller screens
            labels: {
              colors: '#FFFFFF', // Set legend label color to white in dark mode
            },
          }, 
        },
      },
    ],
  };

  return (
    <div className="text-black dark:text-white">
      <ApexCharts 
        options={chartOptions}
        series={chartOptions.series}
        type="pie"
        height={height}
      />
    </div>
  );
};

export default BasicPieChart;