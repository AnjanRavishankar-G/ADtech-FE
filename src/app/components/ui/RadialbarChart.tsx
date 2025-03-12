"use client";
import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

// Import types from 'react-apexcharts' for type safety
import { ApexOptions } from 'apexcharts';
import { useState } from "react";

type BasicRadialBarProps = {
  series: number[]; // Array of progress values for each brand
  height: number;
  labels?: string[]; // Brand names or identifiers (optional for combined chart)
  combined?: boolean; // Flag to determine whether to show the combined chart or individual charts
  hollowSize?: string; // Allow custom hollow size
};

const BasicRadialBar: React.FC<BasicRadialBarProps> = ({ series, height, labels, combined, hollowSize }) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      height: height,
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: hollowSize ,
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
    colors: combined
      ? ["#2196F3"]
      : ["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0", "#2a40f1", "#2af1c7", "#79f728"],
    series: combined
      ? [Math.round(series.reduce((acc, val) => acc + val, 0) / series.length)]
      : series,
    labels: combined ? ["Overall Progress"] : labels,
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

  const colors = chartOptions.colors || [];

  return (
    <div>
      <ApexCharts options={chartOptions} series={chartOptions.series} type="radialBar" height={height} />
      
      {!combined &&
        labels?.map((label, index) => (
          <div
            key={index}
            style={{
              display: "inline-flex",
              alignItems: "center",
              margin: "0 10px",
             
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: colors[index],
                marginRight: "5px",
              }}
            ></span>
             <span className="text-black dark:text-white" style={{ fontSize: "16px" }}>{label}</span>
          </div>
        ))}
    </div>
  );
};

export default BasicRadialBar;
