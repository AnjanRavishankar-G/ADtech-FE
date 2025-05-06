"use client";
import { useTheme } from '@/app/context/ThemeContext';
import dynamic from "next/dynamic";
import { ApexOptions } from 'apexcharts';

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

type HorizontalBarChartProps = {
  series: number[];
  labels: string[];
  colors?: string[];
  height?: number;
  title?: string;
};

type ApexTooltipContext = {
  dataPointIndex: number;
  w: {
    globals: {
      series: number[][];
      labels: string[];
      colors: string[];
    };
  };
};

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  series,
  labels,
  colors = ["#0EA5E9", "#6366F1", "#10B981", "#F59E0B", "#EF4444"],
  height = 400,
  title
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options: ApexOptions = {
    chart: {
      type: 'bar' as const, // explicitly type as const
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        borderRadius: 5,
      }
    },
    colors: colors,
    dataLabels: {
      enabled: false // Disabled the bar values
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      itemMargin: {
        horizontal: 25,
        vertical: 5
      },
      labels: {
        colors: isDark ? '#fff' : '#000'
      }
    },
    grid: {
      show: false
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: isDark ? '#fff' : '#000'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#fff' : '#000'
        }
      }
    },
    tooltip: {
      custom: function({ dataPointIndex, w }: ApexTooltipContext) {
        const value = w.globals.series[0][dataPointIndex];
        const label = w.globals.labels[dataPointIndex];
        const color = w.globals.colors[dataPointIndex];
        
        return (
          '<div class="custom-tooltip" style="' +
          'padding: 8px;' +
          'background: ' + color + ';' +
          'color: white;' +
          'border-radius: 4px;' +
          'font-size: 14px;' +
          'font-weight: 500;' +
          '">' +
          label + ': ' + value.toLocaleString() +
          '</div>'
        );
      }
    }
  };

  return (
    <div className="h-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center dark:text-white">
          {title}
        </h3>
      )}
      <ApexCharts
        options={options}
        series={[{ data: series }]}
        type="bar"
        height={height}
      />
    </div>
  );
};

export default HorizontalBarChart;