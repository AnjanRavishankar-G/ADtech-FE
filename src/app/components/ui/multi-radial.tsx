// BasicRadialBar.tsx (or wherever you have your radial chart)
import React from "react";
import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

type BasicRadialBarProps = {
  series: number[]; // Array of progress values for each brand
  height: number;
  labels: string[]; // Brand names or identifiers
};

const BasicRadialBar: React.FC<BasicRadialBarProps> = ({ series, height, labels }) => {
  const chartOptions = {
    chart: {
      type: 'radialBar',
      height: height,
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "70%",
        },
        track: {
          background: "#e7e7e7",
          strokeWidth: "97%",
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "16px",
            color: "#888",
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: "18px",
            color: "#333",
          },
        },
      },
    },
    colors: ['#F44336', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'], // You can set more colors
    series: series, // This will be the array of percentages for each brand
    labels: labels, // The labels (brands)
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
  };

  return <ApexCharts option={chartOptions} series={series} type="radialBar" height={height} />;
};

export default BasicRadialBar;
