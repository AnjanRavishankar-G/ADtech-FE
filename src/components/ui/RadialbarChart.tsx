"use client";

import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts"; 

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const BasicRadialBar = ({ height = 350 }) => {
  const { theme = "light" } = useTheme(); // Default theme fallback

  const series = [80];

  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth" as "smooth", 
      width: 8,
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "80%" },
        dataLabels: {
          value: {
            fontSize: "18px",
            fontWeight: 700,
            color: theme === "dark" ? "#FFF" : "#000",
          },
        },
      },
    },
    colors: [theme === "dark" ? "#00C49F" : "#FF8042"],
    labels: ["Cricket"],
  };

  return <Chart options={options} series={series} type="radialBar" height={height} />;
};

export default BasicRadialBar;
{/* <div className="w-20 h-20 flex justify-center items-center">
                        <BasicRadialBar percentage={percentage} />
                      </div> */}