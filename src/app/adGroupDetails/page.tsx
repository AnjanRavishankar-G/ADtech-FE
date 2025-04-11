"use client";
import { useState, useEffect, Suspense } from "react";
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

import Footer from "@/app/components/ui/footer";
import BasicPieChart from "../components/ui/bargraph";
import MainSidebar from "../components/ui/mainsidebar";

type AsinData = {
  SN: number;
  asin: string;
  sku: string;
  adFormat: string;
  campaignStatus: string;
  dailySpends: number;
  dailySales: number;
  ACOS: string;
  ROAS: string;

  advertisedAsin: string;
  advertisedSku: string;
  impressions: number;
  clicks: number;
  clickThroughRate: string;
  cost: number;
  adGroupId: string;
  campaignId: string;
};

type KeywordData = {
  keyword: string;
  theme: string;
  match_type: string;
  rank: number;
  bid: number;
};

type KeywordPerformanceData = {
  SN: number;
  keyword: string;
  matchType: string;
  revenue: number;
  spend: number;
  ACOS: number;
  ROAS: number;
  clicks: number;
  impresssion: number;
  bid: number;
};

type NegativeKeyword = {
  keywordID: string;
  keyword: string;
  matchType: string;
  adGroupId: string;
  campaignId: string;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

function getRequiredHeaders() {
  const idToken = Cookies.get('id_token');
  const authToken = Cookies.get('auth_token');

  if (!idToken) {
    console.error('Missing id_token');
    window.location.href = '/';
    throw new Error('Authentication token not found. Please login again.');
  }

  console.log('Tokens found:', { authToken: !!authToken, idToken: !!idToken });

  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    'X-ID-Token': idToken
  };
}

async function fetchNegativeKeywords() {
  try {
    const res = await fetch(`${backendURL}/report/negative_keyword`, {
      cache: "no-store",
      headers: getRequiredHeaders()
    });

    if (!res.ok) {
      throw new Error("Failed to fetch negative keywords");
    }

    const data = await res.json();
    return data.map((kw: NegativeKeyword) => ({
      keywordID: kw.keywordID.toString(),
      keyword: kw.keyword,
      matchType: kw.matchType,
      adGroupId: '',
      campaignId: ''
    }));
  } catch (error) {
    console.error("Error fetching negative keywords:", error);
    throw error;
  }
}

async function fetchAsinData() {
  try {
    const res = await fetch(`${backendURL}/report/asin_level_table?page=1&limit=1000`, {
      cache: "no-store",
      headers: getRequiredHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch ASIN data");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching ASIN data:", error);
    throw error;
  }
}

async function fetchKeywordData() {
  try {
    const res = await fetch(`${backendURL}/report/keyword_recommendation`, {
      cache: "no-store",
      headers: getRequiredHeaders()
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch keyword recommendations: ${res.status}`);
    }

    interface KeywordResponse {
      keyword: string;
      keyword_for: string;
      match_type: string;
      keyword_rank: string;
      bids: number;
    }

    const data = await res.json();
    return data.map((item: KeywordResponse) => ({
      keyword: item.keyword,
      theme: item.keyword_for,
      match_type: item.match_type,
      rank: parseInt(item.keyword_rank),
      bid: item.bids
    }));
  } catch (error) {
    console.error("Error fetching keyword data:", error);
    throw error;
  }
}

async function fetchKeywordPerformance() {
  try {
    const res = await fetch(`${backendURL}/report/targeting_level_table`, {
      cache: "no-store",
      headers: getRequiredHeaders()
    });

    if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

    interface KeywordPerformanceResponse {
      SN: number;
      keyword?: string;
      matchType?: string;
      revenue: number;
      spend: number;
      ACOS: number;
      ROAS: number;
      clicks: number;
      impresssion: number;
      bid: number;
    }

    const data = await res.json();
    return data.map((item: KeywordPerformanceResponse) => ({
      SN: item.SN,
      keyword: item.keyword || '-',
      matchType: item.matchType || '-',
      revenue: Number(item.revenue) || 0,
      spend: Number(item.spend) || 0,
      ACOS: Number(item.ACOS),
      ROAS: Number(item.ROAS),
      clicks: Number(item.clicks) || 0,
      impresssion: Number(item.impresssion) || 0,
      bid: Number(item.bid) || 0
    }));
  } catch (error) {
    console.error("Error fetching keyword performance:", error);
    throw error;
  }
}

const checkAuthentication = () => {
  const idToken = Cookies.get('id_token');
  const authToken = Cookies.get('auth_token');

  if (!idToken || !authToken) {
    console.error('Missing tokens:', {
      hasIdToken: !!idToken,
      hasAuthToken: !!authToken
    });

    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    return false;
  }
  return true;
};

function AdGroupContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [asinData, setAsinData] = useState<AsinData[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [keywordPerformanceData, setKeywordPerformanceData] = useState<KeywordPerformanceData[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('asin');

  const searchParams = useSearchParams();
  const selectedBrand = searchParams.get('brand');
  const selectedCampaign = searchParams.get('campaign');
  const selectedAdGroup = searchParams.get('adGroup');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        if (!checkAuthentication()) {
          console.error('Authentication check failed');
          return;
        }

        const [asinResults, keywordPerformance] = await Promise.all([
          fetchAsinData(),
          fetchKeywordPerformance()
        ]);

        console.log('Data loaded:', {
          asinCount: asinResults.length,
          keywordCount: keywordPerformance.length
        });

        setAsinData(asinResults);
        setKeywordPerformanceData(keywordPerformance);

      } catch (err) {
        console.error("Error loading initial data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadTabData = async () => {
      if (!checkAuthentication()) return;

      try {
        setIsLoading(true);

        if (selectedTab === 'NegativeKeyword') {
          const negativeKeywordResults = await fetchNegativeKeywords();
          setNegativeKeywords(negativeKeywordResults);
        }

        if (selectedTab === 'keywordRecommendation') {
          const keywordResults = await fetchKeywordData();
          setKeywordData(keywordResults);
        }
      } catch (err) {
        console.error('Error loading tab data:', err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadTabData();
  }, [selectedTab]);

  if (isLoading) return <div className="p-5">Loading...</div>;
  if (error) return (
    <div className="p-5">
      <div className="text-red-500">Error: {error}</div>
      <button
        onClick={() => window.location.href = '/'}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Return to Login
      </button>
    </div>
  );
  if (!asinData.length) return <div className="p-5 text-red-500">No ASIN data available for this ad group</div>;

  const top5BySales = [...asinData]
    .sort((a, b) => b.dailySales - a.dailySales)
    .slice(0, 5);

  const top5BySpends = [...asinData]
    .sort((a, b) => b.dailySpends - a.dailySpends)
    .slice(0, 5);

  const salesChartData = {
    series: top5BySales.map((asin) => asin.dailySales),
    labels: top5BySales.map((asin) => asin.asin),
  };

  const spendsChartData = {
    series: top5BySpends.map((asin) => asin.dailySpends),
    labels: top5BySpends.map((asin) => asin.asin),
  };

  return (
    <div className="flex h-screen">
      <MainSidebar
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <main className={`flex-1 p-5 overflow-auto transition-all duration-300 ${
        collapsed ? "ml-16" : "ml-64"
      }`}>
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/brand"
            className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:hover:bg-gray-700 dark:text-white dark:bg-black transition-colors"
          >
            <button className="flex items-center">
              Brand: {selectedBrand || 'N/A'}
            </button>
          </Link>
          <Link
            href={`/campaign?brand=${encodeURIComponent(selectedBrand || '')}`}
            className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:hover:bg-gray-700 dark:text-white dark:bg-black transition-colors"
          >
            <button className="flex items-center">
              Campaign: {selectedCampaign || 'N/A'}
            </button>
          </Link>
          <Link
            href={`/ad_details?brand=${encodeURIComponent(selectedBrand || '')}&campaign=${encodeURIComponent(selectedCampaign || '')}`}
            className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:hover:bg-gray-700 dark:text-white dark:bg-black transition-colors"
          >
            <button className="flex items-center">
              Ad Group: {selectedAdGroup || 'N/A'}
            </button>
          </Link>
        </div>
        {selectedTab === 'asin' && (
          <div>
            <div className="shadow-2xl p-4 bg-white rounded-2xl  dark:bg-black">
              <h2 className="text-lg font-bold mt-6">ASIN Performance</h2>
              <Table className="border border-default-300">
                <TableHeader className="bg-black text-white sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="border border-default-300">ASIN</TableHead>
                    <TableHead className="border border-default-300">SKU</TableHead>
                    <TableHead className="border border-default-300 relative ">Ad format</TableHead>
                    <TableHead className="border border-default-300">Campaign Status</TableHead>
                    <TableHead className="border border-default-300">Daily Spend</TableHead>
                    <TableHead className="border border-default-300">Daily sales</TableHead>
                    <TableHead className="border border-default-300">ACOS</TableHead>
                    <TableHead className="border border-default-300">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asinData.map((asin) => (
                    <TableRow key={asin.SN} className="text-center">
                      <TableCell className="border border-default-300">{asin.asin}</TableCell>
                      <TableCell className="border border-default-300">{asin.sku}</TableCell>
                      <TableCell className="border border-default-300">{asin.adFormat}</TableCell>
                      <TableCell className="border border-default-300">{asin.campaignStatus}</TableCell>
                      <TableCell className="border border-default-300">{asin.dailySpends?.toLocaleString() || '-'}</TableCell>
                      <TableCell className="border border-default-300">{asin.dailySales?.toLocaleString() || '-'}</TableCell>
                      <TableCell className="border border-default-300">{asin.ACOS}</TableCell>
                      <TableCell className="border border-default-300">{asin.ROAS}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-12 flex gap-4 rounded-2xl">
              <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
                <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 ASIN Based on Spends</h2>
                <div className="flex flex-col">
                  <div className="overflow-x-auto mb-4">
                    <Table className="min-w-full border text-center">
                      <TableHeader className="bg-black text-white top-0 z-10">
                        <TableRow>
                          <TableHead>ASIN</TableHead>
                          <TableHead>Daily Spends</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {top5BySpends.map((asin) => (
                          <TableRow key={asin.advertisedAsin}>
                            <TableCell className="w-1/2">{asin.asin}</TableCell>
                            <TableCell className="w-1/2">{asin.dailySpends?.toLocaleString() || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="h-[300px]">
                    <BasicPieChart 
                      series={spendsChartData.series} 
                      height={800}
                      labels={spendsChartData.labels}
                      colors={["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0"]}
                      width={300}
                    />
                  </div>
                </div>     
              </div>

              <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
                <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 ASIN Based on Sales</h2>
                <div className="flex flex-col">
                  <div className="overflow-x-auto mb-4">
                    <Table className="min-w-full border text-center">
                      <TableHeader className="bg-black text-white top-0 z-10">
                        <TableRow>
                          <TableHead>ASIN</TableHead>
                          <TableHead>Daily Sales</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {top5BySales.map((asin) => (
                          <TableRow key={asin.advertisedAsin}>
                            <TableCell className="w-1/2">{asin.asin}</TableCell>
                            <TableCell className="w-1/2">{asin.dailySales?.toLocaleString() || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="h-[300px]">
                    <BasicPieChart 
                      series={salesChartData.series} 
                      height={800}
                      labels={salesChartData.labels}
                      colors={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]}
                      width={300}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedTab === 'keywordPerformance' && (
          <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black">
            <h2 className="text-lg font-bold mt-6">Keyword Performance</h2>
            <Table className="border border-default-300">
              <TableHeader className="bg-black text-white sticky top-0 z-10">
                <TableRow>
                  <TableHead className="border border-default-300">Keyword</TableHead>
                  <TableHead className="border border-default-300">Match Type</TableHead>
                  <TableHead className="border border-default-300">Revenue</TableHead>
                  <TableHead className="border border-default-300">Spend</TableHead>
                  <TableHead className="border border-default-300">ACOS</TableHead>
                  <TableHead className="border border-default-300">ROAS</TableHead>
                  <TableHead className="border border-default-300">Clicks</TableHead>
                  <TableHead className="border border-default-300">Impressions</TableHead>
                  <TableHead className="border border-default-300">Bid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywordPerformanceData.map((keyword) => (
                  <TableRow key={keyword.SN} className="text-center">
                    <TableCell className="border border-default-300">{keyword.keyword}</TableCell>
                    <TableCell className="border border-default-300">{keyword.matchType}</TableCell>
                    <TableCell className="border border-default-300">₹{keyword.revenue?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="border border-default-300">₹{keyword.spend?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="border border-default-300">{keyword.ACOS}%</TableCell>
                    <TableCell className="border border-default-300">{keyword.ROAS}</TableCell>
                    <TableCell className="border border-default-300">{keyword.clicks}</TableCell>
                    <TableCell className="border border-default-300">{keyword.impresssion?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="border border-default-300">₹{keyword.bid.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {selectedTab === 'NegativeKeyword' && (
          <div className="shadow-2xl p-4 bg-white rounded-lg dark:bg-black">
            <h2 className="text-lg font-bold">Negative Keywords</h2>
            {negativeKeywords.length === 0 ? (
              <div className="text-gray-500 p-4">No negative keywords found for this campaign</div>
            ) : (
              <Table className="border border-default-300">
                <TableHeader className="bg-black text-white sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="border border-default-300">Keyword ID</TableHead>
                    <TableHead className="border border-default-300">Keyword</TableHead>
                    <TableHead className="border border-default-300">Match Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negativeKeywords.map((keyword) => (
                    <TableRow key={keyword.keywordID} className="text-center">
                      <TableCell className="border border-default-300">{keyword.keywordID}</TableCell>
                      <TableCell className="border border-default-300">{keyword.keyword}</TableCell>
                      <TableCell className="border border-default-300">
                        {keyword.matchType.replace('NEGATIVE_', '')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
        {selectedTab === 'keywordRecommendation' && (
          <div>
            <h2 className="text-lg font-bold mt-6">Keyword Recommendations</h2>
            {keywordData.length === 0 ? (
              <div className="text-gray-500 p-4">No keyword recommendations available</div>
            ) : (
              ['BROAD', 'EXACT', 'PHRASE'].map((matchType) => (
                <div key={matchType}>
                  <h3 className="font-semibold mt-4">{matchType} Match Keywords</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Theme</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Bid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keywordData
                        .filter(kw => kw.match_type === matchType)
                        .map((keyword, index) => (
                          <TableRow key={index}>
                            <TableCell>{keyword.keyword}</TableCell>
                            <TableCell>{keyword.theme}</TableCell>
                            <TableCell>{keyword.rank}</TableCell>
                            <TableCell>₹{keyword.bid.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>
        )}
        <div className="mt-32">
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default function AdGroupPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <AdGroupContent />
    </Suspense>
  );
}