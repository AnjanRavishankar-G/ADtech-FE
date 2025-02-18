"use client";

import "@/css/brand.css";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DateRangePicker from "../../components/ui/datePicker";
import Header from "../../components/ui/header";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type BrandTargetData = {
  Brand: string;
  DateTime: string;
  DailySales: number;
  Target: number;
  TargetAchieved: number;
};

async function fetchFilteredBrandTargetData(startDate: string, endDate: string) {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/get_filtered_brands?start_date=${startDate}&end_date=${endDate}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to fetch filtered brand target data");
    const data = await res.json();
    return data.length > 0 ? data : null;
  } catch (error) {
    console.error("Error fetching brand target data:", error);
    return null;
  }
}

async function fetchUniqueBrandTargetData() {
  try {
    const res = await fetch(
      "http://127.0.0.1:8000/get_unique/brand_level_table",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to fetch unique brand target data");
    return await res.json();
  } catch (error) {
    console.error("Error fetching unique brand target data:", error);
    return [];
  }
}

export default function BrandTargetTables() {
  const [brandTargetData, setBrandTargetData] = useState<BrandTargetData[] | null>(null);
  const [uniqueBrandTargetData, setUniqueBrandTargetData] = useState<BrandTargetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDataAvailable, setIsDataAvailable] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const uniqueData = await fetchUniqueBrandTargetData();
        setUniqueBrandTargetData(uniqueData);
      } catch (err) {
        console.error("Error loading unique brand data:", err);
      }

      if (startDate && endDate) {
        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];
        try {
          const filteredData = await fetchFilteredBrandTargetData(formattedStartDate, formattedEndDate);
          if (filteredData === null) {
            setBrandTargetData([]); 
            setIsDataAvailable(false); 
          } else {
            setBrandTargetData(filteredData);
            setIsDataAvailable(true);
          }
        } catch (err) {
          console.error("Error fetching filtered brand target data:", err);
          setIsDataAvailable(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setBrandTargetData(null);
        setIsDataAvailable(true);
        setIsLoading(false);
      }
    }
    loadData();
  }, [startDate, endDate]);

  if (isLoading) return <div>Loading...</div>;

  const totalTargetAchieved = uniqueBrandTargetData.reduce(
    (acc, brand) => acc + brand.TargetAchieved,
    0
  );

  const topBrands = [...uniqueBrandTargetData]
    .sort((a, b) => b.DailySales - a.DailySales)
    .slice(0, 5);

  const displayData = startDate && endDate ? (brandTargetData || []) : topBrands;

  return (
    <div className="p-5 space-y-8">
      <Header/>
      <div className="w-full p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-white text-4xl font-serif tracking-wider">
            <h2 className="text-4xl font-light">Agency name</h2>
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-light">Total Accounts: 28</h2>
            <h2 className="text-2xl font-light">Total Active: 25</h2>
            <h2 className="text-2xl font-light">
              Total revenue: INR {totalTargetAchieved.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h1 className="text-xl font-bold mb-7  text-center">Brands</h1>
        <div className="mt-4 flex ">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>

        <div className="overflow-x-auto">
          <Table className="border border-default-300 text-center">
            <TableHeader className="bg-black text-white sticky top-0 z-10">
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Target Achieved</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueBrandTargetData.map((brand) => (
                <TableRow key={`${brand.Brand}-${brand.DateTime}`}>
                  <TableCell>{brand.Brand}</TableCell>
                  <TableCell>{brand.Target?.toLocaleString() || '-'}</TableCell>
                  <TableCell>{brand.TargetAchieved?.toLocaleString() || '-'}</TableCell>
                  <TableCell>
                    {brand.Target > 0
                      ? ((brand.TargetAchieved / brand.Target) * 100).toFixed(2)
                      : "0.00"}
                    %
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg text-center">
        <h2 className="text-lg font-bold">Top 5 Brands Based on Daily Sales</h2>
      </div>
      <div className="p-5">
        <Table className="border border-default-300 text-center">
          <TableHeader className="bg-black text-white sticky top-0 z-10">
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Daily Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((brand) => (
              <TableRow key={`${brand.Brand}-${brand.DailySales}`}>
                <TableCell>{brand.Brand}</TableCell>
                <TableCell>{brand.DailySales?.toLocaleString() || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isDataAvailable && startDate && endDate && (
        <div className="text-gray-500 mt-4 text-center">
          No data available for the selected date range (
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}).
        </div>
      )}
    </div>
  );
}
