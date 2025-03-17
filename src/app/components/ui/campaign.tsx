"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import DateRangePicker from "./datePicker";
import SplineArea from "./SplineArea";
import BasicPieChart from "./bargraph";
import Footer from "./footer";
import Layout from "./Layout";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type CampaignData = {
  SN: number;
  campaignId: number;
  campaignName: string;
  adGroupId: number;
  adGroupName: string;
  cost: number;
  costPerClick: number;
  clickThroughRate: string;
  Spend: number;
  Sales: number;
  ACoS: string;
  ROAS: string;
  campaignType: string;
  impression: number;
  Goal: number;
  Progress: number;
};

type ChartData = {
  Date: string;
  DailySales: number;
  Spend: number;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchCampaignData() {
  try {
    const res = await fetchWithAuth(`${backendURL}/unique-brand`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch campaign data");
    const data = await res.json();
    console.log("Fetched Campaign Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching campaign data:", error);
    throw error;
  }
}

async function fetchCampaignDataChart() {
  try {
    const res = await fetchWithAuth(`${backendURL}/our-brand`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch chart data");
    return await res.json();
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}

export default function PerformanceTable() {
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // const [startDate, setStartDate] = useState<Date | null>(null);
  // const [endDate, setEndDate] = useState<Date | null>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const results = await fetchCampaignData();
        setCampaignData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadChartData() {
      try {
        const results = await fetchCampaignDataChart();
        setChartData(results);
      } catch (err) {
        setChartError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setChartLoading(false);
      }
    }
    loadChartData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!campaignData.length)
    return <div className="text-red-500">No campaign data available</div>;

  const top5Campaigns = [...campaignData]
    .sort((a, b) => b.Sales - a.Sales)
    .slice(0, 5);

  const top5BrandNames = top5Campaigns.map((campaign) => campaign.campaignName);
  const top5BrandSalesData = top5Campaigns.map((campaign) => campaign.Sales);

  // Extract the top 5 campaigns based on spend
  const top5CampaignsBySpend = [...campaignData]
    .sort((a, b) => b.Spend - a.Spend)
    .slice(0, 5);

  const top5SpendBrandNames = top5CampaignsBySpend.map(
    (campaign) => campaign.campaignName
  );
  const top5SpendBrandData = top5CampaignsBySpend.map(
    (campaign) => campaign.Spend
  );

  const handleButtonClick = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  return (
    <Layout>
      <div className="p-5">
        <div className="w-full p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-white text-4xl">
              <h2 className="text-4xl font-light">IPG</h2>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center">
          List of Campaigns
        </h1>

        <div className="shadow-2xl p-4 text-black bg-white rounded-2xl dark:bg-black ">
          {chartLoading ? (
            <div>Loading chart...</div>
          ) : chartError ? (
            <div className="text-red-500">{chartError}</div>
          ) : (
            <SplineArea
              data={chartData}
              height={350}
              theme={
                document.documentElement.classList.contains("dark")
                  ? "dark"
                  : "light"
              }
            />
          )}
        </div>

        <div className="flex -1 gap-4">
          <button
            onClick={handleButtonClick}
            className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-2xl text-sm px-4 py-2 mt-4 mb-3 dark:hover:bg-gray-700 dark:bg-black "
          >
            {isDatePickerOpen ? "Close Date Picker" : "Select Date Range"}
          </button>

          {isDatePickerOpen && (
            <DateRangePicker
              onDateRangeChange={(startDate, endDate) => {
                console.log("Selected range:", startDate, endDate);
              }}
            />
          )}

          <div className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-2xl text-sm px-4 py-2 mt-4 mb-3 dark:hover:bg-gray-700 dark:text-white dark:bg-black">
            <h2>Brand: brand 1</h2>
          </div>
        </div>

        <div className="shadow-2xl p-4 ml-1 bg-white rounded-2xl dark:bg-black  overflow-auto max-h-[500px] ">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">SN</TableHead>
                <TableHead className="text-center">Campaign</TableHead>
                <TableHead className="text-center">
                  Campaign Type
                  <select className="ml-3 bg-black text-white  rounded">
                    <option className="py-3" value="SP">
                      SP
                    </option>
                    <option value="SB">SB</option>
                    <option value="SD">SD</option>
                    <option value="SD">SBV</option>
                  </select>
                </TableHead>
                <TableHead className="text-center">Sales</TableHead>
                <TableHead className="text-center">Spend</TableHead>
                <TableHead className="text-center">Goal</TableHead>
                <TableHead className="text-center">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#212830] text-white">
              {campaignData.map((campaign) => (
                <TableRow key={campaign.SN} className="text-center">
                  <TableCell className="rounded-l-lg">{campaign.SN}</TableCell>
                  <TableCell className="border border-default-300 hover:bg-default-100 transition-colors cursor-pointer p-0">
                    <Link
                      href={`/ad_details}`}
                      className="text-black hover:bg-gray-300 block w-full h-full p-4 dark:text-white dark:hover:bg-blue-900"
                    >
                      {campaign.campaignName}
                    </Link>
                  </TableCell>
                  <TableCell>{campaign.campaignType}</TableCell>
                  <TableCell>{campaign.Sales}</TableCell>
                  <TableCell>{campaign.Spend}</TableCell>
                  <TableCell>{campaign.Goal}</TableCell>
                  <TableCell>{campaign.Progress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-4 p-1 mt-3">
          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-2xl dark:bg-black dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
            <h2 className="text-2xl font-bold mb-4 mt-8 text-center">
              Top 5 Campaign Based on Sales
            </h2>
            <div className="flex space-x-10 ">
              <div className="flex-1 overflow-x-auto">
                <Table className="min-w-full border border-blue-600 text-center">
                  <TableHeader className="bg-black text-white top-0 z-10">
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top5Campaigns.map((campaign) => (
                      <TableRow key={campaign.SN}>
                        <TableCell className="w-1/2">
                          {campaign.campaignName}
                        </TableCell>
                        <TableCell className="w-1/2">
                          {campaign.Sales}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <BasicPieChart
                  series={top5BrandSalesData}
                  height={350}
                  labels={top5BrandNames}
                />
              </div>
            </div>
          </div>

          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-2xl dark:bg-black dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
            <h2 className="text-2xl font-bold mb-4 mt-8 text-center">
              Top 5 Campaign Based on Spends
            </h2>
            <div className="flex space-x-10 ">
              <div className="flex-1 overflow-x-auto">
                <Table className="min-w-full border border-blue-600 text-center">
                  <TableHeader className="bg-black text-white top-0 z-10">
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Spends</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top5Campaigns.map((campaign) => (
                      <TableRow key={campaign.SN}>
                        <TableCell className="w-1/2">
                          {campaign.campaignName}
                        </TableCell>
                        <TableCell className="w-1/2">
                          {campaign.Spend}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <BasicPieChart
                  series={top5SpendBrandData}
                  height={350}
                  labels={top5SpendBrandNames}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </div>
    </Layout>
  );
}
