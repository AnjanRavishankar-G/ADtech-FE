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

import Sidebar from "@/app/components/ui/sidebar"; // Import the Sidebar component
import Footer from "@/app/components/ui/footer";

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
  bid: string;
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
  id: string;
  keyword: string;
  matchType: string;
  searchTerm: string;
  cost: string;
  clicks: number;
  impressions: number;
  sales30d: string;
  purchases30d: number;
  topOfSearchImpressionShare: string;
  Source: string;
  adGroupId: string;
};

type NegativeKeyword = {
  keywordId: string;
  keywordText: string;
  matchType: string;
  adGroupId: string;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchNegativeKeywords(adGroupId: string) {
  try {
    const res = await fetch(`${backendURL}/negative_keywords`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch negative keywords");
    const data = await res.json();
    return data.filter(
      (keyword: NegativeKeyword) =>
        String(keyword.adGroupId).trim().toLowerCase() ===
        String(adGroupId).trim().toLowerCase()
    );
  } catch (error) {
    console.error("Error fetching negative keywords:", error);
    throw error;
  }
}

async function fetchAsinData(adGroupId: string) {
  try {
    const res = await fetch(`${backendURL}/get_report/asin_level_table`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch ASIN data");
    const data = await res.json();
    return data.filter(
      (asin: AsinData) =>
        String(asin.adGroupId).trim().toLowerCase() ===
        String(adGroupId).trim().toLowerCase()
    );
  } catch (error) {
    console.error("Error fetching ASIN data:", error);
    throw error;
  }
}

async function fetchKeywordData(campaignId: string, adGroupId: string) {
  try {
    const res = await fetch(
      `${backendURL}/keyword/recommendation/${campaignId}/${adGroupId}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to fetch keyword recommendations");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching keyword data:", error);
    throw error;
  }
}

async function fetchKeywordPerformance() {
  const res = await fetch(`${backendURL}/get_report/keyword_report`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
  return res.json();
}

export default function AdGroupPage({
  params,
}: {
  params: Promise<{ campaign_id: string; ad_group_id: string }>;
}) {
  const [asinData, setAsinData] = useState<AsinData[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [keywordPerformanceData, setKeywordPerformanceData] = useState<
    KeywordPerformanceData[]
  >([]);
  const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeyword[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("asin");
  useEffect(() => {
    const loadData = async () => {
      try {
        const unwrappedParams = await params;
        const { ad_group_id } = unwrappedParams;
        if (!ad_group_id) {
          setError("Ad Group ID is missing");
          setIsLoading(false);
          return;
        }
        const [asinResults, keywordPerformance, negativeKeywordResults] =
          await Promise.all([
            fetchAsinData(ad_group_id),
            fetchKeywordPerformance(),
            fetchNegativeKeywords(ad_group_id),
          ]);
        setAsinData(asinResults);
        const filteredKeywordPerformance = Array.isArray(keywordPerformance)
          ? keywordPerformance.filter((item) => item.Source === "spKeyword")
          : [];
        setKeywordPerformanceData(filteredKeywordPerformance);
        setNegativeKeywords(negativeKeywordResults);
        if (asinResults.length > 0) {
          const campaignId = asinResults[0].campaignId;
          const keywordResults = await fetchKeywordData(
            campaignId,
            ad_group_id
          );
          setKeywordData(keywordResults);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [params]);
  if (isLoading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;
  if (!asinData.length)
    return (
      <div className="p-5 text-red-500">
        No ASIN data available for this ad group
      </div>
    );

  // Sort by sales1d to get top ASINs by sales
  const topAsinBySales = [...asinData]
    .sort((a, b) => b.dailySales - a.dailySales) // Sort in descending order by sales
    .slice(0, 5); // Get top 5

  return (
    <div className="flex h-screen">
      {/* Use the Sidebar component */}
      <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <div className="flex-1 p-5 overflow-auto">
        {selectedTab === "asin" && (
          <div>
            <div className="shadow-2xl p-4 bg-white rounded-2xl  dark:bg-black">
              <h2 className="text-lg font-bold mt-6">ASIN Performance</h2>
              <Table className="border border-default-300">
                <TableHeader className="bg-black text-white sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="border border-default-300">
                      ASIN
                    </TableHead>
                    <TableHead className="border border-default-300">
                      SKU
                    </TableHead>
                    <TableHead className="border border-default-300 relative ">
                      Ad format
                    </TableHead>
                    <TableHead className="border border-default-300">
                      Campaign Status
                    </TableHead>
                    <TableHead className="border border-default-300">
                      Daily Spend
                    </TableHead>
                    <TableHead className="border border-default-300">
                      Daily sales
                    </TableHead>
                    <TableHead className="border border-default-300">
                      ACOS
                    </TableHead>
                    <TableHead className="border border-default-300">
                      ROAS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asinData.map((asin) => (
                    <TableRow key={asin.SN} className="text-center">
                      <TableCell className="border border-default-300">
                        {asin.asin}
                      </TableCell>
                      <TableCell className="border border-default-300">
                        {asin.sku}
                      </TableCell>
                      <TableCell className="border border-default-300">
                        {asin.adFormat}
                      </TableCell>
                      <TableCell className="border border-default-300">
                        {asin.campaignStatus}
                      </TableCell>
                      <TableCell className="border border-default-300">
                        {asin.dailySpends}
                      </TableCell>
                      <TableCell className="border border-default-300">
                        {asin.dailySales}
                      </TableCell>
                      <TableCell className="border border-default-300">
                        {asin.ACOS}
                      </TableCell>
                      <TableCell className="border border-default-300">
                        {asin.ROAS}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2 shadow-2xl p-4 bg-white rounded-2xl mt-5 dark:bg-black">
                <h2 className="text-2xl font-bold mb-4 mt-8 text-center">
                  Top 5 Asin Based on Spends
                </h2>
                <div className="flex space-x-10 ">
                  <div className="flex-1 overflow-x-auto">
                    <Table className="min-w-full border border-blue-600 text-center">
                      <TableHeader className="bg-black text-white top-0 z-10">
                        <TableRow>
                          <TableHead>ASIN</TableHead>
                          <TableHead>Daily Spends</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topAsinBySales.map((asin) => (
                          <TableRow key={asin.advertisedAsin}>
                            <TableCell className="w-1/3">
                              {asin.advertisedAsin}
                            </TableCell>
                            <TableCell className="w-1/3">
                              {asin.clickThroughRate}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <div className="w-1/2 shadow-2xl p-4 bg-white rounded-2xl mt-5 dark:bg-black">
                <h2 className="text-2xl font-bold mb-4 mt-8 text-center">
                  Top 5 Asin Based on Sales
                </h2>
                <div className="flex space-x-10 ">
                  <div className="flex-1 overflow-x-auto">
                    <Table className="min-w-full border border-blue-600 text-center">
                      <TableHeader className="bg-black text-white top-0 z-10">
                        <TableRow>
                          <TableHead>ASIN</TableHead>
                          <TableHead>Daily Sales</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topAsinBySales.map((asin) => (
                          <TableRow key={asin.advertisedAsin}>
                            <TableCell className="w-1/3">
                              {asin.advertisedAsin}
                            </TableCell>
                            <TableCell className="w-1/3">
                              {asin.clicks}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedTab === "keywordPerformance" && (
          <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black">
            <h2 className="text-lg font-bold mt-6">Keyword Performance</h2>
            <Table className="border border-default-300">
              <TableHeader className="bg-black text-white sticky top-0 z-10">
                <TableRow>
                  <TableHead className="border border-default-300">
                    Keyword
                  </TableHead>
                  <TableHead className="border border-default-300">
                    Match Type
                  </TableHead>
                  <TableHead className="border border-default-300">
                    Revenue
                  </TableHead>
                  <TableHead className="border border-default-300">
                    Spend
                  </TableHead>
                  <TableHead className="border border-default-300">
                    ACOS
                  </TableHead>
                  <TableHead className="border border-default-300">
                    ROAS
                  </TableHead>
                  <TableHead className="border border-default-300">
                    Clicks
                  </TableHead>
                  <TableHead className="border border-default-300">
                    Impressions
                  </TableHead>
                  <TableHead className="border border-default-300">
                    Bid
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywordPerformanceData.map((item) => (
                  <TableRow key={item.id} className="text-center">
                    <TableCell className="border border-default-300">
                      {item.keyword}
                    </TableCell>
                    <TableCell className="border border-default-300">
                      {item.matchType}
                    </TableCell>
                    <TableCell className="border border-default-300">
                      {item.clicks}
                    </TableCell>
                    <TableCell className="border border-default-300">
                      100
                    </TableCell>
                    <TableCell className="border border-default-300">
                      --
                    </TableCell>
                    <TableCell className="border border-default-300">
                      --
                    </TableCell>
                    <TableCell className="border border-default-300">
                      {item.impressions}
                    </TableCell>
                    <TableCell className="border border-default-300">
                      {item.impressions}
                    </TableCell>
                    <TableCell className="border border-default-300">
                      {item.impressions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {selectedTab === "NegativeKeyword" && (
          <div className="shadow-2xl p-4 bg-white rounded-lg dark:bg-black">
            <h2 className="text-lg font-bold">Negative Keywords</h2>
            <Table className="border border-default-300">
              <TableHeader className="bg-black text-white sticky top-0 z-10">
                <TableRow>
                  <TableHead className="border border-default-300">
                    Keyword ID
                  </TableHead>
                  <TableHead className="border border-default-300">
                    Keyword
                  </TableHead>
                  <TableHead className="border border-default-300">
                    Match Type
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {negativeKeywords.map((keyword) => (
                  <TableRow key={keyword.keywordId} className="text-center">
                    <TableCell className="border border-default-300">
                      {keyword.keywordId}
                    </TableCell>
                    <TableCell className="border border-default-300">
                      {keyword.keywordText}
                    </TableCell>
                    <TableCell className="border border-default-300">
                      {keyword.matchType}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {selectedTab === "keywordRecommendation" && (
          <div>
            <h2 className="text-lg font-bold mt-6">Keyword Recommendations</h2>
            {["BROAD", "EXACT", "PHRASE"].map((matchType) => {
              const filteredKeywords = keywordData.filter(
                (keyword) => keyword.match_type === matchType
              );
              return (
                filteredKeywords.length > 0 && (
                  <div
                    key={matchType}
                    className="shadow-2xl p-4 bg-white rounded-2xl mt-4 dark:bg-black"
                  >
                    <h3 className="text-md font-semibold">{matchType} Match</h3>
                    <Table className="border border-default-300">
                      <TableHeader className="bg-black text-white sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="border border-default-300">
                            Keyword
                          </TableHead>
                          <TableHead className="border border-default-300">
                            Rank
                          </TableHead>
                          <TableHead className="border border-default-300">
                            For
                          </TableHead>
                          <TableHead className="border border-default-300">
                            Bids
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredKeywords.map((keyword, index) => (
                          <TableRow key={index} className="text-center">
                            <TableCell className="border border-default-300">
                              {keyword.keyword}
                            </TableCell>
                            <TableCell className="border border-default-300">
                              {keyword.rank}
                            </TableCell>
                            <TableCell className="border border-default-300">
                              {keyword.theme}
                            </TableCell>
                            <TableCell className="border border-default-300">
                              {keyword.bid}
                            </TableCell>
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
