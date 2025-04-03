"use client";
import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

import Sidebar from "@/app/components/ui/sidebar";
import Footer from "@/app/components/ui/footer";
import BasicPieChart from "../components/ui/bargraph";

type AsinData = {
  SN: number;
  asin: string;
  sku: string;
  adFormat: string;
  campaignStatus: string;
  dailySpends: number;
  dailySales:number;
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
  keywordID: string;    // matches keywordId from API
  keyword: string;      // matches keywordText from API
  matchType: string;
  adGroupId: string;
  campaignId: string;
};

type NegativeKeywordResponse = {
  keywordId: string;
  keywordText: string;
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

// Update each fetch function to use getRequiredHeaders
async function fetchNegativeKeywords(campaignId: string) {
  try {
    const res = await fetch(`${backendURL}/negative-keywords/${campaignId}`, { 
      cache: "no-store",
      headers: getRequiredHeaders()
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      throw new Error("Failed to fetch negative keywords");
    }

    const response = await res.json();
    console.log('Negative keywords response:', response); // Debug log

    // Type the response properly
    const negativeKeywords = (response.negative_keywords || []) as NegativeKeywordResponse[];
    
    return negativeKeywords.map((kw) => ({
      keywordID: kw.keywordId,
      keyword: kw.keywordText,
      matchType: kw.matchType,
      adGroupId: kw.adGroupId,
      campaignId: kw.campaignId
    }));
  } catch (error) {
    console.error("Error fetching negative keywords:", error);
    throw error;
  }
}

async function fetchAsinData() {
  try {
    const res = await fetch(`${backendURL}/report/asin_level_table`, { 
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

async function fetchKeywordData(campaignId: string, adGroupId: string) {
  try {
    const res = await fetch(`${backendURL}/keyword-recommendation/${campaignId}/${adGroupId}`, {
      cache: "no-store",
      headers: getRequiredHeaders()
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch keyword recommendations: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('API Response:', data);
    return data.keywords || [];
  } catch (error) {
    console.error("Error fetching keyword data:", error);
    throw error;
  }
}

async function fetchKeywordPerformance() {
  try {
    const res = await fetch(`${backendURL}/report/targeting_report`, { 
      cache: "no-store",
      headers: getRequiredHeaders()
    });
    
    if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
    
    const data = await res.json();
    
    // Type the response data
    type TargetingReportItem = {
      SN: number;
      keyword: string;
      matchType: string;
      sales: number;
      cost: number;
      ACOS: number;
      ROAS: number;
      clicks: number;
      impressions: number;
      keywordBid: number;
    };
    
    return (data as TargetingReportItem[]).map((item) => ({
      SN: item.SN,
      keyword: item.keyword || '-',
      matchType: item.matchType || '-',
      revenue: item.sales ? Number(item.sales) : null,
      spend: item.cost ? Number(item.cost) : null,
      ACOS: Number(item.ACOS).toFixed(2),
      ROAS: Number(item.ROAS).toFixed(2),
      clicks: Number(item.clicks) || 0,
      impresssion: item.impressions ? Number(item.impressions) : null,
      bid: Number(item.keywordBid) || 0
    }));
  } catch (error) {
    console.error("Error fetching keyword performance:", error);
    throw error;
  }
}

const handleAuthError = (status: number) => {
  if (status === 401 || status === 403) {
    console.error('Auth error:', status);
    Cookies.remove('id_token');
    Cookies.remove('auth_token');
    window.location.href = '/';
    return true;
  }
  return false;
};

// Update fetchAdGroupDetailsByName
async function fetchAdGroupDetailsByName(adGroupName: string) {
  try {
    console.log('Fetching ad group details for:', adGroupName);
    
    if (!adGroupName) {
      throw new Error("Ad group name is required");
    }

    const res = await fetch(`${backendURL}/report/new_ad_group_table?adGroupName=${encodeURIComponent(adGroupName)}`, {
      cache: "no-store",
      headers: getRequiredHeaders()
    });

    if (handleAuthError(res.status)) {
      throw new Error("Authentication failed");
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch ad group details: ${res.status}`);
    }

    const data = await res.json();
    if (!data || !data[0]) {
      throw new Error("No ad group data found");
    }

    console.log('Ad group details received:', data[0]); // Debug log
    return data[0];
  } catch (error) {
    console.error("Error fetching ad group details:", error);
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
    
    // Only redirect if we're not already on the login page
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    return false;
  }
  return true;
};

export default function AdGroupPage() {
  // Remove router if not used
  // const router = useRouter();
  
  // Either use adGroupName or remove it
  // const [adGroupName, setAdGroupName] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [adGroupId, setAdGroupId] = useState<string>('');
  
  const [asinData, setAsinData] = useState<AsinData[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [keywordPerformanceData, setKeywordPerformanceData] = useState<KeywordPerformanceData[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('asin');
  
  // Add effect to fetch ad group details when component mounts
  useEffect(() => {
    const loadAdGroupDetails = async () => {
      try {
        setIsLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get('name');

        console.log('URL params:', urlParams.toString()); // Debug log
        console.log('Ad group name from URL:', name); // Debug log

        if (!checkAuthentication()) {
          console.error('Authentication check failed');
          return;
        }

        if (!name) {
          setError("No ad group name provided");
          return;
        }

        const details = await fetchAdGroupDetailsByName(name);
        
        if (!details) {
          setError("No ad group details found");
          return;
        }

        console.log('Ad group details loaded:', details);
        setCampaignId(details.campaignId);
        setAdGroupId(details.adGroupId);

      } catch (err) {
        console.error("Error loading ad group details:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadAdGroupDetails();
  }, []);

  // Modify the existing useEffect to use campaignId and adGroupId
  useEffect(() => {
    const loadData = async () => {
      if (!checkAuthentication()) return;
      
      try {
        // Only fetch negative keywords if we have a campaignId and tab is selected
        const promises = [fetchAsinData(), fetchKeywordPerformance()];
        
        if (selectedTab === 'NegativeKeyword' && campaignId) {
          promises.push(fetchNegativeKeywords(campaignId));
        }
        
        const [asinResults, keywordPerformance, negativeKeywordResults] = 
          await Promise.all(promises);
        
        setAsinData(asinResults);
        setKeywordPerformanceData(keywordPerformance);
        
        if (negativeKeywordResults) {
          setNegativeKeywords(negativeKeywordResults);
        }

        // Existing keyword recommendation code...
        if (selectedTab === 'keywordRecommendation' && campaignId && adGroupId) {
          const keywordResults = await fetchKeywordData(campaignId, adGroupId);
          setKeywordData(keywordResults);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedTab, campaignId, adGroupId]);
  
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

  // Sort and Extract Top 5
  const top5BySales = [...asinData]
    .sort((a, b) => b.dailySales - a.dailySales)
    .slice(0, 5);

  const top5BySpends = [...asinData]
    .sort((a, b) => b.dailySpends - a.dailySpends)
    .slice(0, 5);

  // Prepare Chart Data
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
      {/* Use the Sidebar component */}
      <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <div className="flex-1 p-5 overflow-auto">
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
            <div className="flex gap-4">
              <div className="w-1/2 shadow-2xl p-4 bg-white rounded-2xl mt-5 dark:bg-black">
              <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Asin Based on Spends</h2>
              <div className="flex flex-col space-y-6 ">
                <div className="flex-1 overflow-x-auto">
                  <Table className="min-w-full border border-blue-600 text-center">
                    <TableHeader className="bg-black text-white top-0 z-10">
                      <TableRow>
                        <TableHead>ASIN</TableHead>
                        <TableHead>Daily Spends</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {top5BySpends.map((asin) => (
                        <TableRow key={asin.advertisedAsin}>
                          <TableCell className="w-1/3">{asin.asin}</TableCell>
                          <TableCell className="w-1/3">{asin.dailySpends?.toLocaleString() || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <BasicPieChart 
                  series={spendsChartData.series} 
                  height={350}
                  labels={spendsChartData.labels}/>
               </div>
              </div>
              </div>

              <div className="w-1/2 shadow-2xl p-4 bg-white rounded-2xl mt-5 dark:bg-black">
              <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Asin Based on Sales</h2>
              <div className="flex flex-col space-y-6">
                <div className="flex-1 overflow-x-auto">
                  <Table className="min-w-full border border-blue-600 text-center">
                    <TableHeader className="bg-black text-white top-0 z-10">
                      <TableRow>
                        <TableHead>ASIN</TableHead>
                        <TableHead>Daily Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {top5BySales.map((asin) => (
                        <TableRow key={asin.advertisedAsin}>
                          <TableCell className="w-1/3">{asin.asin}</TableCell>
                          <TableCell className="w-1/3">{asin.dailySales?.toLocaleString() || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <BasicPieChart 
                  series={salesChartData.series} 
                  height={350}
                  labels={salesChartData.labels}/>
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
                    <TableCell className="border border-default-300">${keyword.revenue?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="border border-default-300">${keyword.spend?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="border border-default-300">{keyword.ACOS}%</TableCell>
                    <TableCell className="border border-default-300">{keyword.ROAS}</TableCell>
                    <TableCell className="border border-default-300">{keyword.clicks}</TableCell>
                    <TableCell className="border border-default-300">{keyword.impresssion?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="border border-default-300">${keyword.bid.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
        )}
        {selectedTab === 'NegativeKeyword' && (
  <div className="shadow-2xl p-4 bg-white rounded-lg dark:bg-black">
    <h2 className="text-lg font-bold">Negative Keywords</h2>
    {!campaignId ? (
      <div className="text-red-500 p-4">Campaign ID is required to load negative keywords</div>
    ) : negativeKeywords.length === 0 ? (
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
    {!campaignId || !adGroupId ? (
      <div className="text-red-500 p-4">Missing campaign ID or ad group ID</div>
    ) : keywordData.length === 0 ? (
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
                    <TableCell>${keyword.bid.toFixed(2)}</TableCell>
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
      </div>   
    </div>
    
  );
}