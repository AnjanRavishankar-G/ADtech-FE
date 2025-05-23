"use client";
import { useState, useEffect, Suspense } from "react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";
import Image from "next/image";
import Footer from "@/app/components/ui/footer";
import MainSidebar from "../components/ui/mainsidebar";
import HorizontalBarChart from "../components/ui/HorizontalBarChart";

type KeywordPerformanceData = {
    keyword: string;
    matchType: string;
    impressions: number;
    spend: number;
    sales1d: number;
    sales7d: number;
    sales14d: number;
    sales30d: number;
    cpc: number;
    clicks: number;
    bid: number;
    purchases1d: number;
    purchases7d: number;
    purchases14d: number;
    purchases30d: number;
    roas7d: number | null;
    roas14d: number | null;
    acos7d: number | null;
    acos14d: number | null;
};

type SortableKeywordFields = keyof KeywordPerformanceData;

type NegativeKeyword = {
    keywordID: string;
    keyword: string;
    matchType: string;
    adGroupId: string;
    campaignId: string;
    state: string;
};

type NegativeKeywordResponse = {
    keywordId: string;
    keywordText: string;
    matchType: string;
    adGroupId: string;
    campaignId: string;
    state: string;
};

type SPAdData = {
    endDate: string;
    product_name: string;  // Add this
    price: number;   
    unitsSoldClicks1d: number;
    sales1d: number;
    sales7d: number;
    adGroupId: string;
    spend: number;
    purchasesSameSku1d: number;
    campaignStatus: string;
    advertisedSku: string;
    advertisedAsin: string;
    purchases1d: number;
    purchases7d: number;
    cost: number;
    adGroupName: string;
    acosClicks7d: number;
    campaignId: string;
    sales14d: number;
    sales30d: number;
    clickThroughRate: number;
    impressions: number;
    adId: string;
    portfolioId: string;
    clicks: number;
    campaignName: string;
    startDate: string;
    roasClicks7d: number;
    created_at: string;
};

type KeywordRecommendation = {
    keyword: string;
    theme: string;
    match_type: string;
    rank: number;
    bid: number;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

function getRequiredHeaders() {
    const idToken = Cookies.get("id_token");
    const authToken = Cookies.get("auth_token");

    if (!idToken) {
        console.error("Missing id_token");
        window.location.href = "/";
        throw new Error("Authentication token not found. Please login again.");
    }

    console.log("Tokens found:", {
        authToken: !!authToken,
        idToken: !!idToken,
    });

    return {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
    };
}

async function fetchNegativeKeywords(campaignId: string) {
    try {
        const res = await fetch(
            `${backendURL}/negative-keywords?campaignId=${campaignId}`,
            {
                cache: "no-store",
                headers: getRequiredHeaders(),
            }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch negative keywords");
        }

        const data = await res.json();

        return data.negativeKeywords.map((kw: NegativeKeywordResponse) => ({
            keywordID: kw.keywordId,
            keyword: kw.keywordText,
            matchType: kw.matchType,
            adGroupId: kw.adGroupId,
            campaignId: kw.campaignId,
            state: kw.state,
        }));
    } catch (error) {
        console.error("Error fetching negative keywords:", error);
        throw error;
    }
}

async function fetchKeywordPerformance(campaignId: string, adGroupId: string) {
    try {
        const queryParams = new URLSearchParams({
            campaignId: campaignId.replace(".0", ""),
            "Ad Group ID": adGroupId.replace(".0", ""),
        });

        const res = await fetch(
            `${backendURL}/report/sp_1_targeting?${queryParams}`,
            {
                cache: "no-store",
                headers: getRequiredHeaders(),
            }
        );

        if (!res.ok) throw new Error("Failed to fetch targeting data");
        const data = await res.json();

        // Fix 1: Specify type instead of 'any'
        return data.map((item: Record<string, unknown>) => ({
            keyword: item.keyword || item.targeting || "-",
            matchType: item.matchType || item.keywordType || "-",
            impressions: Number(item.impressions) || 0,
            spend: Number(item.cost) || 0,
            sales1d: Number(item.sales1d) || 0,
            sales7d: Number(item.sales7d) || 0,
            sales14d: Number(item.sales14d) || 0,
            sales30d: Number(item.sales30d) || 0,
            cpc: Number(item.costPerClick) || 0,
            clicks: Number(item.clicks) || 0,
            bid: Number(item.keywordBid) || 0,
            purchases1d: Number(item.purchases1d) || 0,
            purchases7d: Number(item.purchases7d) || 0,
            purchases14d: Number(item.purchases14d) || 0,
            purchases30d: Number(item.purchases30d) || 0,
            roas7d: item.roasClicks7d ? Number(item.roasClicks7d) : null,
            roas14d: item.roasClicks14d ? Number(item.roasClicks14d) : null,
            acos7d: item.acosClicks7d ? Number(item.acosClicks7d) : null,
            acos14d: item.acosClicks14d ? Number(item.acosClicks14d) : null,
        }));
    } catch (error) {
        console.error("Error fetching targeting data:", error);
        throw error;
    }
}

async function fetchSPAdData(campaignId: string, adGroupId: string) {
    try {
        const queryParams = new URLSearchParams({
            campaignId: campaignId.replace(".0", ""),
            adGroupId: adGroupId.replace(".0", ""), // Make sure this matches the backend parameter name
        });

        const res = await fetch(
            `${backendURL}/report/sp_ad_details?${queryParams}`,
            {
                cache: "no-store",
                headers: getRequiredHeaders(),
            }
        );

        if (!res.ok) throw new Error("Failed to fetch SP ad data");
        const data = await res.json();
        console.log("SP Ad Data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching SP ad data:", error);
        throw error;
    }
}

// Update the fetchKeywordRecommendations function
async function fetchKeywordRecommendations(campaignId: string, adGroupId: string) {
    try {
        // Remove .0 from IDs if present
        const cleanCampaignId = campaignId.replace(".0", "");
        const cleanAdGroupId = adGroupId.replace(".0", "");

        // Use path parameters instead of query parameters
        const res = await fetch(
            `${backendURL}/keyword-recommendation/${cleanCampaignId}/${cleanAdGroupId}`,
            {
                cache: "no-store",
                headers: getRequiredHeaders(),
            }
        );

        if (!res.ok) throw new Error("Failed to fetch keyword recommendations");
        const data = await res.json();
        return data.keywords || []; // Extract keywords array from response
    } catch (error) {
        console.error("Error fetching keyword recommendations:", error);
        throw error;
    }
}

const checkAuthentication = () => {
    const idToken = Cookies.get("id_token");
    const authToken = Cookies.get("auth_token");

    if (!idToken || !authToken) {
        console.error("Missing tokens:", {
            hasIdToken: !!idToken,
            hasAuthToken: !!authToken,
        });

        if (window.location.pathname !== "/") {
            window.location.href = "/";
        }
        return false;
    }
    return true;
};

function getTableType(campaignName: string): string {
    const name = campaignName.toLowerCase();
    if (name.includes("brand")) return "Brand";
    if (name.includes("generic") || name.includes("broad")) return "Generic";
    if (
        name.includes("comp") ||
        name.includes("competition") ||
        name.includes("comppt") ||
        name.includes("compkws") ||
        name.includes("compkw")
    )
        return "Comp";
    return "Comp"; // Default to Comp if no match
}

function AdGroupContent() {
    const [collapsed, setCollapsed] = useState(false);
    const [keywordPerformanceData, setKeywordPerformanceData] = useState<
        KeywordPerformanceData[]
    >([]);
    const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeyword[]>(
        []
    );
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>("asin");
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isDataReady, setIsDataReady] = useState(false);
    const [spAdData, setSpAdData] = useState<SPAdData[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [top5Sales, setTop5Sales] = useState<SPAdData[]>([]);
    const [top5Spend, setTop5Spend] = useState<SPAdData[]>([]);
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: "asc" | "desc";
    }>({ key: "", direction: "desc" });
    const [keywordSortConfig, setKeywordSortConfig] = useState<{
        key: SortableKeywordFields;
        direction: "asc" | "desc";
    }>({ key: "keyword", direction: "desc" });
    const [recommendations, setRecommendations] = useState<KeywordRecommendation[]>(
        []
    );

    // Add this new state for negative keywords loading
    const [isNegativeKeywordsLoading, setIsNegativeKeywordsLoading] = useState(true);

    const searchParams = useSearchParams();
    const selectedBrand = searchParams.get("brand");
    const selectedCampaign = searchParams.get("campaign");
    const selectedAdGroup = searchParams.get("adGroup");

    const handleSort = (columnKey: string) => {
        setSortConfig((prevConfig) => ({
            key: columnKey,
            direction:
                prevConfig.key === columnKey && prevConfig.direction === "desc"
                    ? "asc"
                    : "desc",
        }));
    };

    const handleKeywordSort = (columnKey: SortableKeywordFields) => {
        setKeywordSortConfig((prevConfig) => ({
            key: columnKey,
            direction:
                prevConfig.key === columnKey && prevConfig.direction === "desc"
                    ? "asc"
                    : "desc",
        }));
    };

    const getSortedData = () => {
        const filteredData = spAdData.filter((ad) =>
            ad.advertisedAsin.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ad.product_name && ad.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof SPAdData] ?? 0;
                const bValue = b[sortConfig.key as keyof SPAdData] ?? 0;

                // Special handling for text fields
                if (sortConfig.key === "product_name" || sortConfig.key === "advertisedAsin") {
                    return sortConfig.direction === "asc"
                        ? String(aValue).localeCompare(String(bValue))
                        : String(bValue).localeCompare(String(aValue));
                }

                // Handle percentage values
                if (sortConfig.key === "clickThroughRate" || sortConfig.key === "acosClicks7d") {
                    return sortConfig.direction === "asc"
                        ? Number(aValue || 0) - Number(bValue || 0)
                        : Number(bValue || 0) - Number(aValue || 0);
                }

                // Handle numeric values
                return sortConfig.direction === "asc"
                    ? Number(aValue || 0) - Number(bValue || 0)
                    : Number(bValue || 0) - Number(aValue || 0);
            });
        }

        return filteredData;
    };

    const getSortedKeywordData = () => {
        // Fix 2: Use 'const' instead of 'let' for filteredData
        const filteredData = keywordPerformanceData.filter((kw) =>
            kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (keywordSortConfig.key) {
            filteredData.sort((a, b) => {
                const aValue = a[keywordSortConfig.key];
                const bValue = b[keywordSortConfig.key];

                if (typeof aValue === "number" && typeof bValue === "number") {
                    return keywordSortConfig.direction === "asc"
                        ? aValue - bValue
                        : bValue - aValue;
                }

                // Handle string comparison
                const aString = String(aValue || "");
                const bString = String(bValue || "");
                return keywordSortConfig.direction === "asc"
                    ? aString.localeCompare(bString)
                    : bString.localeCompare(aString);
            });
        }

        return filteredData;
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsInitialLoad(true);

                const campaignId = searchParams.get("campaignId");
                const adGroupId = searchParams.get("adGroupId");

                if (!campaignId || !adGroupId) {
                    throw new Error("Missing campaign ID or ad group ID");
                }

                const [spData, keywordPerformance] = await Promise.all([
                    fetchSPAdData(campaignId, adGroupId),
                    fetchKeywordPerformance(campaignId, adGroupId),
                ]);

                setSpAdData(spData);
                setKeywordPerformanceData(keywordPerformance);
                setTop5Sales(
                    spData
                        .filter((ad: SPAdData) => ad.sales30d)
                        .sort((a: SPAdData, b: SPAdData) => b.sales30d - a.sales30d)
                        .slice(0, 5)
                );
                setTop5Spend(
                    spData
                        .filter((ad: SPAdData) => ad.spend)
                        .sort((a: SPAdData, b: SPAdData) => b.spend - a.spend)
                        .slice(0, 5)
                );
                setIsDataReady(true);
            } catch (err) {
                console.error("Error loading initial data:", err);
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setIsInitialLoad(false);
            }
        };

        loadInitialData();
    }, [searchParams]);

    // Modify the loadTabData function to handle loading state
    useEffect(() => {
        const loadTabData = async () => {
            if (!checkAuthentication()) return;

            try {
                if (selectedTab === "NegativeKeyword") {
                    setIsNegativeKeywordsLoading(true);
                    const campaignId = searchParams.get("campaignId");
                    if (!campaignId) {
                        throw new Error("Missing campaign ID");
                    }
                    const negativeKeywordResults = await fetchNegativeKeywords(
                        campaignId
                    );
                    setNegativeKeywords(negativeKeywordResults);
                } else if (selectedTab === "KeywordRecommendation") {
                    const campaignId = searchParams.get("campaignId");
                    const adGroupId = searchParams.get("adGroupId");
                    if (!campaignId || !adGroupId) {
                        throw new Error("Missing campaign ID or ad group ID");
                    }
                    const recommendationResults = await fetchKeywordRecommendations(
                        campaignId,
                        adGroupId
                    );
                    setRecommendations(recommendationResults);
                }
            } catch (err) {
                console.error("Error loading tab data:", err);
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setIsNegativeKeywordsLoading(false);
            }
        };

        loadTabData();
    }, [selectedTab, searchParams]);

    if (isInitialLoad || !isDataReady) {
        return <div className="p-5">Loading...</div>;
    }

    if (error) {
        return (
            <div className="p-5">
                <div className="text-red-500">Error: {error}</div>
                <button
                    onClick={() => (window.location.href = "/")}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <MainSidebar
                collapsed={collapsed}
                toggleSidebar={() => setCollapsed(!collapsed)}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />
            <main
                className={`flex-1 p-5 overflow-auto transition-all duration-300 ${
                    collapsed ? "ml-16" : "ml-64"
                }`}
            >
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

                {/* Rest of your existing content */}
                <div className="flex items-center gap-4 mb-4 mt-4">
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
                    <Link
                        href={`/campaign?brand=${encodeURIComponent(
                            selectedBrand || ""
                        )}`}
                        className="text-blue-600 bg-blue-50 shadow-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-300 
            font-medium rounded-lg text-sm px-6 py-2.5 transition-all duration-200 ease-in-out
            dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:shadow-lg"
                    >
                        <span className="flex items-center">
                            Campaign: {selectedCampaign || "N/A"}
                        </span>
                    </Link>
                    <Link
                        href={`/ad_details?brand=${encodeURIComponent(
                            selectedBrand || ""
                        )}&campaign=${encodeURIComponent(
                            selectedCampaign || ""
                        )}&campaignId=${searchParams.get("campaignId") || ""}`}
                        className="text-blue-600 bg-blue-50 shadow-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-300 
            font-medium rounded-lg text-sm px-6 py-2.5 transition-all duration-200 ease-in-out
            dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:shadow-lg"
                    >
                        <span className="flex items-center">
                            AdGroup: {selectedAdGroup || "N/A"}
                        </span>
                    </Link>

                    {/* Add Back to Ad Performance button - only show when not on asin tab */}
                    {selectedTab !== "asin" && (
                        <button
                            onClick={() => setSelectedTab("asin")}
                            className="text-blue-600 bg-blue-50 shadow-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-300 
                                font-medium rounded-lg text-sm px-6 py-2.5 transition-all duration-200 ease-in-out
                                dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:shadow-lg"
                        >
                            <span className="flex items-center">
                                Asin Table
                            </span>
                        </button>
                    )}

                    {/* Add Search Bar */}
                    <div className="relative w-[300px]">
                        <input
                            type="text"
                            placeholder={
                                selectedTab === "asin"
                                    ? "Search by ASIN or Product Name..."
                                    : selectedTab === "keywordPerformance"
                                    ? "Search keywords..."
                                    : selectedTab === "NegativeKeyword"
                                    ? "Search keywords..."
                                    : selectedTab === "KeywordRecommendation"
                                    ? "Search keywords..."
                                    : ""
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-[40px] px-5 rounded-lg transition-all duration-200
                                border-blue-200 focus:border-blue-400
                                bg-white text-black placeholder-gray-500 text-base
                                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                                dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 
                                dark:border-gray-700 dark:hover:bg-gray-700/70
                                font-medium shadow-md border-2"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                                        hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
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
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {selectedTab === "asin" && (
                    <div>
                        <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black dark:text-white dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
                            <h2 className="text-2xl font-bold mb-8 text-center">
                                Asin Performance
                            </h2>
                            <div className="relative">
                                <div className="max-h-[600px] overflow-auto">
                                    <table className="w-full border-collapse relative">
                                        <thead className="sticky top-0 bg-black z-50">
                                            <tr>
                                                <th className="sticky top-0 left-0 z-50 bg-black whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700">
                                                    Product Name
                                                </th>
                                                {[
                                                    { key: "price", label: "Price (₹)" },
                                                    { key: "impressions", label: "Impressions" },
                                                    { key: "spend", label: "Spend" },
                                                    { key: "sales30d", label: "Sales" },
                                                    { key: "purchases7d", label: "Orders" },
                                                    { key: "clicks", label: "Clicks" },
                                                    { key: "clickThroughRate", label: "CTR" },
                                                    { key: "acosClicks7d", label: "ACOS" },
                                                    { key: "advertisedAsin", label: "Advertised ASIN" }
                                                ].map(({ key, label }) => (
                                                    <th
                                                        key={key}
                                                        onClick={() => handleSort(key)}
                                                        className="z-30 whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 bg-black cursor-pointer hover:bg-gray-800"
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            {label}
                                                            {sortConfig.key === key && (
                                                                <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[#212830] text-white">
                                            {getSortedData().map((ad) => (
                                                <tr key={ad.adId} className="text-center">
                                                    <td 
                                                        className="sticky left-0 z-40 bg-[#212830] border border-gray-700 px-4 py-2 whitespace-nowrap"
                                                        title={ad.product_name} // This enables hover tooltip
                                                    >
                                                        {ad.product_name 
                                                            ? ad.product_name.split(' ').slice(0, 7).join(' ') + (ad.product_name.split(' ').length > 7 ? '...' : '')
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {ad.price?.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR',
                                                            minimumFractionDigits: 2
                                                        }) || '-'}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {ad.impressions?.toLocaleString()}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {ad.spend?.toLocaleString()}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {ad.sales30d?.toLocaleString()}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {ad.purchases7d}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {ad.clicks}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {`${Number(ad.clickThroughRate || 0).toFixed(2)}%`}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {`${Number(ad.acosClicks7d || 0).toFixed(2)}%`}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {ad.advertisedAsin}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Add after the main ASIN table */}
                        <div className="mt-12 flex gap-4 rounded-2xl">
                            {/* Top 5 by Sales Section */}
                            <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-20px_-10px_30px_6px_rgba(0,0,0,0.1),_15px_10px_30px_6px_rgba(45,78,255,0.15)]">
                                <h2 className="text-2xl font-bold mb-6 text-center">
                                    Top 5 ASINs by Sales
                                </h2>
                                <div className="h-[400px] mb-6">
                                    <HorizontalBarChart
                                        series={top5Sales.map(
                                            (ad) => Number(ad.sales30d) || 0
                                        )}
                                        labels={top5Sales.map(
                                            (ad) => ad.advertisedAsin
                                        )}
                                        colors={[
                                            "#F44336",
                                            "#2196F3",
                                            "#4CAF50",
                                            "#FFC107",
                                            "#9C27B0",
                                        ]}
                                        height={370}
                                    />
                                </div>
                                <div className="overflow-x-auto">
                                    <Table className="min-w-full border text-center">
                                        <TableHeader className="bg-black text-white top-0 z-10">
                                            <TableRow>
                                                <TableHead>ASIN</TableHead>
                                                <TableHead>Sales (₹)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {top5Sales.map((ad) => (
                                                <TableRow key={ad.adId}>
                                                    <TableCell className="w-1/2">
                                                        {ad.advertisedAsin}
                                                    </TableCell>
                                                    <TableCell className="w-1/2">
                                                        {Number(
                                                            ad.sales30d
                                                        )?.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                style: "currency",
                                                                currency: "INR",
                                                                minimumFractionDigits: 2,
                                                            }
                                                        ) || "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Top 5 by Spend Section */}
                            <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
                                <h2 className="text-2xl font-bold mb-6 text-center">
                                    Top 5 ASINs by Spend
                                </h2>
                                <div className="h-[400px] mb-6">
                                    <HorizontalBarChart
                                        series={top5Spend.map(
                                            (ad) => Number(ad.spend) || 0
                                        )}
                                        labels={top5Spend.map(
                                            (ad) => ad.advertisedAsin
                                        )}
                                        colors={[
                                            "#FF6384",
                                            "#36A2EB",
                                            "#FFCE56",
                                            "#4BC0C0",
                                            "#9966FF",
                                        ]}
                                        height={370}
                                    />
                                </div>
                                <div className="overflow-x-auto">
                                    <Table className="min-w-full border text-center">
                                        <TableHeader className="bg-black text-white top-0 z-10">
                                            <TableRow>
                                                <TableHead>ASIN</TableHead>
                                                <TableHead>Spend (₹)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {top5Spend.map((ad) => (
                                                <TableRow key={ad.adId}>
                                                    <TableCell className="w-1/2">
                                                        {ad.advertisedAsin}
                                                    </TableCell>
                                                    <TableCell className="w-1/2">
                                                        {Number(
                                                            ad.spend
                                                        )?.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                style: "currency",
                                                                currency: "INR",
                                                                minimumFractionDigits: 2,
                                                            }
                                                        ) || "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {selectedTab === "keywordPerformance" && (
                    <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Keyword Performance
                        </h2>
                        
                        {/* Add table type indicator */}
                        <div className="flex justify-center mb-6">
                            <span className={`
                                inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold
                                ${getTableType(spAdData[0]?.campaignName || "") === "Brand" 
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : getTableType(spAdData[0]?.campaignName || "") === "Generic"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                }
                            `}>
                                {getTableType(spAdData[0]?.campaignName || "")} Table
                            </span>
                        </div>

                        {keywordPerformanceData.length === 0 ? (
                            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                No Targeting Keywords found for this Campaign
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="max-h-[600px] overflow-auto">
                                    <table className="w-full border-collapse relative">
                                        <thead className="sticky top-0 bg-black z-50">
                                            <tr>
                                                <th 
                                                    className="sticky top-0 left-0 z-50 bg-black whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 cursor-pointer hover:bg-gray-800"
                                                    onClick={() => handleKeywordSort("keyword")}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        Keyword
                                                        {keywordSortConfig.key === "keyword" && (
                                                            <span>{keywordSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                                        )}
                                                    </div>
                                                </th>
                                                {/* Dynamic columns */}
                                                {[
                                                    { key: "matchType", label: "Match Type" },
                                                    { key: "impressions", label: "Impressions" },
                                                    { key: "spend", label: "Spend" },
                                                    { key: "sales30d", label: "Sales" },
                                                    { key: "cpc", label: "CPC" },
                                                    { key: "clicks", label: "Clicks" },
                                                    { key: "bid", label: "Bid" },
                                                    { key: "purchases30d", label: "Orders" },
                                                    { key: "roas14d", label: "ROAS" },
                                                    { key: "acos14d", label: "ACOS" },
                                                ].map(({ key, label }) => (
                                                    <th
                                                        key={key}
                                                        onClick={() => handleKeywordSort(key as SortableKeywordFields)}
                                                        className="z-30 whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 bg-black cursor-pointer hover:bg-gray-800"
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            {label}
                                                            {keywordSortConfig.key === key && (
                                                                <span>{keywordSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[#212830] text-white">
                                            {getSortedKeywordData().map((keyword, index) => (
                                                <tr key={index} className="text-center">
                                                    <td className="sticky left-0 z-40 bg-[#212830] border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {keyword.keyword}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {keyword.matchType}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {keyword.impressions.toLocaleString()}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        ₹{keyword.spend.toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        ₹{keyword.sales30d.toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        ₹{keyword.cpc.toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {keyword.clicks}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        ₹{keyword.bid.toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {keyword.purchases30d}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {typeof keyword.roas14d === "number" ? keyword.roas14d.toFixed(2) : "-"}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                        {typeof keyword.acos14d === "number" ? `${keyword.acos14d.toFixed(2)}%` : "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {selectedTab === "NegativeKeyword" && (
                    <div className="shadow-2xl p-4 bg-white rounded-lg dark:bg-black">
                        <h2 className="text-2xl font-bold mb-8 text-center">
                            Negative Keywords
                        </h2>
                        {isNegativeKeywordsLoading ? (
                            <div className="text-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            </div>
                        ) : negativeKeywords.length === 0 ? (
                            <div className="text-gray-500 p-4 text-center">
                                No negative keywords found for this campaign
                            </div>
                        ) : (
                            <Table className="border border-default-300 mt-6">
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
                                        <TableHead className="border border-default-300">
                                            State
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {negativeKeywords
                                        .filter((kw) =>
                                            kw.keyword
                                                .toLowerCase()
                                                .includes(
                                                    searchQuery.toLowerCase()
                                                )
                                        )
                                        .map((keyword) => (
                                            <TableRow
                                                key={keyword.keywordID}
                                                className="text-center"
                                            >
                                                <TableCell className="border border-default-300">
                                                    {keyword.keywordID}
                                                </TableCell>
                                                <TableCell className="border border-default-300">
                                                    {keyword.keyword}
                                                </TableCell>
                                                <TableCell className="border border-default-300">
                                                    {keyword.matchType.replace(
                                                        "NEGATIVE_",
                                                        ""
                                                    )}
                                                </TableCell>
                                                <TableCell className="border border-default-300">
                                                    {keyword.state}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                )}
                {selectedTab === "KeywordRecommendation" && (
                    <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black">
                        <h2 className="text-2xl font-bold mb-8 text-center">
                            Artha Keyword Recommendations
                        </h2>
                        <div className="relative">
                            <div className="max-h-[600px] overflow-auto">
                                {recommendations.length > 0 ? (
                                    <table className="w-full border-collapse relative">
                                        <thead className="sticky top-0 bg-black z-50">
                                            <tr>
                                                <th className="sticky top-0 left-0 z-50 bg-black whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700">
                                                    Keyword
                                                </th>
                                                <th className="z-30 whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 bg-black">
                                                    Theme
                                                </th>
                                                <th className="z-30 whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 bg-black">
                                                    Match Type
                                                </th>
                                                <th className="z-30 whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 bg-black">
                                                    Rank
                                                </th>
                                                <th className="z-30 whitespace-nowrap px-6 py-4 font-semibold text-white border border-gray-700 bg-black">
                                                    Suggested Bid (₹)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[#212830] text-white">
                                            {recommendations
                                                .filter(rec => 
                                                    rec.keyword.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .map((rec, index) => (
                                                    <tr key={index} className={`text-center ${index > 0 ? 'blur-sm' : ''}`}>
                                                        <td className="sticky left-0 z-40 bg-[#212830] border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                            {rec.keyword}
                                                        </td>
                                                        <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                            {rec.theme}
                                                        </td>
                                                        <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                            {rec.match_type}
                                                        </td>
                                                        <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                            {rec.rank}
                                                        </td>
                                                        <td className="border border-gray-700 px-4 py-2 whitespace-nowrap">
                                                            ₹{(rec.bid / 100).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex justify-center items-center h-[200px]">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Overlay message for Keyword Recommendations */}
                            {recommendations.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 mt-12">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md text-center">
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            Please contact the Artha team to enable this feature
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
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
        <Suspense fallback={<div className="p-5">Loading...</div>}>
            <AdGroupContent />
        </Suspense>
    );
}
