"use client";
import { useEffect, useState } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Types for keyword data
interface KeywordData {
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
}

export default function KeywordsPage() {
    const [data, setData] = useState<KeywordData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function loadKeywords() {
            try {
                const fetchWithAuth = createAuthenticatedFetch();
                const response = await fetchWithAuth(
                    `${backendURL}/report/keyword_report`,
                    {
                        mode: "cors",
                        credentials: "omit",
                        headers: {
                            Authorization: `Bearer ${Cookies.get(
                                "auth_token"
                            )}`,
                            "Content-Type": "application/json",
                            "X-ID-Token": Cookies.get("id_token") || "",
                        },
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Response not OK:", {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorText,
                        headers: Object.fromEntries(response.headers),
                    });
                    throw new Error(
                        `Failed to fetch keyword data: ${response.status}`
                    );
                }

                const fetchedData = await response.json();
                console.log("Fetched Keyword Data:", fetchedData);
                setData(fetchedData);
            } catch (error) {
                console.error("Error fetching keyword data:", error);
                if (
                    error instanceof Error &&
                    error.message.includes("No authentication token found")
                ) {
                    router.push("/login");
                }
                setError(
                    error instanceof Error ? error.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        }

        loadKeywords();
    }, [router]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    // Filter for spKeywords source
    const spKeywordsData = data.filter((item) => item.Source === "spKeyword");

    if (spKeywordsData.length === 0) {
        return <h1 style={{ color: "red" }}>No spKeywords data available</h1>;
    }

    return (
        <div style={{ padding: "20px", fontFamily: "lato" }}>
            <h1>Keyword Performance Report</h1>
            <table
                border={1}
                cellPadding={8}
                style={{ borderCollapse: "collapse", width: "100%" }}
            >
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Keyword</th>
                        <th>Match Type</th>
                        <th>Search Term</th>
                        <th>Cost</th>
                        <th>Clicks</th>
                        <th>Impressions</th>
                        <th>Sales (30d)</th>
                        <th>Purchases (30d)</th>
                        <th>Top of Search Impression Share</th>
                    </tr>
                </thead>
                <tbody>
                    {spKeywordsData.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.keyword || "N/A"}</td>
                            <td>{item.matchType}</td>
                            <td>
                                {item.searchTerm !== "None"
                                    ? item.searchTerm
                                    : "N/A"}
                            </td>
                            <td>₹{parseFloat(item.cost).toFixed(2)}</td>
                            <td>{item.clicks}</td>
                            <td>{item.impressions}</td>
                            <td>₹{parseFloat(item.sales30d).toFixed(2)}</td>
                            <td>{item.purchases30d}</td>
                            <td>
                                {isNaN(
                                    parseFloat(item.topOfSearchImpressionShare)
                                )
                                    ? "N/A"
                                    : `${parseFloat(
                                          item.topOfSearchImpressionShare
                                      ).toFixed(2)}%`}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
