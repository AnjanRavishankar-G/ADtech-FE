"use client";
import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });
import { ApexOptions } from "apexcharts";
import { useTheme } from '@/app/context/ThemeContext';

type BasicPieChartProps = {
  series: number[];
  height: number;
  labels?: string[];
  width?: number;
  responsiveBreakpoint?: number;
  colors?: string[];
};

const BasicPieChart: React.FC<BasicPieChartProps> = ({
  series,
  height,
  labels = [],
  width = 350,
  responsiveBreakpoint = 480,
  colors = [],
}) => {
  const { theme } = useTheme();

  const chartOptions: ApexOptions = {
    dataLabels: {
      enabled: false,
      style: {
        colors: [theme === 'dark' ? '#FFFFFF' : '#000000'],
      },
    },
    series: series,
    chart: {
      width: width,
      height: height * 0.55, // Reduced from 0.65 to make pie smaller
      type: "pie",
      background: 'transparent',
      offsetY: -10, // Move chart up
      foreColor: theme === 'dark' ? '#FFFFFF' : '#373D3F', // Add theme-based text color
    },
    labels: labels,
    colors: colors.length > 0 ? colors : undefined,
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
        },
        customScale: 0.65, // Reduced from 0.75 to make pie smaller
        offsetY: -10, // Move pie chart up
      }
    },
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light', // Add theme-based tooltip
      custom: function({ series, seriesIndex, w }) {
        const label = w.globals.labels[seriesIndex];
        const color = w.config.colors[seriesIndex];
        const value = series[seriesIndex];
        return `
          <div class="custom-tooltip" style="
            background: ${color};
            padding: 8px 12px;
            border-radius: 4px;
            opacity: 0.9;
          ">
            <span style="
              color: #FFFFFF;
              font-weight: 500;
              font-size: 14px;
            ">${label}: ${value.toLocaleString('en-IN')}</span>
          </div>
        `;
      },
      y: {
        formatter: function(value: number) {
          return value.toLocaleString('en-IN');
        }
      }
    },
    states: {
      hover: {
        filter: {
          type: 'none',
        }
      }
    },
    responsive: [
      {
        breakpoint: responsiveBreakpoint,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  return (
    <div className="flex flex-col h-full">
      {/* Adjusted chart container */}
      <div className="flex-1 flex items-center justify-center mt-[-35px]"> {/* Changed from -20px */}
        <ApexCharts 
          options={chartOptions}
          series={chartOptions.series}
          type="pie"
          height={height * 0.55} // Match chart height
        />
      </div>
      {/* Adjusted legend container */}
      <div className={`px-4 py-2 flex flex-wrap justify-center gap-2 mt-[-30px] ${
        theme === 'dark' ? 'text-white' : 'text-black'
      }`}> {/* Changed from -30px and gap-3 */}
        {labels?.map((label, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-full" // Increased from w-2.5 h-2.5
              style={{ backgroundColor: chartOptions.colors?.[index] }}
            ></div>
            <span className="text-inherit text-base font-medium tracking-normal"> {/* Changed from text-sm and added tracking-normal */}
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicPieChart;