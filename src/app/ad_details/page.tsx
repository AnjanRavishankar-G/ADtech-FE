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
        console.log(
            `Found ${data.length} ad groups for campaign ${campaignId}`
        );
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

    useEffect(() => {
        async function loadData() {
            if (!selectedCampaignId) {
                setError("No campaign ID provided");
                setIsLoading(false);
                return;
            }

            try {
                const results = await fetchCampaignData(
                    null,
                    null,
                    selectedCampaignId
                );
                if (results.length === 0) {
                    console.log(
                        `No ad groups found for campaign: ${selectedCampaignId}`
                    );
                }
                setCampaignData(results);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
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

                {/* Remove the old Dentsu text header and replace with just the page title */}
                <h1 className="text-2xl font-bold mb-4 text-center">Ad Groups</h1>

                <div className="flex items-center gap-4 mb-6">
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
                </div>

                <div className="shadow-2xl p-4 bg-white rounded-2xl overflow-x-auto max-h-96 dark:bg-black mt-4">
                    <Table className="border border-default-100 rounded-lg">
                        <TableHeader className="bg-black text-white top-0 z-10">
                            <TableRow>
                                <TableHead className="text-center">
                                    Ad Group Name
                                </TableHead>
                                <TableHead className="text-center">
                                    Type
                                </TableHead>
                                <TableHead className="text-center">
                                    Clicks
                                </TableHead>
                                <TableHead className="text-center">
                                    Impressions
                                </TableHead>
                                <TableHead className="text-center">
                                    Sales (₹)
                                </TableHead>
                                <TableHead className="text-center">
                                    Spend (₹)
                                </TableHead>
                                <TableHead className="text-center">
                                    CTR (%)
                                </TableHead>
                                <TableHead className="text-center">
                                    DPV
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-white">
                            {campaignData.map((adGroup) => (
                                <TableRow
                                    key={adGroup.SN}
                                    className="text-center"
                                >
                                    <TableCell className="border border-default-300">
                                        <Link
                                            href={{
                                                pathname: "/adGroupDetails",
                                                query: {
                                                    brand: selectedBrand || "",
                                                    campaign:
                                                        selectedCampaign || "",
                                                    adGroup:
                                                        adGroup.AdGroupName,
                                                    adGroupId:
                                                        adGroup.adGroupId,
                                                    campaignId:
                                                        adGroup.campaignId,
                                                },
                                            }}
                                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                        >
                                            {adGroup.AdGroupName}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="border border-default-300">
                                        {adGroup.Type}
                                    </TableCell>
                                    <TableCell className="border border-default-300">
                                        {adGroup.Clicks.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="border border-default-300">
                                        {adGroup.Impressions.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="border border-default-300">
                                        {adGroup.Sales.toLocaleString("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                            minimumFractionDigits: 2,
                                        })}
                                    </TableCell>
                                    <TableCell className="border border-default-300">
                                        {adGroup.Spend.toLocaleString("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                            minimumFractionDigits: 2,
                                        })}
                                    </TableCell>
                                    <TableCell className="border border-default-300">
                                        {(adGroup.CTR * 100).toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="border border-default-300">
                                        {adGroup.DPV.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                                                {adGroup.Sales?.toLocaleString(
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
                                                {adGroup.Spend?.toLocaleString(
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
                <div className="mt-8">
                    <Footer />
                </div>
            </div>
            <SalesPopup
                isOpen={selectedSales.isOpen}
                onClose={() =>
                    setSelectedSales((prev) => ({ ...prev, isOpen: false }))
                }
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
