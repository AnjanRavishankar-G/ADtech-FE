"use client";
import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react"; // Add useCallback
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import SplineArea from "../components/ui/SplineArea";
import DateRangePicker from "../components/ui/datePicker";
import Footer from "../components/ui/footer";
import BasicPieChart from "../components/ui/bargraph";
import Layout from "../components/ui/Layout";
import { useSearchParams, useRouter } from 'next/navigation';
import { createAuthenticatedFetch } from '../../utils/api';
import Cookies from 'js-cookie';

// Update the CampaignData type to match the API response
type CampaignData = {
  SN: number;
  campaignName: string;        // Changed to match API
  campaignType: string;        // Changed to match API
  CampaignId: number;
  adGroupId: number;
  Sales: number;
  Spend: number;
  Goal: number;
  Progress: number;
};

type ChartData = {
  Date: string;
  DailySales: number;
  Spend: number;
};
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;


async function fetchCampaignDataChart() {
  const fetchWithAuth = createAuthenticatedFetch();
  try {
    const response = await fetchWithAuth(`${backendURL}/report/campaign_data`, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${Cookies.get('auth_token')}`,
        'Content-Type': 'application/json',
        'X-ID-Token': Cookies.get('id_token') || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers)
      });
      throw new Error("Failed to fetch chart data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}

// Make CampaignContent a regular function component without export
function CampaignContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedBrand = searchParams.get('brand');

  // Create a memoized fetchWithAuth
  const fetchWithAuth = useMemo(() => createAuthenticatedFetch(), []);

  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Wrap fetchCampaignData with useCallback
  const fetchCampaignData = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);
      if (selectedBrand) queryParams.append('Brand', selectedBrand); // Changed 'brand' to 'Brand'

      const url = `${backendURL}/report/campaign_level_table${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;
      
      console.log('Fetching URL:', url); // Debug log
      
      const response = await fetchWithAuth(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Authorization': `Bearer ${Cookies.get('auth_token')}`,
          'Content-Type': 'application/json',
          'X-ID-Token': Cookies.get('id_token') || ''
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: Object.fromEntries(response.headers)
        });
        throw new Error(`Failed to fetch campaign data: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      if (error instanceof Error && error.message === 'No authentication token found') {
        router.push('/login');
      }
      throw error;
    }
  }, [selectedBrand, fetchWithAuth, router]);

  // Modify the first useEffect
  useEffect(() => {
    let isSubscribed = true; // Add cleanup flag

    async function loadData() {
      if (!isSubscribed) return;
      
      try {
        setIsLoading(true);
        const startStr = startDate ? startDate.toISOString().split('T')[0] : undefined;
        const endStr = endDate ? endDate.toISOString().split('T')[0] : undefined;
        const results = await fetchCampaignData(startStr, endStr);
        if (isSubscribed) {
          setCampaignData(results);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    
    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [startDate, endDate, selectedBrand, fetchCampaignData]); // Remove fetchWithAuth from dependencies

  // Modify the chart data useEffect
  useEffect(() => {
    let isSubscribed = true;

    async function loadChartData() {
      if (!isSubscribed) return;
      
      try {
        setChartLoading(true);
        const results = await fetchCampaignDataChart();
        if (isSubscribed) {
          setChartData(results);
        }
      } catch (err) {
        if (isSubscribed) {
          setChartError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (isSubscribed) {
          setChartLoading(false);
        }
      }
    }

    loadChartData();

    return () => {
      isSubscribed = false;
    };
  }, []); // Empty dependency array since chart data doesn't depend on other state

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!campaignData.length) return <div className="text-red-500">No campaign data available</div>;

  const top5Campaigns = [...campaignData]
    .sort((a, b) => b.Sales - a.Sales)
    .slice(0, 5);

  const top5BrandNames = top5Campaigns.map(campaign => campaign.campaignName);
  const top5BrandSalesData = top5Campaigns.map(campaign => campaign.Sales);

  // Extract the top 5 campaigns based on spend
const top5CampaignsBySpend = [...campaignData]
.sort((a, b) => b.Spend - a.Spend)
.slice(0, 5);

const top5SpendBrandNames = top5CampaignsBySpend.map(campaign => campaign.campaignName);
const top5SpendBrandData = top5CampaignsBySpend.map(campaign => campaign.Spend);

  
  

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
        <h1 className="text-3xl font-bold mb-4 text-center">List of Campaigns</h1>

        <div className="shadow-2xl p-4 text-black bg-white rounded-2xl dark:bg-black ">
          {chartLoading ? (
            <div>Loading chart...</div>
          ) : chartError ? (
            <div className="text-red-500">{chartError}</div>
          ) : (
            <SplineArea data={chartData} height={350} theme={document.documentElement.classList.contains("dark") ? "dark" : "light"} />
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
            <DateRangePicker onDateRangeChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setIsDatePickerOpen(false);
            }} />
            )}

          <Link
            href="/brand"
            className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-2xl text-sm px-4 py-2 mt-4 mb-3 dark:hover:bg-gray-700 dark:text-white dark:bg-black"
          >
            <button className="flex items-center">
              Brand: {selectedBrand || 'All Brands'}
            </button>
          </Link>
        </div>

        <div className="shadow-2xl p-4 ml-1 bg-white rounded-2xl dark:bg-black  overflow-auto max-h-[500px] ">
          <Table className="w-full">
            <TableHeader >
              <TableRow>
                <TableHead className="text-center">SN</TableHead>
                <TableHead className="text-center">Campaign</TableHead>
                <TableHead className="text-center">
                  Campaign Type
                  <select 
                    aria-label="Filter by campaign type"
                    className="ml-3 bg-black text-white rounded">
                      <option className="py-3" value="SP">SP</option>
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
                      href={`/ad_details?brand=${encodeURIComponent(selectedBrand || '')}&campaign=${encodeURIComponent(campaign.campaignName)}`}
                      className="text-black hover:bg-gray-300 block w-full h-full p-4 dark:text-white dark:hover:bg-blue-900"
                    >
                      {campaign.campaignName}
                    </Link>
                  </TableCell>
                  <TableCell>{campaign.campaignType}</TableCell>
                  <TableCell>{campaign.Sales?.toLocaleString() || '-'}</TableCell>
                  <TableCell>{campaign.Spend?.toLocaleString() || '-'}</TableCell>
                  <TableCell>{campaign.Goal?.toLocaleString() || '-'}</TableCell>
                  <TableCell>{campaign.Progress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-12 flex gap-4 rounded-2xl">
          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
            <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Campaign Based on Sales</h2>
            <div className="flex flex-col">
              <div className="overflow-x-auto mb-4">
                <Table className="min-w-full border text-center">
                  <TableHeader className="bg-black text-white top-0 z-10">
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top5Campaigns.map((campaign) => (
                      <TableRow key={campaign.SN}>
                        <TableCell className="w-1/2">{campaign.campaignName}</TableCell>
                        <TableCell className="w-1/2">{campaign.Sales?.toLocaleString() || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="h-[400px]">
                <BasicPieChart 
                  series={top5BrandSalesData} 
                  height={800}
                  labels={top5BrandNames}
                  colors={["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0"]}
                  width={400}
                />
              </div>
            </div>     
          </div>

          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
            <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Campaign Based on Spends</h2>
            <div className="flex flex-col">
              <div className="overflow-x-auto mb-4">
                <Table className="min-w-full border text-center">
                  <TableHeader className="bg-black text-white top-0 z-10">
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Spends</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top5CampaignsBySpend.map((campaign) => (
                      <TableRow key={campaign.SN}>
                        <TableCell className="w-1/2">{campaign.campaignName}</TableCell>
                        <TableCell className="w-1/2">{campaign.Spend?.toLocaleString() || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="h-[400px]">
                <BasicPieChart 
                  series={top5SpendBrandData} 
                  height={800}
                  labels={top5SpendBrandNames}
                  colors={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]}
                  width={400}
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

// Export only the default component
export default function PerformanceTable() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CampaignContent />
    </Suspense>
  );
}