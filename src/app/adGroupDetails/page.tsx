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

import Footer from "@/app/components/ui/footer";
import MainSidebar from "../components/ui/mainsidebar";

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

type AdType = "SP" | "SD";

type SPAdData = {
    endDate: string;
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
    clickThroughRate: number;
    sales30d: number;
    impressions: number;
    adId: string;
    portfolioId: string;
    clicks: number;
    campaignName: string;
    startDate: string;
    roasClicks7d: number;
    created_at: string;
};

type SDAdData = {
    promotedAsin: string;
    cost: number;
    endDate: string;
    adGroupName: string;
    purchases: number;
    campaignId: string;
    impressions: number;
    promotedSku: string;
    adGroupId: string;
    adId: string;
    clicks: number;
    campaignName: string;
    startDate: string;
    created_at: string;
};

type KeywordPerformanceResponse = {
    Targeting: string;
    "Match Type"?: string;
    matchType?: string;
    sales1d: number;
    cost: number;
    Clicks: number;
    Impressions: number;
    "Keyword Bid": number;
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
            `${backendURL}/report/target_portfolio?${queryParams}`,
            {
                cache: "no-store",
                headers: getRequiredHeaders(),
            }
        );

        if (!res.ok) throw new Error("Failed to fetch targeting data");
        const data = await res.json();

        return data.map((item: KeywordPerformanceResponse, index: number) => ({
            SN: index + 1,
            keyword: item.Targeting || "-",
            matchType: item["Match Type"] || item.matchType || "-",
            revenue: Number(item.sales1d) || 0,
            spend: Number(item.cost) || 0,
            clicks: Number(item.Clicks) || 0,
            impresssion: Number(item.Impressions) || 0,
            bid: Number(item["Keyword Bid"]) || 0,
            ACOS: (
                (Number(item.cost) / Number(item.sales1d)) * 100 || 0
            ).toFixed(2),
            ROAS: (Number(item.sales1d) / Number(item.cost) || 0).toFixed(2),
        }));
    } catch (error) {
        console.error("Error fetching target portfolio data:", error);
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

async function fetchSDAdData(campaignId: string, adGroupId: string) {
    try {
        const queryParams = new URLSearchParams({
            campaignId: campaignId.replace(".0", ""),
            adGroupId: adGroupId.replace(".0", ""),
        });

        const res = await fetch(
            `${backendURL}/report/sd_ad_details?${queryParams}`,
            {
                cache: "no-store",
                headers: getRequiredHeaders(),
            }
        );

        if (!res.ok) throw new Error("Failed to fetch SD ad data");
        const data = await res.json();
        console.log("SD Ad Data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching SD ad data:", error);
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
    const [adType, setAdType] = useState<AdType>("SP");
    const [spAdData, setSpAdData] = useState<SPAdData[]>([]);
    const [sdAdData, setSDAdData] = useState<SDAdData[]>([]);

    const searchParams = useSearchParams();
    const selectedBrand = searchParams.get("brand");
    const selectedCampaign = searchParams.get("campaign");
    const selectedAdGroup = searchParams.get("adGroup");

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

    useEffect(() => {
        const loadAdTypeData = async () => {
            try {
                const campaignId = searchParams.get("campaignId");
                const adGroupId = searchParams.get("adGroupId");

                if (!campaignId || !adGroupId) return;

                if (adType === "SD") {
                    const sdData = await fetchSDAdData(campaignId, adGroupId);
                    setSDAdData(sdData);
                }
            } catch (err) {
                console.error("Error loading ad type data:", err);
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            }
        };

        loadAdTypeData();
    }, [adType, searchParams]);

    useEffect(() => {
        const loadTabData = async () => {
            if (!checkAuthentication()) return;

            try {
                if (selectedTab === "NegativeKeyword") {
                    const campaignId = searchParams.get("campaignId");
                    if (!campaignId) {
                        throw new Error("Missing campaign ID");
                    }
                    const negativeKeywordResults = await fetchNegativeKeywords(
                        campaignId
                    );
                    setNegativeKeywords(negativeKeywordResults);
                }
            } catch (err) {
                console.error("Error loading tab data:", err);
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
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
                <div className="flex gap-4 mb-6">
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
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAdType("SP")}
                            className={`text-blue-600 bg-blue-50 shadow-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-300 
              font-medium rounded-lg text-sm px-6 py-2.5 transition-all duration-200 ease-in-out
              dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:shadow-lg
              ${adType === "SP" ? "bg-blue-600 text-white" : ""}`}
                        >
                            SP
                        </button>
                        <button
                            onClick={() => setAdType("SD")}
                            className={`text-blue-600 bg-blue-50 shadow-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-300 
              font-medium rounded-lg text-sm px-6 py-2.5 transition-all duration-200 ease-in-out
              dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:shadow-lg
              ${adType === "SD" ? "bg-blue-600 text-white" : ""}`}
                        >
                            SD
                        </button>
                    </div>
                </div>
                {selectedTab === "asin" && (
                    <div>
                        <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black">
                            <h2 className="text-2xl font-bold mb-8 text-center">
                                Ad Performance
                            </h2>
                            <Table className="border border-default-300 mt-6">
                                {adType === "SP" ? (
                                    <>
                                        <TableHeader className="bg-black text-white sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="border border-default-300">
                                                    Advertised ASIN
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Advertised SKU
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Campaign Status
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Spend
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Purchases 1d
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Purchases 7d
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    ACOS Clicks 7d
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Sales 1d
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Sales 7d
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Sales 14d
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Units Sold 1d
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Clicks
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Impressions
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    CTR
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Cost
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {spAdData.length > 0 ? (
                                                spAdData.map((ad) => (
                                                    <TableRow
                                                        key={ad.adId}
                                                        className="text-center"
                                                    >
                                                        <TableCell className="border border-default-300">
                                                            {ad.advertisedAsin}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.advertisedSku}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.campaignStatus}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.spend?.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.purchases1d}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.purchases7d}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">{`${Number(
                                                            ad.acosClicks7d || 0
                                                        ).toFixed(
                                                            2
                                                        )}%`}</TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.sales1d?.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.sales7d?.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.sales14d?.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {
                                                                ad.unitsSoldClicks1d
                                                            }
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.clicks}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.impressions?.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">{`${Number(
                                                            ad.clickThroughRate ||
                                                                0
                                                        ).toFixed(
                                                            2
                                                        )}%`}</TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.cost?.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={15}
                                                        className="text-center py-4"
                                                    >
                                                        No SP ad data available
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </>
                                ) : (
                                    <>
                                        <TableHeader className="bg-black text-white sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="border border-default-300">
                                                    Promoted SKU
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Promoted ASIN
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Ad ID
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Impressions
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Purchases
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Clicks
                                                </TableHead>
                                                <TableHead className="border border-default-300">
                                                    Cost
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sdAdData.length > 0 ? (
                                                sdAdData.map((ad) => (
                                                    <TableRow
                                                        key={ad.adId}
                                                        className="text-center"
                                                    >
                                                        <TableCell className="border border-default-300">
                                                            {ad.promotedSku}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.promotedAsin}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.adId}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.impressions?.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.purchases}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.clicks}
                                                        </TableCell>
                                                        <TableCell className="border border-default-300">
                                                            {ad.cost?.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={7}
                                                        className="text-center py-4"
                                                    >
                                                        No SD ad data available
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </>
                                )}
                            </Table>
                        </div>
                    </div>
                )}
                {selectedTab === "keywordPerformance" && (
                    <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black">
                        <h2 className="text-2xl font-bold mb-8 text-center">
                            Keyword Performance
                        </h2>
                        <Table className="border border-default-300 mt-6">
                            <TableHeader className="bg-black text-white sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="border border-default-300">
                                        Keyword
                                    </TableHead>
                                    <TableHead className="border border-default-300">
                                        Match Type
                                    </TableHead>
                                    <TableHead className="border border-default-300">
                                        Funnel
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
                                {keywordPerformanceData.map((keyword) => (
                                    <TableRow
                                        key={keyword.SN}
                                        className="text-center"
                                    >
                                        <TableCell className="border border-default-300">
                                            {keyword.keyword}
                                        </TableCell>
                                        <TableCell className="border border-default-300">
                                            {keyword.matchType}
                                        </TableCell>
                                        <TableCell className="border border-default-300">
                                            ₹
                                            {keyword.revenue?.toLocaleString() ||
                                                "-"}
                                        </TableCell>
                                        <TableCell className="border border-default-300">
                                            ₹
                                            {keyword.spend?.toLocaleString() ||
                                                "-"}
                                        </TableCell>
                                        <TableCell className="border border-default-300">
                                            {keyword.ACOS}%
                                        </TableCell>
                                        <TableCell className="border border-default-300">
                                            {keyword.ROAS}
                                        </TableCell>
                                        <TableCell className="border border-default-300">
                                            {keyword.clicks}
                                        </TableCell>
                                        <TableCell className="border border-default-300">
                                            {keyword.impresssion?.toLocaleString() ||
                                                "-"}
                                        </TableCell>
                                        <TableCell className="border border-default-300">
                                            ₹{keyword.bid.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {selectedTab === "NegativeKeyword" && (
                    <div className="shadow-2xl p-4 bg-white rounded-lg dark:bg-black">
                        <h2 className="text-2xl font-bold mb-8 text-center">
                            Negative Keywords
                        </h2>
                        {negativeKeywords.length === 0 ? (
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
                                    {negativeKeywords.map((keyword) => (
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
