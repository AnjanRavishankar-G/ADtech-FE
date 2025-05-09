"use client";
import "@/css/brand.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../components/ui/footer";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";
import Layout from "../components/ui/Layout";
import { createAuthenticatedFetch } from "@/utils/api";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";

const PORTFOLIO_ID = "17632003063708";

type PortfolioData = {
    portfolio_id: string; // Change to string type
    name: string;
    budget_amount: number;
    status: string;
    spend: string;
    orders: number;
    sales: string;
    roas: string;
    budget_start_date: string;
    budget_end_date: string;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchPortfolioData() {
    const fetchWithAuth = createAuthenticatedFetch();
    try {
        console.log("Fetching portfolio data...");
        const userRole = Cookies.get("id_token");

        const response = await fetchWithAuth(
            `${backendURL}/report/brand_portfolios`,
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
            throw new Error(
                `Failed to fetch portfolio data: ${response.status}`
            );
        }

        const data = await response.json();

        // Ensure portfolio_id is always set to our constant value
        return data.map((portfolio: PortfolioData) => ({
            ...portfolio,
            portfolio_id: PORTFOLIO_ID,
        }));
    } catch (error) {
        console.error("Error in fetchPortfolioData:", error);
        throw error;
    }
}

export default function BrandTargetTables() {
    const router = useRouter();
    const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await fetchPortfolioData();
                setPortfolioData(data);
            } catch (err) {
                console.error("Error loading data:", err);
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
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

    if (isLoading) return <div>Loading...</div>;

    const displayData = portfolioData;

    return (
        <Layout>
            <div className="p-5">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <div className="p-5 ">
                        <div className="w-full p-4 rounded-lg bg-color:[#f1f4f5]">
                            <div className="relative flex items-center justify-center w-full min-h-[100px]">
                                {/* Left-aligned smaller Havells logo */}
                                <div className="absolute left-3 top-4">
                                    <Image
                                        src="/havells_png.png"
                                        alt="Havells Logo"
                                        width={100} // Smaller size
                                        height={30} // Maintained aspect ratio
                                        priority
                                        className="mx-auto"
                                    />
                                </div>

                                {/* Keep Dentsu logo centered and unchanged */}
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

                        <div className="p-5">
                            {/* Hide the heading */}
                            <h1
                                className={`text-xl font-bold mb-7 text-center hidden`}
                            >
                                Brands
                            </h1>

                            {/* Hide the entire flex container with the three visualizations */}
                            <div
                                className={`hidden flex flex-col md:flex-row flex-wrap justify-start gap-5 bg-[#f8f9fa] dark:bg-[#1e1e1e] rounded-2xl`}
                            ></div>

                            <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
                                <div className="overflow-auto max-h-[500px]">
                                    <Table className="min-w-full border text-center">
                                        <TableHeader className="bg-gray-200 dark:bg-gray-800">
                                            <TableRow>
                                                <TableHead>Portfolio</TableHead>
                                                <TableHead>
                                                    Budget (₹)
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Spend (₹)</TableHead>
                                                <TableHead>Orders</TableHead>
                                                <TableHead>Sales (₹)</TableHead>
                                                <TableHead>ROAS</TableHead>
                                                <TableHead>
                                                    Budget Start Date
                                                </TableHead>
                                                <TableHead>
                                                    Budget End Date
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {displayData.map((portfolio) => (
                                                <TableRow
                                                    key={portfolio.portfolio_id}
                                                >
                                                    <TableCell className="border border-default-300 hover:bg-default-100 transition-colors cursor-pointer p-0">
                                                        <Link
                                                            href={`/campaign?brand=${encodeURIComponent(
                                                                portfolio.name
                                                            )}&portfolioId=${encodeURIComponent(
                                                                portfolio.portfolio_id
                                                            )}`}
                                                            className="text-black hover:bg-gray-300 block w-full h-full p-4 dark:text-white dark:hover:bg-blue-900"
                                                        >
                                                            {portfolio.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        {Number(
                                                            portfolio.budget_amount
                                                        )?.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                style: "currency",
                                                                currency: "INR",
                                                                minimumFractionDigits: 2,
                                                            }
                                                        ) || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {portfolio.status ||
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {Number(
                                                            portfolio.spend
                                                        )?.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                style: "currency",
                                                                currency: "INR",
                                                                minimumFractionDigits: 2,
                                                            }
                                                        ) || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {portfolio.orders?.toLocaleString(
                                                            "en-IN"
                                                        ) || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {Number(
                                                            portfolio.sales
                                                        )?.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                style: "currency",
                                                                currency: "INR",
                                                                minimumFractionDigits: 2,
                                                            }
                                                        ) || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {portfolio.roas || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {portfolio.budget_start_date ||
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {portfolio.budget_end_date ||
                                                            "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Add hidden class to the mt-12 flex container and its contents */}
                            <div className="mt-12 flex gap-4 rounded-2xl hidden"></div>
                        </div>
                        <div>
                            <Footer />
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
