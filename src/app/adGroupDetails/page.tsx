"use client";
import React, { useState, useEffect } from "react";
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
  SN: number;
  keyword: string;
  keyword_rank: number;
  keyword_for: string;
  bids: number;
  match_type: string;
  rank: number;
  theme: string;
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
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Fixed function - removed unused parameter
async function fetchNegativeKeywords() {
  try {
    const res = await fetch(`${backendURL}/report/negative_keyword`, { 
      cache: "no-store",
      headers: {
        'Authorization':  process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
        'Content-Type': 'application/json'
      }      
     });
    if (!res.ok) throw new Error("Failed to fetch negative keywords");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching negative keywords:", error);
    throw error;
  }
}

// Fixed function - removed unused parameter
async function fetchAsinData() {
  try {
    const res = await fetch(`${backendURL}/report/asin_level_table`, { 
      cache: "no-store",
      headers: {
        'Authorization':  process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
        'Content-Type': 'application/json'
      }
     });
    if (!res.ok) throw new Error("Failed to fetch ASIN data");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching ASIN data:", error);
    throw error;
  }
}

// Fixed function - removed unused parameters
async function fetchKeywordData() {
  try {
    const res = await fetch(`${backendURL}/report/keyword_recommendation`, { 
      cache: "no-store",
      headers: {
        'Authorization' : process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
        'Content-Type': 'application/json'
      }
     });
    if (!res.ok) throw new Error("Failed to fetch keyword recommendations");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching keyword data:", error);
    throw error;
  }
}

async function fetchKeywordPerformance() {
  const res = await fetch(`${backendURL}/report/targeting_level_table`, { 
    cache: "no-store",
    headers: {
      'Authorization':  process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
      'Content-Type': 'application/json'
    }
   });
  if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
  return res.json();
}

export default function AdGroupPage() {
  // Default values for adGroupId and campaignId
  // const DEFAULT_AD_GROUP_ID = "123456789"; 
  // const DEFAULT_CAMPAIGN_ID = "987654321"; 
  
  const [asinData, setAsinData] = useState<AsinData[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [keywordPerformanceData, setKeywordPerformanceData] = useState<KeywordPerformanceData[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('asin');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Note: We're not using adGroupId in the fetch calls anymore,
        // but we'll keep it for potential future use
        // const adGroupId = DEFAULT_AD_GROUP_ID;
        
        const [asinResults, keywordPerformance, negativeKeywordResults] = await Promise.all([
          fetchAsinData(),
          fetchKeywordPerformance(),
          fetchNegativeKeywords(),
        ]);
        
        setAsinData(asinResults);
        setKeywordPerformanceData(keywordPerformance);
        setNegativeKeywords(negativeKeywordResults);
        
        // Use the campaign ID from asin data if available, otherwise use default
        // We're not using these IDs in the fetch call anymore, but keeping them for potential future use
        // const campaignId = asinResults.length > 0 ? asinResults[0].campaignId : DEFAULT_CAMPAIGN_ID;
        const keywordResults = await fetchKeywordData();
        setKeywordData(keywordResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (isLoading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;
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
                    <TableCell className="border border-default-300">{keyword.matchType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {selectedTab === 'keywordRecommendation' && (
  <div>
    <h2 className="text-lg font-bold mt-6">Keyword Recommendations</h2>
    {['BROAD', 'EXACT', 'PHRASE'].map((matchType) => {
      const filteredKeywords = keywordData.filter((keyword) => keyword.match_type === matchType);
          return (
            filteredKeywords.length > 0 && (
              <div key={matchType} className="shadow-2xl p-4 bg-white rounded-2xl mt-4 dark:bg-black">
                <h3 className="text-md font-semibold">{matchType} Match</h3>
                <Table className="border border-default-300">
                  <TableHeader className="bg-black text-white sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="border border-default-300">Keyword</TableHead>
                      <TableHead className="border border-default-300">Rank</TableHead>
                      <TableHead className="border border-default-300">For</TableHead>
                      <TableHead className="border border-default-300">Bids</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeywords.map((keyword, index) => (
                      <TableRow key={index} className="text-center">
                        <TableCell className="border border-default-300">{keyword.keyword}</TableCell>
                        <TableCell className="border border-default-300">{keyword.keyword_rank}</TableCell>
                        <TableCell className="border border-default-300">{keyword.keyword_for}</TableCell>
                        <TableCell className="border border-default-300">{keyword.bids}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          );
        })}
           
      </div> 
    )} 
      <div className="mt-32">
       <Footer />  
      </div>
      </div>   
    </div>
    
  );
}