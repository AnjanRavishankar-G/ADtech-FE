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
import HorizontalBarChart from "../components/ui/HorizontalBarChart";
import Footer from "@/app/components/ui/footer";
import Layout from "@/app/components/ui/Layout";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import Image from "next/image";
const SalesPopup = dynamic(() => import("@/app/components/SalesPopup"), {
  ssr: false,
});

type CampaignData = {
  SN: number;
  AdGroupName: string; // from ad_group_name
  Type: string; // from ad_type
  Clicks: number; // from clicks
  Impressions: number; // from impressions
  Sales: number; // from sales
  Spend: number; // from cost
  CTR: number; // from click_through_rate
  DPV: number; // from detail_page_views
  campaignId: string; // keep for reference
  adGroupId: string; // keep for reference
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const fetchCampaignData = async (
  startDate: string | null,
  endDate: string | null,
  campaignId: string | null
) => {
  try {
    const queryParams = new URLSearchParams();

    // Always add campaignId if it exists - this is the key change
    if (campaignId) {
      queryParams.append("campaignId", campaignId.replace(".0", ""));
      console.log("Filtering by campaignId:", campaignId);
    }

    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);

    const url = `${backendURL}/report/combined_adgroup_report${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    console.log("Fetching URL:", url);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${Cookies.get("auth_token")}`,
        "Content-Type": "application/json",
        "X-ID-Token": Cookies.get("id_token") || "",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
    const data = await res.json();

    // Log the results for debugging
    console.log(`Found ${data.length} ad groups for campaign ${campaignId}`);
    return data;
  } catch (error) {
    console.error("Error fetching campaign data:", error);
    throw error;
  }
};

// Separate the main content into a new component
function AdDetailsContent() {
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Add this line
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "", direction: "desc" });
  const searchParams = useSearchParams();
  // const router = useRouter();
  const selectedBrand = searchParams.get("brand");
  const selectedCampaign = searchParams.get("campaign");
  const selectedCampaignId = searchParams.get("campaignId"); // Add this line
  // const portfolioId = searchParams.get('portfolioId');

  const [selectedSales, setSelectedSales] = useState<{
    isOpen: boolean;
    value: number;
    adGroup: string;
  }>({
    isOpen: false,
    value: 0,
    adGroup: "",
  });

  const handleSort = (columnKey: string) => {
    setSortConfig((prevConfig) => ({
      key: columnKey,
      direction:
        prevConfig.key === columnKey && prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  };

  const getSortedData = () => {
    const filteredData = campaignData.filter((adGroup) =>
      adGroup.AdGroupName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof CampaignData] ?? 0;
        const bValue = b[sortConfig.key as keyof CampaignData] ?? 0;

        if (sortConfig.direction === "asc") {
          return Number(aValue) - Number(bValue);
        }
        return Number(bValue) - Number(aValue);
      });
    }

    return filteredData;
  };

  useEffect(() => {
    async function loadData() {
      if (!selectedCampaignId) {
        setError("No campaign ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const results = await fetchCampaignData(null, null, selectedCampaignId);
        if (results.length === 0) {
          console.log(`No ad groups found for campaign: ${selectedCampaignId}`);
        }
        setCampaignData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedCampaignId]);

  // const handleBack = () => {
  //   const queryParams = new URLSearchParams();
  //   if (portfolioId) queryParams.append('portfolioId', portfolioId);
  //   if (selectedBrand) queryParams.append('brand', selectedBrand);

  //   router.push(`/campaign?${queryParams.toString()}`);
  // };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!campaignData.length)
    return <div className="text-red-500">No ad groups data available.</div>;

  // Sort by sales and pick top 5
  const topSales = [...campaignData]
    .sort((a, b) => b.Sales - a.Sales)
    .slice(0, 5);

  const salesSeries = topSales.map((adGroup) => adGroup.Sales);
  const salesLabels = topSales.map((adGroup) => adGroup.AdGroupName);

  // Extract top 5 ad groups by spend
  const topSpend = [...campaignData]
    .sort((a, b) => b.Spend - a.Spend)
    .slice(0, 5);

  // Prepare data for Pie Chart
  const spendSeries = topSpend.map((adGroup) => adGroup.Spend);
  const spendLabels = topSpend.map((adGroup) => adGroup.AdGroupName);

  return (
    <Layout>
      <div className="p-5">
        {/* Logo Header Section */}
        <div className="w-full p-0 rounded-lg bg-color:[#f1f4f5]">
          <div className="relative flex items-center justify-center w-full min-h-[40px]">
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-1">
              <Image
                src="/havells_png.png"
                alt="Havells Logo"
                width={120}
                height={35}
                priority
                className="mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Add spacing between logo and content */}
        <div className="h-[65px]"></div>

        {/* Update the page title margin */}
        <h1 className="text-2xl font-bold mb-4 text-center">Ad Groups</h1>

        {/* Update the controls container margin */}
        <div className="flex items-center gap-4 mb-4">
          {/* Brand Button */}
          <Link
            href="/brand"
            className="text-blue-600 bg-blue-50 shadow-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-300 
                        font-medium rounded-lg text-sm px-6 py-2.5 transition-all duration-200 ease-in-out
                        dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:shadow-lg"
          >
            <span className="flex items-center">
              Brand: {selectedBrand || "N/A"}
            </span>
          </Link>

          {/* Campaign Button */}
          <Link
            href={`/campaign?brand=${encodeURIComponent(
              selectedBrand || ""
            )}&campaignId=${selectedCampaignId || ""}`}
            className="text-blue-600 bg-blue-50 shadow-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-300 
                        font-medium rounded-lg text-sm px-6 py-2.5 transition-all duration-200 ease-in-out
                        dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:shadow-lg"
          >
            <span className="flex items-center">
              Campaign: {selectedCampaign || "N/A"}
            </span>
          </Link>

          {/* Search Bar */}
          <div className="relative w-[300px]">
            <input
              type="text"
              placeholder="Search ad groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-[42px] px-5 rounded-lg transition-all duration-200
                                border-blue-200 focus:border-blue-400
                                bg-white text-black placeholder-gray-600
                                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                                dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 
                                dark:border-gray-700 dark:hover:bg-gray-700/70
                                text-base font-medium shadow-md border-2`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                                         hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200
                                         transition-colors duration-200"
                title="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black mt-4">
          {/* Add an outer container with fixed height and overflow */}
          <div className="relative max-h-[600px] overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-50">
                <tr>
                  {/* Text columns - top left aligned */}
                  <th className="sticky top-0 left-0 z-[60] bg-black whitespace-nowrap px-6 pt-2 pb-6 pl-3 font-semibold text-left text-white border border-gray-700 text-base">
                    Ad Group Name
                  </th>
                  <th className="sticky top-0 bg-black whitespace-nowrap px-6 pt-2 pb-6 pl-3 font-semibold text-left text-white border border-gray-700 text-base">
                    Type
                  </th>
                  {/* Numeric columns - top right aligned */}
                  {[
                    { key: "Clicks", label: "Clicks" },
                    { key: "Impressions", label: "Impressions" },
                    { key: "Sales", label: "Sales (₹)" },
                    { key: "Spend", label: "Spend (₹)" },
                    { key: "CTR", label: "CTR (%)" },
                    { key: "DPV", label: "DPV" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="sticky top-0 bg-black whitespace-nowrap px-6 pt-2 pb-6 pr-3 font-semibold text-right text-white border border-gray-700 cursor-pointer hover:bg-gray-800 text-base"
                    >
                      <div className="flex items-start justify-end gap-1">
                        {label}
                        {sortConfig.key === key && (
                          <span className="ml-1 text-lg">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#212830] text-white">
                {getSortedData().map((adGroup) => (
                  <TableRow key={adGroup.SN} className="text-center">
                    {/* Text columns - left aligned */}
                    <td className="sticky left-0 bg-[#212830] z-40 border border-gray-700 px-6 pt-2 pb-6 pl-3 text-left whitespace-nowrap">
                      <Link
                        href={{
                          pathname: "/adGroupDetails",
                          query: {
                            brand: selectedBrand || "",
                            campaign: selectedCampaign || "",
                            adGroup: adGroup.AdGroupName,
                            adGroupId: adGroup.adGroupId,
                            campaignId: adGroup.campaignId,
                          },
                        }}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        {adGroup.AdGroupName}
                      </Link>
                    </td>
                    <td className="border border-gray-700 px-6 pt-2 pb-6 pl-3 text-left whitespace-nowrap">
                      {adGroup.Type}
                    </td>
                    {/* Numeric columns - right aligned */}
                    <td className="border border-gray-700 px-6 pt-2 pb-6 pr-3 text-right whitespace-nowrap">
                      {adGroup.Clicks.toLocaleString()}
                    </td>
                    <td className="border border-gray-700 px-6 pt-2 pb-6 pr-3 text-right whitespace-nowrap">
                      {adGroup.Impressions.toLocaleString()}
                    </td>
                    <td className="border border-gray-700 px-6 pt-2 pb-6 pr-3 text-right whitespace-nowrap">
                      {adGroup.Sales.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border border-gray-700 px-6 pt-2 pb-6 pr-3 text-right whitespace-nowrap">
                      {adGroup.Spend.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border border-gray-700 px-6 pt-2 pb-6 pr-3 text-right whitespace-nowrap">
                      {(adGroup.CTR * 100).toFixed(2)}%
                    </td>
                    <td className="border border-gray-700 px-6 pt-2 pb-6 pr-3 text-right whitespace-nowrap">
                      {adGroup.DPV.toLocaleString()}
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-12 flex gap-4 rounded-2xl">
          {/* First Top 5 Section */}
          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Top 5 Ad Groups by Sales
            </h2>
            {/* Visualization after title */}
            <div className="h-[400px] mb-6">
              <HorizontalBarChart
                series={salesSeries}
                labels={salesLabels}
                colors={["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0"]}
                height={370}
              />
            </div>
            {/* Table at bottom */}
            <div className="overflow-x-auto">
              <Table className="min-w-full border text-center">
                <TableHeader className="bg-black text-white top-0 z-10">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sales (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSales.map((adGroup) => (
                    <TableRow key={adGroup.SN}>
                      <TableCell className="w-1/2">
                        {adGroup.AdGroupName}
                      </TableCell>
                      <TableCell className="w-1/2">
                        {adGroup.Sales?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          minimumFractionDigits: 2,
                        }) || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Second Top 5 Section */}
          <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Top 5 Ad Groups by Spend
            </h2>
            {/* Visualization after title */}
            <div className="h-[400px] mb-6">
              <HorizontalBarChart
                series={spendSeries}
                labels={spendLabels}
                colors={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]}
                height={370}
              />
            </div>
            {/* Table at bottom */}
            <div className="overflow-x-auto">
              <Table className="min-w-full border text-center">
                <TableHeader className="bg-black text-white top-0 z-10">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Spend (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSpend.map((adGroup) => (
                    <TableRow key={adGroup.SN}>
                      <TableCell className="w-1/2">
                        {adGroup.AdGroupName}
                      </TableCell>
                      <TableCell className="w-1/2">
                        {adGroup.Spend?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          minimumFractionDigits: 2,
                        }) || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Footer />
        </div>
      </div>
      <SalesPopup
        isOpen={selectedSales.isOpen}
        onClose={() => setSelectedSales((prev) => ({ ...prev, isOpen: false }))}
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
