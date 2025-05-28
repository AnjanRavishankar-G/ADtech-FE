"use client";
import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useMemo,
} from "react";
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
import { useSearchParams, useRouter } from "next/navigation";
import { createAuthenticatedFetch } from "../../utils/api";
import Cookies from "js-cookie";
import CampaignOpportunities from "../components/ui/CampaignOpportunities";
import Image from "next/image";
type CampaignType = "SP" | "SB" | "SD";

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
  const selectedBrand = searchParams.get("brand");
  const portfolioId = searchParams.get("portfolioId");

  const fetchWithAuth = useMemo(() => createAuthenticatedFetch(), []);

  const [campaignType, setCampaignType] = useState<CampaignType>("SP");
  const [spCampaignData, setSpCampaignData] = useState<SPCampaignData[]>([]);
  const [sbCampaignData, setSbCampaignData] = useState<SBCampaignData[]>([]);
  const [sdCampaignData, setSDCampaignData] = useState<SDCampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCampaignData = useCallback(
    async (type: CampaignType) => {
      try {
        const queryParams = new URLSearchParams();
        if (portfolioId) {
          // Remove .0 only if it exists at the end of the string
          const cleanPortfolioId = portfolioId.endsWith(".0")
            ? portfolioId.slice(0, -2)
            : portfolioId;
          queryParams.append("portfolioId", cleanPortfolioId);
        }
        // Add brand parameter if present
        if (selectedBrand) {
          queryParams.append("brand", selectedBrand);
        }

        const endpoint = type.toLowerCase() + "_campaign";
        const url = `${backendURL}/report/${endpoint}${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        const response = await fetchWithAuth(url, {
          mode: "cors",
          credentials: "omit",
          headers: {
            Authorization: `Bearer ${Cookies.get("auth_token")}`,
            "Content-Type": "application/json",
            "X-ID-Token": Cookies.get("id_token") || "",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${type} campaign data: ${response.status}`
          );
        }

        const data = await response.json();

        switch (type) {
          case "SP":
            setSpCampaignData(data);
            break;
          case "SB":
            setSbCampaignData(data);
            break;
          case "SD":
            setSDCampaignData(data);
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${type} campaign data:`, error);
        throw error;
      }
    },
    [portfolioId, selectedBrand, fetchWithAuth]
  );

  const getTop5Campaigns = (
    type: CampaignType,
    data: CampaignDataType[],
    sortKey: string
  ) => {
    if (!data.length) return [];
    return [...data]
      .sort((a, b) => {
        const aValue =
          type === "SP"
            ? (a as SPCampaignData)[`${sortKey}30d` as keyof SPCampaignData] ||
              0
            : (a as SBCampaignData | SDCampaignData)[
                sortKey as keyof (SBCampaignData | SDCampaignData)
              ] || 0;
        const bValue =
          type === "SP"
            ? (b as SPCampaignData)[`${sortKey}30d` as keyof SPCampaignData] ||
              0
            : (b as SBCampaignData | SDCampaignData)[
                sortKey as keyof (SBCampaignData | SDCampaignData)
              ] || 0;
        return Number(bValue) - Number(aValue);
      })
      .slice(0, 5);
  };

  const CampaignTable = () => {
    const [sortConfig, setSortConfig] = useState<{
      key: string;
      direction: "asc" | "desc";
    }>({ key: "", direction: "desc" });

    const handleCampaignClick = (campaignName: string, campaignId: string) => {
      const queryParams = new URLSearchParams({
        campaign: campaignName,
        campaignId: campaignId,
        ...(selectedBrand && { brand: selectedBrand }),
        ...(portfolioId && { portfolioId: portfolioId }),
      });

      router.push(`/ad_details?${queryParams.toString()}`);
    };

    const handleSort = (columnKey: string) => {
      setSortConfig((prevConfig) => ({
        key: columnKey,
        direction:
          prevConfig.key === columnKey && prevConfig.direction === "desc"
            ? "asc"
            : "desc",
      }));
    };

    const getTableData = () => {
      const baseData = (() => {
        switch (campaignType) {
          case "SP":
            return {
              data: spCampaignData,
              columns: [
                "campaignName",
                "impressions",
                "sales30d", // Will be displayed as "Sales"
                "spend",
                "purchases30d", // Will be displayed as "Orders"
                "clicks",
                "clickThroughRate",
                "startDate",
                "endDate",
              ],
            };
          case "SB":
            return {
              data: sbCampaignData,
              columns: [
                "campaignName",
                "campaignStatus",
                "impressions",
                "cost", // Will be displayed as "Spends"
                "sales",
                "purchases", // Will be displayed as "Orders"
                "clicks",
                "detailPageViews",
                "topOfSearchImpressionShare",
                "startDate",
                "endDate",
              ],
            };
          case "SD":
            return {
              data: sdCampaignData,
              columns: [
                "campaignName",
                "campaignStatus",
                "impressions",
                "cost", // Will be displayed as "Spends"
                "sales",
                "purchases", // Will be displayed as "Orders"
                "clicks",
                "detailPageViews",
                "startDate",
                "endDate",
              ],
            };
        }
      })();

      // Filter data based on search query
      const filteredData = baseData.data.filter((row) =>
        row.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Sort data if sort config is set
      const sortedData = [...filteredData];
      if (sortConfig.key) {
        sortedData.sort((a: CampaignRow, b: CampaignRow) => {
          const aValue = a[sortConfig.key] ?? 0;
          const bValue = b[sortConfig.key] ?? 0;

          if (sortConfig.direction === "asc") {
            return Number(aValue) - Number(bValue);
          }
          return Number(bValue) - Number(aValue);
        });
      }

      return {
        ...baseData,
        data: sortedData,
      };
    };

    const formatColumnHeader = (column: string) => {
      // Special case mappings
      const specialCases: { [key: string]: string } = {
        campaignName: "Campaign Name",
        sales30d: "Sales",
        purchases30d: "Orders",
        cost: "Spends",
        purchases: "Orders",
        clickThroughRate: "Click Through Rate",
        detailPageViews: "Detail Page Views",
        topOfSearchImpressionShare: "Top Of Search Impression Share",
        campaignStatus: "Campaign Status",
        startDate: "Start Date",
        endDate: "End Date",
      };

      if (specialCases[column]) {
        return specialCases[column];
      }

      // For other columns, capitalize first letter
      return column.charAt(0).toUpperCase() + column.slice(1);
    };

    const { data, columns } = getTableData();

    // If there's no data, show a message
    if (data.length === 0) {
      return (
        <div className="shadow-2xl p-8 ml-1 bg-white rounded-2xl dark:bg-black">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              No Campaigns Found
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              This portfolio does not contain any {campaignType} campaigns.
              {selectedBrand && ` for ${selectedBrand}`}
            </p>
          </div>
        </div>
      );
    }

    const formatValue = (
      value: string | number | null | undefined,
      column: string,
      row: CampaignRow
    ) => {
      if (value === null || value === undefined) return "-";

      // Handle campaign name column with link
      if (column === "campaignName") {
        return (
          <button
            onClick={() =>
              handleCampaignClick(row.campaignName, row.campaignId)
            }
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            {value}
          </button>
        );
      }

      // Format monetary values
      if (
        [
          "cost",
          "sales14d",
          "sales30d",
          "sales1d",
          "sales7d",
          "spend",
        ].includes(column)
      ) {
        return (
          "₹" +
          Number(value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }

      // Format percentages
      if (column === "clickThroughRate") {
        return (Number(value) * 100).toFixed(2) + "%";
      }

      // Format numbers with commas
      if (typeof value === "number") {
        return value.toLocaleString("en-IN");
      }

      return value;
    };

    return (
      <div className="shadow-2xl p-4 ml-1 bg-white rounded-2xl dark:bg-black">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full border-collapse relative">
            <thead className="sticky top-0 bg-black z-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className={`
                                            text-center whitespace-nowrap px-4 py-4 font-semibold
                                            text-white border border-gray-700
                                            ${
                                              column === "campaignName"
                                                ? "sticky left-0 bg-black z-50"
                                                : "cursor-pointer hover:bg-gray-800"
                                            }
                                        `}
                    onClick={() => {
                      if (
                        column !== "campaignName" &&
                        column !== "startDate" &&
                        column !== "endDate" &&
                        column !== "campaignStatus"
                      ) {
                        handleSort(column);
                      }
                    }}
                  >
                    {formatColumnHeader(column)}
                    {sortConfig.key === column && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#212830] text-white">
              {data.map((row: CampaignRow, index) => (
                <tr key={index} className="text-center">
                  {columns.map((column) => (
                    <td
                      key={column}
                      className={`
                                                px-4 py-2 whitespace-nowrap border border-gray-700
                                                ${
                                                  column === "campaignName"
                                                    ? "sticky left-0 bg-[#212830] z-40"
                                                    : ""
                                                }
                                            `}
                    >
                      {formatValue(row[column], column, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const Top5Visualizations = () => {
    // Get appropriate data based on campaign type
    let currentData = [];
    let salesKey = "";
    let costKey = "";

    switch (campaignType) {
      case "SP":
        currentData = spCampaignData;
        salesKey = "sales30d";
        costKey = "cost";
        break;
      case "SB":
      case "SD":
        currentData = campaignType === "SB" ? sbCampaignData : sdCampaignData;
        salesKey = "sales";
        costKey = "cost";
        break;
    }

    const top5Sales = getTop5Campaigns(campaignType, currentData, salesKey);
    const top5Spend = getTop5Campaigns(campaignType, currentData, costKey);

    const salesSeries = top5Sales.map((campaign) => {
      if (campaignType === "SP") {
        return (campaign as SPCampaignData).sales30d || 0;
      }
      return (campaign as SBCampaignData | SDCampaignData).sales || 0;
    });
    const salesLabels = top5Sales.map((campaign) => campaign.campaignName);

    const spendSeries = top5Spend.map((campaign) => campaign.cost);
    const spendLabels = top5Spend.map((campaign) => campaign.campaignName);

    return (
      <div className="mt-12 flex gap-4 rounded-2xl">
        {/* Sales Section */}
        <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Top 5 Campaigns by Sales
          </h2>
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
                    <TableCell className="w-1/2">
                      {campaign.campaignName}
                    </TableCell>
                    <TableCell className="w-1/2">
                      {(campaignType === "SP"
                        ? (campaign as SPCampaignData).sales30d
                        : (campaign as SBCampaignData | SDCampaignData).sales
                      )?.toLocaleString("en-IN", {
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

        {/* Spend Section */}
        <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Top 5 Campaigns by Spend
          </h2>
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
                    <TableCell className="w-1/2">
                      {campaign.campaignName}
                    </TableCell>
                    <TableCell className="w-1/2">
                      {campaign.cost?.toLocaleString("en-IN", {
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
    );
  };

  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      if (!isSubscribed) return;

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
      <div className="p-5 ml-4">
        {/* Logo Header Section */}
        <div className="w-full p-4 rounded-lg bg-color:[#f1f4f5]">
          <div className="relative flex items-center justify-center w-full min-h-[100px]">
            {/* Left-aligned Havells logo */}
            <div className="absolute left-3 top-4">
              <Image
                src="/havells_png.png"
                alt="Havells Logo"
                width={100}
                height={30}
                priority
                className="mx-auto"
              />
            </div>

            {/* Centered Dentsu logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Image
                src="/dentsu-seeklogo.png"
                alt="Dentsu Logo"
                width={200}
                height={80}
                priority
                className="mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Campaign Controls Section */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-4 mt-6 px-2">
          {/* Brand Selection Button */}
          <Link
            href="/brand"
            className="inline-flex items-center px-6 py-2.5 bg-white text-black 
              shadow-lg hover:bg-gray-100 font-medium rounded-lg text-sm 
              transition-all duration-200 ease-in-out border border-gray-200 
              dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 
              dark:border-gray-600"
          >
            <span className="whitespace-nowrap">
              Brand: {selectedBrand || "All Brands"}
            </span>
          </Link>

          {/* Campaign Type Buttons */}
          <div className="flex gap-2">
            {(["SP", "SB", "SD"] as CampaignType[]).map((type) => (
              <button
                key={type}
                onClick={() => setCampaignType(type)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  campaignType === type
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Add Search Bar */}
          <div className="flex items-center">
            <div className="relative w-[300px]">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-[40px] px-5 rounded-lg transition-all duration-200
                                    ${
                                      campaignType
                                        ? "border-blue-200 focus:border-blue-400"
                                        : "border-gray-200"
                                    }
                                    bg-white text-black placeholder-gray-500 text-base
                                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                                    dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 
                                    dark:border-gray-700 dark:hover:bg-gray-700/70
                                    font-medium shadow-md border-2`}
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
            <div className="px-2">
              <CampaignTable />

              {/* Add Campaign Opportunities section */}
              {selectedBrand === "BLDC" && !isLoading && (
                <div className="px-2 mt-6">
                  <CampaignOpportunities />
                </div>
              )}

              {/* Only show visualizations if there's data */}
              {((campaignType === "SP" && spCampaignData.length > 0) ||
                (campaignType === "SB" && sbCampaignData.length > 0) ||
                (campaignType === "SD" && sdCampaignData.length > 0)) && (
                <Top5Visualizations />
              )}
            </div>
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
