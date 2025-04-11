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
import dynamic from 'next/dynamic';

const SalesPopup = dynamic(() => import('@/app/components/SalesPopup'), { ssr: false });

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

  const [selectedSales, setSelectedSales] = useState<{
    isOpen: boolean;
    value: number;
    adGroup: string;
  }>({
    isOpen: false,
    value: 0,
    adGroup: ''
  });

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
          {/* Date Range Picker Button */}
          <button 
            onClick={handleButtonClick}
            className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:hover:bg-gray-700 dark:bg-black dark:text-white"
          >
            {isDatePickerOpen ? "Close Date Picker" : "Select Date Range"}
          </button>

          {/* Brand Button */}
          <Link
            href="/brand"
            className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:hover:bg-gray-700 dark:text-white dark:bg-black transition-colors"
          >
            <button className="flex items-center">
              Brand: {selectedBrand || 'N/A'}
            </button>
          </Link>

          {/* Campaign Button */}
          <Link
            href={`/campaign?brand=${encodeURIComponent(selectedBrand || '')}`}
            className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:hover:bg-gray-700 dark:text-white dark:bg-black transition-colors"
          >
            <button className="flex items-center">
              Campaign: {selectedCampaign || 'N/A'}
            </button>
          </Link>

          {isDatePickerOpen && (
            <DateRangePicker onDateRangeChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setIsDatePickerOpen(false);
            }} />
          )}
        </div>
        
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
                      href={`/adGroupDetails?brand=${encodeURIComponent(selectedBrand || '')}&campaign=${encodeURIComponent(selectedCampaign || '')}&adGroup=${encodeURIComponent(campaign.adGroup)}`}
                      className="text-black hover:bg-gray-300 block w-full h-full p-4 dark:text-white dark:hover:bg-blue-900"
                    >
                      {campaign.adGroup}
                    </Link>
                  </TableCell>
                  <TableCell className="border border-default-300">{campaign.adFormat}</TableCell>
                  <TableCell className="border border-default-300">{campaign.SKU}</TableCell>
                  <TableCell className="border border-default-300">{campaign.Spend?.toLocaleString() || '-'}</TableCell>
                  <TableCell 
                    className="border border-default-300 cursor-pointer hover:bg-slate-600/20 transition-colors"
                    onClick={() => setSelectedSales({
                      isOpen: true,
                      value: campaign.Sales || 0,
                      adGroup: campaign.adGroup
                    })}
                  >
                    {campaign.Sales?.toLocaleString() || '-'}
                  </TableCell>
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
        <div className="mt-12 flex gap-4 rounded-2xl">
          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
            <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Ad Groups by Sales</h2>
            <div className="flex flex-col">
              <div className="overflow-x-auto mb-4">
                <Table className="min-w-full border text-center">
                  <TableHeader className="bg-black text-white top-0 z-10">
                    <TableRow>
                      <TableHead>Ad Group</TableHead>
                      <TableHead>Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSales.map((campaign) => (
                      <TableRow key={campaign.SN}>
                        <TableCell className="w-1/2">{campaign.adGroup}</TableCell>
                        <TableCell className="w-1/2">{campaign.Sales?.toLocaleString() || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="h-[250px]">
                <BasicPieChart 
                  series={salesSeries} 
                  height={800}
                  labels={salesLabels}
                  colors={["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0"]}
                  width={250}
                />
              </div>
            </div>     
          </div>

          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
            <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Ad Groups by Spends</h2>
            <div className="flex flex-col">
              <div className="overflow-x-auto mb-4">
                <Table className="min-w-full border text-center">
                  <TableHeader className="bg-black text-white top-0 z-10">
                    <TableRow>
                      <TableHead>Ad Group</TableHead>
                      <TableHead>Spends</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSpend.map((campaign) => (
                      <TableRow key={campaign.SN}>
                        <TableCell className="w-1/2">{campaign.adGroup}</TableCell>
                        <TableCell className="w-1/2">{campaign.Spend?.toLocaleString() || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
                <div className="h-[300px]">
                <BasicPieChart 
                  series={spendSeries} 
                  height={800}
                  labels={spendLabels}
                  colors={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]}
                  width={300}
                />
                </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Footer />
        </div>
      </div>
      <SalesPopup
        isOpen={selectedSales.isOpen}
        onClose={() => setSelectedSales(prev => ({ ...prev, isOpen: false }))}
        adGroup={selectedSales.adGroup}
        currentSales={selectedSales.value}
      />
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