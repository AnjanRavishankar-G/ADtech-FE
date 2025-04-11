"use client";
import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });
import { ApexOptions } from 'apexcharts';
import { useTheme } from '@/app/context/ThemeContext';

type BasicRadialBarProps = {
  series: number[];
  height: number;
  labels?: string[];
  combined?: boolean;
  hollowSize?: string;
};

const BasicRadialBar: React.FC<BasicRadialBarProps> = ({ series, height, labels, combined, hollowSize }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const chartOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      height: height,
      foreColor: isDarkMode ? '#FFFFFF' : '#333333', // Set default text color
      background: 'transparent',
    },
    plotOptions: {
      radialBar: {
        offsetY: combined ? 20 : 0, // Changed from -10 to 20 for combined view
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: hollowSize,
        },
        track: {
          background: isDarkMode ? '#404040' : '#e7e7e7',
          strokeWidth: "97%",
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px',
            color: isDarkMode ? '#FFFFFF' : '#333333',
            offsetY: combined ? 70 : 20, // Changed from 40 to 60 for combined view
          },
          value: {
            show: combined,
            fontSize: '24px',
            color: isDarkMode ? '#FFFFFF' : '#333333',
            offsetY: combined ? 20 : 20, // Changed from 0 to 20
            formatter: function(val: number) {
              return Math.round(val) + '%';
            }
          },
        },
      },
    },
    tooltip: {
      enabled: !combined,
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function(val: number) {
          return Math.round(val) + "%";
        },
      },
      style: {
        fontSize: '14px',
      },
      custom: function({ series, seriesIndex, w }) {
        const label = w.globals.labels[seriesIndex];
        const color = w.config.colors[seriesIndex];
        const value = Math.round(series[seriesIndex]);
        return '<div class="custom-tooltip" style="background: ' + color + '; padding: 6px 12px; border-radius: 4px; opacity: 0.9;">' +
          '<span style="color: #FFFFFF; font-weight: 500;">' + label + ': ' + value + '%</span>' +
          '</div>';
      }
    },
    colors: combined
      ? ["#2196F3"]
      : ["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0", "#2a40f1", "#2af1c7", "#79f728"],
    series: combined
      ? [Math.round(series.reduce((acc, val) => acc + val, 0) / series.length)]
      : series.map(val => Math.round(val)),
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

  return (
    <div className="text-inherit">
      <ApexCharts options={chartOptions} series={chartOptions.series} type="radialBar" height={height} />
      {!combined && (
        <div className="flex flex-wrap justify-center mt-4 gap-4">
          {labels?.map((label, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: chartOptions.colors?.[index] }}
              ></div>
              <span className="text-inherit">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasicRadialBar;
