"use client";
import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import Footer from "../components/ui/footer";
import HorizontalBarChart from "../components/ui/HorizontalBarChart";
import Layout from "../components/ui/Layout";
import { useSearchParams, useRouter } from 'next/navigation';
import { createAuthenticatedFetch } from '../../utils/api';
import Cookies from 'js-cookie';

type CampaignType = 'SP' | 'SB' | 'SD';

type SPCampaignData = {
  id: number;
  purchases7d: number;
  campaignBiddingStrategy: string;
  cost: number;
  endDate: string;
  sales14d: number;
  campaignId: string;
  clickThroughRate: number;
  sales30d: number;
  sales1d: number;
  impressions: number;
  sales7d: number;
  purchases14d: number;
  purchases30d: number;
  spend: number;
  clicks: number;
  purchases1d: number;
  campaignName: string;
  startDate: string;
  Portfolio_ID: string | null;
};

type SBCampaignData = {
  cost: number;
  detailPageViews: number;
  purchases: number;
  endDate: string;
  campaignId: string;
  topOfSearchImpressionShare: number;
  campaignStatus: string;
  clicks: number;
  impressions: number;
  campaignName: string;
  startDate: string;
  sales: number;
  created_at: string;
  Portfolio_Id: string | null;
};

type SDCampaignData = {
  cost: number;
  detailPageViews: number;
  purchases: number;
  endDate: string;
  campaignId: string;
  campaignStatus: string;
  clicks: number;
  impressions: number;
  campaignName: string;
  startDate: string;
  campaignBudgetAmount: number;
  sales: number;
  created_at: string;
  Portfolio_Id: string | null;
};

type CampaignDataType = SPCampaignData | SBCampaignData | SDCampaignData;

type CampaignRow = {
  [key: string]: string | number | null | undefined;
} & (SPCampaignData | SBCampaignData | SDCampaignData);

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

function CampaignContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedBrand = searchParams.get('brand');
  const portfolioId = searchParams.get('portfolioId');

  const fetchWithAuth = useMemo(() => createAuthenticatedFetch(), []);

  const [campaignType, setCampaignType] = useState<CampaignType>('SP');
  const [spCampaignData, setSpCampaignData] = useState<SPCampaignData[]>([]);
  const [sbCampaignData, setSbCampaignData] = useState<SBCampaignData[]>([]);
  const [sdCampaignData, setSDCampaignData] = useState<SDCampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaignData = useCallback(async (type: CampaignType) => {
    try {
      const queryParams = new URLSearchParams();
      if (portfolioId) {
        queryParams.append('portfolioId', portfolioId.replace('.0', ''));
      }

      const endpoint = type.toLowerCase() + '_campaign';
      const url = `${backendURL}/report/${endpoint}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;
      
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
        throw new Error(`Failed to fetch ${type} campaign data: ${response.status}`);
      }
      
      const data = await response.json();
      
      switch(type) {
        case 'SP':
          setSpCampaignData(data);
          break;
        case 'SB': 
          setSbCampaignData(data);
          break;
        case 'SD':
          setSDCampaignData(data);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${type} campaign data:`, error);
      throw error;
    }
  }, [portfolioId, fetchWithAuth]);

  const getTop5Campaigns = (type: CampaignType, data: CampaignDataType[], sortKey: string) => {
    if (!data.length) return [];
    return [...data]
      .sort((a, b) => {
        const aValue = type === 'SP' 
          ? (a as SPCampaignData)[`${sortKey}30d` as keyof SPCampaignData] || 0
          : (a as SBCampaignData | SDCampaignData)[sortKey as keyof (SBCampaignData | SDCampaignData)] || 0;
        const bValue = type === 'SP'
          ? (b as SPCampaignData)[`${sortKey}30d` as keyof SPCampaignData] || 0
          : (b as SBCampaignData | SDCampaignData)[sortKey as keyof (SBCampaignData | SDCampaignData)] || 0;
        return Number(bValue) - Number(aValue);
      })
      .slice(0, 5);
  };

  const CampaignTable = () => {
    const handleCampaignClick = (campaignName: string, campaignId: string) => {
      const queryParams = new URLSearchParams({
        campaign: campaignName,
        campaignId: campaignId,
        ...(selectedBrand && { brand: selectedBrand })
      });
      
      router.push(`/ad_details?${queryParams.toString()}`);
    };

    const getTableData = () => {
      switch(campaignType) {
        case 'SP':
          return {
            data: spCampaignData,
            columns: [
              'campaignName',
              'sales1d',
              'sales7d',
              'sales14d',
              'sales30d',
              'cost',
              'purchases1d',
              'purchases14d',
              'purchases30d',
              'spend',
              'clickThroughRate',
              'impressions',
              'clicks',
              'endDate',
              'startDate'
            ]
          };
        case 'SB':
          return {
            data: sbCampaignData,
            columns: [
              'campaignName',
              'campaignStatus',
              'cost',
              'detailPageViews',
              'purchases',
              'topOfSearchImpressionShare',
              'clicks',
              'impressions',
              'sales',
              'startDate',
              'endDate'
            ]
          };
        case 'SD':
          return {
            data: sdCampaignData,
            columns: [
              'campaignName',
              'campaignStatus',
              'clicks',
              'impressions',
              'detailPageViews',
              'purchases',
              'campaignBudgetAmount',
              'sales',
              'cost',
              'startDate',
              'endDate'
            ]
          };
      }
    };

    const { data, columns } = getTableData();

    const formatValue = (
      value: string | number | null | undefined,
      column: string,
      row: CampaignRow
    ) => {
      if (value === null || value === undefined) return '-';

      // Handle campaign name column with link
      if (column === 'campaignName') {
        return (
          <button
            onClick={() => handleCampaignClick(row.campaignName, row.campaignId)}
            className="text-blue-500 hover:text-blue-700 underline cursor-pointer"
          >
            {value}
          </button>
        );
      }

      // Format monetary values
      if (['cost', 'sales14d', 'sales30d', 'sales1d', 'sales7d', 'spend'].includes(column)) {
        return '₹' + Number(value).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }

      // Format percentages
      if (column === 'clickThroughRate') {
        return (Number(value) * 100).toFixed(2) + '%';
      }

      // Format numbers with commas
      if (typeof value === 'number') {
        return value.toLocaleString('en-IN');
      }

      return value;
    };

    return (
      <div className="shadow-2xl p-4 ml-1 bg-white rounded-2xl dark:bg-black overflow-auto max-h-[500px]">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead 
                  key={column} 
                  className="text-center whitespace-nowrap px-4 py-2 font-semibold"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#212830] text-white">
            {data.map((row: CampaignRow, index) => (
              <TableRow key={index} className="text-center">
                {columns.map(column => (
                  <TableCell 
                    key={column} 
                    className="px-4 py-2 whitespace-nowrap"
                  >
                    {formatValue(row[column], column, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const Top5Visualizations = () => {
    // Get appropriate data based on campaign type
    let currentData = [];
    let salesKey = '';
    let costKey = '';

    switch(campaignType) {
      case 'SP':
        currentData = spCampaignData;
        salesKey = 'sales30d';
        costKey = 'cost';
        break;
      case 'SB':
      case 'SD':
        currentData = campaignType === 'SB' ? sbCampaignData : sdCampaignData;
        salesKey = 'sales';
        costKey = 'cost';
        break;
    }

    const top5Sales = getTop5Campaigns(campaignType, currentData, salesKey);
    const top5Spend = getTop5Campaigns(campaignType, currentData, costKey);

    const salesSeries = top5Sales.map(campaign => {
      if (campaignType === 'SP') {
        return (campaign as SPCampaignData).sales30d || 0;
      }
      return (campaign as SBCampaignData | SDCampaignData).sales || 0;
    });
    const salesLabels = top5Sales.map(campaign => campaign.campaignName);

    const spendSeries = top5Spend.map(campaign => campaign.cost);
    const spendLabels = top5Spend.map(campaign => campaign.campaignName);

    return (
      <div className="mt-12 flex gap-4 rounded-2xl">
        {/* Sales Section */}
        <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
          <h2 className="text-2xl font-bold mb-6 text-center">Top 5 Campaigns by Sales</h2>
          <div className="h-[400px] mb-6">
            <HorizontalBarChart 
              series={salesSeries}
              labels={salesLabels}
              colors={["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0"]}
              height={370}
            />
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-full border text-center">
              <TableHeader className="bg-black text-white top-0 z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sales (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top5Sales.map((campaign, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-1/2">{campaign.campaignName}</TableCell>
                    <TableCell className="w-1/2">
                      {(campaignType === 'SP' 
                        ? (campaign as SPCampaignData).sales30d 
                        : (campaign as SBCampaignData | SDCampaignData).sales)?.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 2,
                        }) || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Spend Section */}
        <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
          <h2 className="text-2xl font-bold mb-6 text-center">Top 5 Campaigns by Spend</h2>
          <div className="h-[400px] mb-6">
            <HorizontalBarChart 
              series={spendSeries}
              labels={spendLabels}
              colors={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]}
              height={370}
            />
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-full border text-center">
              <TableHeader className="bg-black text-white top-0 z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Spend (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top5Spend.map((campaign, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-1/2">{campaign.campaignName}</TableCell>
                    <TableCell className="w-1/2">
                      {campaign.cost?.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 2,
                      }) || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      if (!isSubscribed || !portfolioId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        await fetchCampaignData(campaignType);
        
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
    
    return () => {
      isSubscribed = false;
    };
  }, [campaignType, portfolioId, fetchCampaignData]);

  return (
    <Layout>
      <div className="p-5">
        {/* Campaign Controls Section */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
          {/* Brand Selection Button */}
          <Link 
            href="/brand" 
            className="inline-flex items-center px-4 py-2 bg-white text-black 
              shadow-lg hover:bg-gray-100 font-medium rounded-lg text-sm 
              transition-all duration-200 ease-in-out border border-gray-200 
              dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 
              dark:border-gray-600"
          >
            <span className="whitespace-nowrap">
              Brand: {selectedBrand || 'All Brands'}
            </span>
          </Link>
          
          {/* Campaign Type Buttons */}
          <div className="flex gap-2">
            {(['SP', 'SB', 'SD'] as CampaignType[]).map(type => (
              <button
                key={type}
                onClick={() => setCampaignType(type)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  campaignType === type 
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Table Section */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <CampaignTable />
            <Top5Visualizations />
            <div className="mt-8">
              <Footer />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default function PerformanceTable() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CampaignContent />
    </Suspense>
  );
}