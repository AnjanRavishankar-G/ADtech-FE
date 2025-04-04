"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import DateRangePicker from "@/app/components/ui/datePicker";
import BasicPieChart from "@/app/components/ui/bargraph";
import Footer from "@/app/components/ui/footer";
import Layout from "@/app/components/ui/Layout";
import { useSearchParams } from 'next/navigation';

type CampaignData = {
  SN: number;
  adGroup: string;
  adFormat: string;
  SKU: string;
  Spend: number;
  Sales: number;
  ACOS: number;
  ROAS: number;
  Impressions: number;
  CTR: number;
  Clicks: number;
  DRR: number;
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  cost: number;
  costPerClick: number;
  clickThroughRate: string;
  campaign_type: string;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Modify the fetchCampaignData function to not require campaign parameter
async function fetchCampaignData(startDate: string | null, endDate: string | null) {
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const url = `${backendURL}/report/ad_group_table${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        'Authorization': process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error("Error fetching campaign data:", error);
    throw error;
  }
}

// Separate the main content into a new component
function AdDetailsContent() {
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const selectedBrand = searchParams.get('brand');
  const selectedCampaign = searchParams.get('campaign');

  // Date Range Picker State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // State to manage date range picker visibility
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const startStr = startDate ? startDate.toISOString().split('T')[0] : null;
        const endStr = endDate ? endDate.toISOString().split('T')[0] : null;
        
        const results = await fetchCampaignData(startStr, endStr);
        setCampaignData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  
    loadData();
  }, [startDate, endDate]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!campaignData.length) return <div className="text-red-500">No ad groups data available.</div>;

  // Sort by sales and pick top 5
  const topSales = [...campaignData]
    .sort((a, b) => b.Sales - a.Sales)
    .slice(0, 5);

  const salesSeries = topSales.map(campaign => campaign.Sales);
  const salesLabels = topSales.map(campaign => campaign.adGroup);

  // Extract top 5 ad groups by spend
  const topSpend = [...campaignData]
    .sort((a, b) => b.Spend - a.Spend)
    .slice(0, 5);

  // Prepare data for Pie Chart
  const spendSeries = topSpend.map(campaign => campaign.Spend);
  const spendLabels = topSpend.map(campaign => campaign.adGroup);

  const handleButtonClick = () => {
    setIsDatePickerOpen(!isDatePickerOpen); // Toggle date picker visibility
  };

  return (
    <Layout>
      <div className="p-5">
        <div className="w-full p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-white text-4xl">
              <h2 className="text-2xl font-light">IPG</h2>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center">Ad Groups</h1>

        <div className="flex items-center gap-4 mb-6">
          {/* Button to open the Date Range Picker */}
          <button 
            onClick={handleButtonClick}
            className="text-Black bg-white shadow-2xl hover:bg-gray-900 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:hover:bg-gray-700 dark:bg-black dark:text-white"
          >
            {isDatePickerOpen ? "Close Date Picker" : "Select Date Range"}
          </button>

          <div className="text-Black bg-white shadow-2xl font-medium rounded-lg text-sm px-4 py-2 dark:text-white dark:bg-black flex gap-4">
            <span>Brand: {selectedBrand || 'N/A'}</span>
            <span>Campaign: {selectedCampaign || 'N/A'}</span>
          </div>
        </div>

        {isDatePickerOpen && (
          <div className="mb-6">
            <DateRangePicker onDateRangeChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setIsDatePickerOpen(false);
            }} />
          </div>
        )}
        
        <div className="shadow-2xl p-4 bg-white rounded-2xl overflow-x-auto max-h-96 dark:bg-black mt-4">
          <Table className="border border-default-100 rounded-lg">
            <TableHeader className="bg-black text-white  top-0 z-10">
              <TableRow>
                <TableHead className="border border-default-300 text-center">Ad Group</TableHead>
                <TableHead className="border border-default-300 text-center">Ad format</TableHead>
                <TableHead className="border border-default-300 text-center">SKU</TableHead>
                <TableHead className="border border-default-300 text-center">Spends</TableHead>
                <TableHead className="border border-default-300 text-center">Sales</TableHead>
                <TableHead className="border border-default-300 text-center">ACOS</TableHead>
                <TableHead className="border border-default-300 text-center">ROAS</TableHead>
                <TableHead className="border border-default-300 text-center">Impression</TableHead>
                <TableHead className="border border-default-300 text-center">CTR</TableHead>
                <TableHead className="border border-default-300 text-center">Clicks</TableHead>
                <TableHead className="border border-default-300 text-center rounded-tr-lg">DRR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
              {campaignData.map((campaign) => (
                <TableRow key={campaign.SN} className="text-center">
                  <TableCell className="border border-default-300 hover:bg-default-100 transition-colors cursor-pointer p-0">
                    <Link 
                      href={`/adGroupDetails`} 
                      className="text-black hover:bg-gray-300 block w-full h-full p-4 dark:text-white dark:hover:bg-blue-900"
                    >
                      {campaign.adGroup}
                    </Link>
                  </TableCell>
                  <TableCell className="border border-default-300">{campaign.adFormat}</TableCell>
                  <TableCell className="border border-default-300">{campaign.SKU}</TableCell>
                  <TableCell className="border border-default-300">{campaign.Spend?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="border border-default-300">{campaign.Sales?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="border border-default-300">{campaign.ACOS}</TableCell>
                  <TableCell className="border border-default-300">{campaign.ROAS}</TableCell>
                  <TableCell className="border border-default-300">{campaign.Impressions?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="border border-default-300">{campaign.CTR}</TableCell>
                  <TableCell className="border border-default-300">{campaign.Clicks}</TableCell>
                  <TableCell className="border border-default-300">{campaign.DRR}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className=" p-1 mt-5 flex gap-4">
          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-2xl  dark:bg-black">
            <h1 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Ad Groups by Spend</h1>
            <div className="overflow-x-auto max-h-96 p-1">
              <Table className="border border-default-100 rounded-lg">
                <TableHeader className="bg-black text-white top-0 z-10">
                  <TableRow>
                    <TableHead>Ad Group</TableHead>
                    <TableHead>Spends</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-white">
                  {topSpend.slice(0, 5).map((campaign) => (
                    <TableRow key={campaign.SN} className="text-center">
                      <TableCell className="w-1/2">{campaign.adGroup}</TableCell>
                      <TableCell className="w-1/2">{campaign.Spend?.toLocaleString() || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <BasicPieChart 
                series={spendSeries} 
                height={350}
                labels={spendLabels}
              />
            </div>
          </div>
          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-2xl  dark:bg-black">
            <h1 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Ad Groups by Sales</h1>
            <div className="overflow-x-auto max-h-96 p-1">
              <Table className="border border-default-100 rounded-lg">
                <TableHeader className="bg-black text-white top-0 z-10">
                  <TableRow>
                    <TableHead>Ad Group</TableHead>
                    <TableHead>Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-white">
                  {topSales.slice(0, 5).map((campaign) => (
                    <TableRow key={campaign.SN} className="text-center">
                      <TableCell className="w-1/2">{campaign.adGroup}</TableCell>
                      <TableCell className="w-1/2">{campaign.Sales?.toLocaleString() || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <BasicPieChart 
                series={salesSeries} 
                height={350}
                labels={salesLabels}
              />
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

// Main page component wrapped with Suspense
export default function PerformanceTable() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdDetailsContent />
    </Suspense>
  );
}