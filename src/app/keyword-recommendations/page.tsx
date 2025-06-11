"use client";
import React, { useState, useEffect } from "react";
import Layout from "../components/ui/Layout";
import Image from "next/image";
import Footer from "@/app/components/ui/footer";
import Cookies from "js-cookie";

type Campaign = {
  campaignId: string;
  campaignName: string;
};

type AdGroup = {
  adGroupId: string;
  adGroupName: string;
  campaignId: string;
};

type KeywordRecommendation = {
  keyword: string;
  theme: string;
  match_type: string;
  rank: number;
  bid: number;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchKeywordRecommendations(
  campaignId: string,
  adGroupId: string
) {
  try {
    const cleanCampaignId = campaignId.replace(".0", "");
    const cleanAdGroupId = adGroupId.replace(".0", "");

    const res = await fetch(
      `${backendURL}/keyword-recommendation/${cleanCampaignId}/${cleanAdGroupId}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
          "Content-Type": "application/json",
          "X-ID-Token": Cookies.get("id_token") || "",
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch keyword recommendations");
    const data = await res.json();
    return data.keywords || [];
  } catch (error) {
    console.error("Error fetching keyword recommendations:", error);
    throw error;
  }
}

function KeywordRecommendationsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedAdGroup, setSelectedAdGroup] = useState<string>("");
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");
  const [adGroupSearchQuery, setAdGroupSearchQuery] = useState("");
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showAdGroupDropdown, setShowAdGroupDropdown] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [recommendations, setRecommendations] = useState<
    KeywordRecommendation[]
  >([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationSearchQuery, setRecommendationSearchQuery] =
    useState("");

  // Fetch data from combined_table
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${backendURL}/report/sp_campaigns`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("auth_token")}`,
            "Content-Type": "application/json",
            "X-ID-Token": Cookies.get("id_token") || "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch campaigns");
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Add fetch function for ad groups when campaign is selected
  useEffect(() => {
    const fetchAdGroups = async () => {
      try {
        // Fetch all ad groups initially
        const response = await fetch(`${backendURL}/report/sp_ad_groups`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("auth_token")}`,
            "Content-Type": "application/json",
            "X-ID-Token": Cookies.get("id_token") || "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch ad groups");
        const data = await response.json();
        setAdGroups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchAdGroups();
  }, []); // Remove selectedCampaignId dependency

  // Filter campaigns based on search
  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign?.campaignName
      ?.toLowerCase()
      ?.includes(campaignSearchQuery.toLowerCase() || '')
  );

  // Update ad group filtering
  const filteredAdGroups = React.useMemo(() => {
    if (!selectedCampaignId) return [];

    return adGroups
      .filter((item) => 
        item?.campaignId === selectedCampaignId && 
        item?.adGroupName
      )
      .filter((item) =>
        item.adGroupName
          .toLowerCase()
          .includes(adGroupSearchQuery.toLowerCase() || '')
      );
  }, [adGroups, selectedCampaignId, adGroupSearchQuery]);

  // Function to handle campaign selection
  const handleCampaignSelect = (campaign: Campaign) => {
    if (!campaign?.campaignId || !campaign?.campaignName) return;

    setSelectedCampaign(campaign.campaignName);
    setSelectedCampaignId(campaign.campaignId);
    setCampaignSearchQuery(campaign.campaignName);
    setShowCampaignDropdown(false);

    // Reset ad group selection
    setSelectedAdGroup("");
    setAdGroupSearchQuery("");
    setShowAdGroupDropdown(true);
  };

  // Update ad group selection handler
  const handleAdGroupSelect = (adGroup: AdGroup) => {
    if (!adGroup?.adGroupId || !adGroup?.adGroupName) return;

    setSelectedAdGroup(adGroup.adGroupName);
    setAdGroupSearchQuery(adGroup.adGroupName);
    setShowAdGroupDropdown(false);
  };

  // Update recommend handler
  const handleRecommend = async () => {
    try {
      const adGroupId = adGroups.find(
        (item) => item.adGroupName === selectedAdGroup
      )?.adGroupId;

      if (!selectedCampaignId || !adGroupId) {
        throw new Error("Missing campaign ID or ad group ID");
      }

      const results = await fetchKeywordRecommendations(
        selectedCampaignId,
        adGroupId
      );
      setRecommendations(results);
      setShowRecommendations(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
        </div>
      ) : (
        <div className="p-5 min-h-screen flex flex-col">
          {/* Logo Header Section with fixed spacing */}
          <div className="w-full p-0 rounded-lg bg-color:[#f1f4f5] mb-16">
            <div className="relative flex items-center justify-center w-full min-h-[60px]">
              <div className="absolute left-1/2 transform -translate-x-1/2">
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

          <div className="flex flex-col justify-center items-center">
            {/* Update logo and title layout to match CampaignOpportunities style */}
            <div className="flex items-center gap-4 mb-8">
              <Image
                src="/keyword_recommendation.png"
                alt="Keyword Recommendation Logo"
                width={45}
                height={45}
                priority
                className="dark:filter dark:invert object-contain"
              />
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Artha Keyword Recommendations
              </h1>
            </div>

            {/* Search Dropdowns in horizontal layout */}
            <div className="w-full max-w-4xl">
              <div className="flex gap-4">
                {/* Campaign Search */}
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Select Campaign
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search campaign..."
                      value={campaignSearchQuery}
                      onChange={(e) => {
                        setCampaignSearchQuery(e.target.value);
                        setSelectedCampaign("");
                      }}
                      onClick={() => setShowCampaignDropdown(true)}
                      className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    {/* Campaign dropdown */}
                    {showCampaignDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredCampaigns.map((campaign) => (
                          <div
                            key={campaign.campaignId}
                            onClick={() => handleCampaignSelect(campaign)}
                            className={`p-3 cursor-pointer dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              selectedCampaign === campaign.campaignName
                                ? "bg-gray-100 dark:bg-gray-700"
                                : ""
                            }`}
                          >
                            {campaign.campaignName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ad Group Search */}
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Select Ad Group
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search ad groups..."
                      value={adGroupSearchQuery}
                      onChange={(e) => {
                        setAdGroupSearchQuery(e.target.value);
                        setSelectedAdGroup("");
                        setShowAdGroupDropdown(true);
                      }}
                      onClick={() => setShowAdGroupDropdown(true)}
                      disabled={!selectedCampaign}
                      className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50"
                    />
                    {/* Ad Group dropdown */}
                    {showAdGroupDropdown && selectedCampaign && filteredAdGroups.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredAdGroups.map((adGroup) => (
                          <div
                            key={adGroup.adGroupId}
                            onClick={() => handleAdGroupSelect(adGroup)}
                            className={`p-3 cursor-pointer dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              selectedAdGroup === adGroup.adGroupName
                                ? "bg-gray-100 dark:bg-gray-700"
                                : ""
                            }`}
                          >
                            {adGroup.adGroupName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Recommend Button */}
          {selectedCampaign && selectedAdGroup && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleRecommend}
                className="px-6 py-2 bg-[#0073C7] text-white rounded-lg hover:bg-[#0066b3] focus:outline-none focus:ring-2 focus:ring-[#0073C7] focus:ring-offset-2 dark:hover:bg-[#0066b3]"
              >
                Recommend
              </button>
            </div>
          )}

          {/* Recommendations Table */}
          {showRecommendations && (
            <div className="mt-8 shadow-2xl p-4 bg-white rounded-2xl dark:bg-black">
              <div className="flex justify-end items-center mb-6">
                <div className="w-[300px]">
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={recommendationSearchQuery}
                    onChange={(e) => setRecommendationSearchQuery(e.target.value)}
                    className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="max-h-[600px] overflow-auto">
                  <table className="w-full border-collapse relative">
                    <thead className="sticky top-0 bg-black z-50">
                      <tr>
                        <th className="sticky top-0 left-0 z-50 bg-black whitespace-nowrap px-6 pt-2 pb-6 pl-3 font-semibold text-white border border-gray-700 text-left min-w-[250px]">
                          Keyword
                        </th>
                        <th className="z-30 whitespace-nowrap px-6 pt-2 pb-6 pl-3 font-semibold text-white border border-gray-700 bg-black text-left min-w-[150px]">
                          Theme
                        </th>
                        <th className="z-30 whitespace-nowrap px-6 pt-2 pb-6 pl-3 font-semibold text-white border border-gray-700 bg-black text-left min-w-[150px]">
                          Match Type
                        </th>
                        <th className="z-30 whitespace-nowrap px-6 pt-2 pb-6 pr-3 font-semibold text-white border border-gray-700 bg-black text-right min-w-[100px]">
                          Rank
                        </th>
                        <th className="z-30 whitespace-nowrap px-6 pt-2 pb-6 pr-3 font-semibold text-white border border-gray-700 bg-black text-right min-w-[150px]">
                          Suggested Bid (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#212830] text-white">
                      {recommendations
                        .filter((rec) =>
                          rec.keyword
                            .toLowerCase()
                            .includes(recommendationSearchQuery.toLowerCase())
                        )
                        .map((rec, index) => (
                          <tr
                            key={index}
                            className={`${index > 0 ? "blur-sm" : ""}`}
                          >
                            <td className="sticky left-0 z-40 bg-[#212830] border border-gray-700 px-6 pt-2 pb-6 pl-3 whitespace-nowrap text-left">
                              {rec.keyword}
                            </td>
                            <td className="border border-gray-700 px-6 pt-2 pb-6 pl-3 whitespace-nowrap text-left">
                              {rec.theme}
                            </td>
                            <td className="border border-gray-700 px-6 pt-2 pb-6 pl-3 whitespace-nowrap text-left">
                              {rec.match_type}
                            </td>
                            <td className="border border-gray-700 px-6 pt-2 pb-6 pr-3 whitespace-nowrap text-right">
                              {rec.rank}
                            </td>
                            <td className="border border-gray-700 px-6 pt-2 pb-6 pr-3 whitespace-nowrap text-right">
                              ₹{(rec.bid / 100).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Overlay message */}
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

          {/* Rest of your content */}
          <div className="mt-auto pt-16">
            <Footer />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default function KeywordRecommendationsPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <KeywordRecommendationsContent />
    </React.Suspense>
  );
}
