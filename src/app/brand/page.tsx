"use client";
import "@/css/brand.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../components/ui/footer";

import Layout from "../components/ui/Layout";
import { createAuthenticatedFetch } from "@/utils/api";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";
// import CampaignOpportunities from "../components/ui/CampaignOpportunities";

type PortfolioData = {
  id: number;
  portfolio_id: number;
  name: string;
  state: string;
  Budget: string;
  Budget_start: string;
  Budget_end: string;
  Impressions: number;
  Clicks: number;
  CTR: string;
  Spend: string;
  CPC: string;
  Orders: number;
  Sales: string;
  ACOS: string;
  ROAS: string;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchPortfolioData() {
  const fetchWithAuth = createAuthenticatedFetch();
  try {
    console.log("Fetching portfolio data...");
    const userRole = Cookies.get("id_token");

    const response = await fetchWithAuth(
      `${backendURL}/report/Portfolios_Data`,
      {
        mode: "cors",
        credentials: "omit",
        headers: {
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
          "Content-Type": "application/json",
          "X-ID-Token": userRole || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio data: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return the data as-is, remove the mapping with hardcoded PORTFOLIO_ID
  } catch (error) {
    console.error("Error in fetchPortfolioData:", error);
    throw error;
  }
}

const BrandTargetTables = () => {
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "desc",
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchPortfolioData();
        setPortfolioData(data);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        if (
          err instanceof Error &&
          err.message.includes("No authentication token found")
        ) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

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
    const sortedData = [...portfolioData];

    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof PortfolioData] ?? 0;
        const bValue = b[sortConfig.key as keyof PortfolioData] ?? 0;

        if (sortConfig.direction === "asc") {
          return Number(aValue) - Number(bValue);
        }
        return Number(bValue) - Number(aValue);
      });
    }

    return sortedData;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="p-3">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-2">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="p-3">
            {/* Updated logo container with reduced height and padding */}
            <div className="w-full p-2 rounded-lg bg-color:[#f1f4f5] mb-2">
              <div className="relative flex items-center justify-center w-full min-h-[60px]">
                {/* Adjusted Havells logo size and position */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <Image
                    src="/havells_png.png"
                    alt="Havells Logo"
                    width={110}
                    height={30}
                    priority
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>

            <div className="p-2">
              {" "}
              {/* Reduced padding */}
              {/* Hide the heading */}
              <h1 className={`text-xl font-bold mb-7 text-center hidden`}>
                Brands
              </h1>
              {/* Hide the flex container */}
              <div
                className={`hidden flex flex-col md:flex-row flex-wrap justify-start gap-5 bg-[#f8f9fa] dark:bg-[#1e1e1e] rounded-2xl`}
              ></div>
              {/* Updated table container with reduced top margin */}
              <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black mt-1">
                <div className="relative max-h-[75vh] overflow-auto">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-50">
                      <tr>
                        <th className="sticky top-0 left-0 z-[60] bg-black whitespace-nowrap px-8 py-4 font-semibold text-white border border-gray-700 text-base h-[60px] min-w-[250px]">
                          Name
                        </th>
                        <th className="sticky top-0 bg-black whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 text-base h-[60px]">
                          State
                        </th>
                        {(
                          [
                            { key: "Budget", label: "Budget (₹)" },
                            { key: "Impressions", label: "Impressions" },
                            { key: "Clicks", label: "Clicks" },
                            { key: "CTR", label: "CTR (%)" },
                            { key: "Spend", label: "Spend (₹)" },
                            { key: "CPC", label: "CPC (₹)" },
                            { key: "Orders", label: "Orders" },
                            { key: "Sales", label: "Sales (₹)" },
                            { key: "ACOS", label: "ACOS (%)" },
                            { key: "ROAS", label: "ROAS" },
                          ] as const
                        ).map(({ key, label }) => (
                          <th
                            key={key}
                            onClick={() => handleSort(key)}
                            className="sticky top-0 bg-black whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 cursor-pointer hover:bg-gray-800 text-base h-[60px]"
                          >
                            <div className="flex items-center justify-center gap-1">
                              {label}
                              {sortConfig.key === key && (
                                <span className="ml-1 text-lg">
                                  {sortConfig.direction === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="sticky top-0 bg-black whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 text-base h-[60px]">
                          Budget Start
                        </th>
                        <th className="sticky top-0 bg-black whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 text-base h-[60px]">
                          Budget End
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#212830] text-white">
                      {getSortedData().map((portfolio) => (
                        <tr key={portfolio.id}>
                          <td className="sticky left-0 bg-[#212830] z-40 border border-gray-700 px-4 py-2 whitespace-nowrap min-w-[250px]">
                            <Link
                              href={`/campaign?brand=${encodeURIComponent(
                                portfolio.name
                              )}&portfolioId=${encodeURIComponent(
                                portfolio.portfolio_id
                              )}`}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            >
                              {portfolio.name}
                            </Link>
                          </td>
                          <td>{portfolio.state || "-"}</td>
                          <td>
                            {Number(portfolio.Budget)?.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 2,
                            }) || "-"}
                          </td>
                          <td>
                            {portfolio.Impressions?.toLocaleString() || "-"}
                          </td>
                          <td>{portfolio.Clicks?.toLocaleString() || "-"}</td>
                          <td>{(Number(portfolio.CTR) * 100).toFixed(2)}%</td>
                          <td>
                            {Number(portfolio.Spend)?.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 2,
                            }) || "-"}
                          </td>
                          <td>
                            {Number(portfolio.CPC)?.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 2,
                            }) || "-"}
                          </td>
                          <td>{portfolio.Orders?.toLocaleString() || "-"}</td>
                          <td>
                            {Number(portfolio.Sales)?.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 2,
                            }) || "-"}
                          </td>
                          <td>{(Number(portfolio.ACOS) * 100).toFixed(2)}%</td>
                          <td>{Number(portfolio.ROAS).toFixed(2)}</td>
                          <td>{portfolio.Budget_start || "-"}</td>
                          <td>{portfolio.Budget_end || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Add Campaign Opportunities section */}
              {/* <CampaignOpportunities /> */}
              <div>
                <Footer />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrandTargetTables;
