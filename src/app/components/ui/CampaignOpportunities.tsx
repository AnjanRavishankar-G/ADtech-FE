"use client";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

type OpportunityItem = {
  name: string;
  spendRange: string;
};

type CampaignDetail = {
  campaignName: string;
  campaignId: string;
  adGroupId: string;
  adGroup: string;
  keyword: string; // Add this field
  bidAdjustment: number;
  budgetStrategy: "Increase" | "Decrease";
  isBlurred?: boolean;
};

// Update the opportunities array to include both cards
const opportunities: OpportunityItem[] = [
  {
    name: "Havells - AC020625",
    spendRange: "7-10%",
  },
  {
    name: "Havells - AC090625",
    spendRange: "7-10%",
  },
];

// Add new campaign details for AC090625
const ac090625Details: CampaignDetail[] = [
  {
    campaignName: "Sok | SP | Generic | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "517963182025884",
    adGroup: "broad 2",
    keyword: "fans ceiling fans",
    bidAdjustment: 7.0,
    budgetStrategy: "Increase",
  },
  {
    campaignName: "Sok | SP | Generic | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "411771654849539",
    adGroup: "Broad",
    keyword: "fans +ceiling +fans +5 +star",
    bidAdjustment: 25.6,
    budgetStrategy: "Increase",
  },
  {
    campaignName: "Sok | SP | Generic | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "411771654849539",
    adGroup: "Broad",
    keyword: "ceiling fan",
    bidAdjustment: 19.5,
    budgetStrategy: "Increase",
  },
  {
    campaignName: "Sok | SP | Generic | PM | Stealth | Premium BLDC",
    campaignId: "509157882988033",
    adGroupId: "369138017307077",
    adGroup: "High SFR_Phrase",
    keyword: "bldc ceiling fan",
    bidAdjustment: 20.0,
    budgetStrategy: "Decrease",
  },
  {
    campaignName: "Sok | SP | AB test | BLDC | Generic",
    campaignId: "513443460065622",
    adGroupId: "479335278316129",
    adGroup: "best seller",
    keyword: "ceiling fan",
    bidAdjustment: 12.0,
    budgetStrategy: "Decrease",
  },
  {
    campaignName: "Sok | SP | Generic | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "517963182025884",
    adGroup: "broad 2",
    keyword: "bldc ceiling fan",
    bidAdjustment: 23.1,
    budgetStrategy: "Increase",
  },
  {
    campaignName: "Sok | SP | Generic | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "411771654849539",
    adGroup: "Broad",
    keyword: "bldc ceiling fan",
    bidAdjustment: 12.0,
    budgetStrategy: "Decrease",
  },
  // Add 5 blurred rows
  {
    campaignName: "Sok | SP | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "517963182025884",
    adGroup: "broad 2",
    keyword: "ceiling fans premium",
    bidAdjustment: 15.5,
    budgetStrategy: "Increase",
    isBlurred: true,
  },
  {
    campaignName: "Sok | SP | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "517963182025884",
    adGroup: "broad 2",
    keyword: "premium ceiling fans",
    bidAdjustment: 17.0,
    budgetStrategy: "Increase",
    isBlurred: true,
  },
  {
    campaignName: "Sok | SP | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "517963182025884",
    adGroup: "broad 2",
    keyword: "ceiling fan energy saving",
    bidAdjustment: 14.0,
    budgetStrategy: "Decrease",
    isBlurred: true,
  },
  {
    campaignName: "Sok | SP | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "517963182025884",
    adGroup: "broad 2",
    keyword: "best ceiling fans 2023",
    bidAdjustment: 16.0,
    budgetStrategy: "Decrease",
    isBlurred: true,
  },
  {
    campaignName: "Sok | SP | BLDC | Broad | Temp",
    campaignId: "284147232441151",
    adGroupId: "517963182025884",
    adGroup: "broad 2",
    keyword: "top rated ceiling fans",
    bidAdjustment: 18.0,
    budgetStrategy: "Decrease",
    isBlurred: true,
  },
];

const campaignDetails: CampaignDetail[] = [
  {
    campaignName: "Sok | SP | New | Generic | Exact | BLDC",
    campaignId: "542216646352991",
    adGroupId: "388913329999095",
    adGroup: "new",
    keyword: "fans ceiling fans 5 star",
    bidAdjustment: 21.34,
    budgetStrategy: "Decrease",
  },
  {
    campaignName: "Sok | SP | Brand | EM | BLDC",
    campaignId: "122452353397403",
    adGroupId: "179807517346774",
    adGroup: "Brand",
    keyword: "havells ceiling fans for home",
    bidAdjustment: 17.85,
    budgetStrategy: "Increase",
  },
  {
    campaignName: "Sok | SP | Brand | EM | BLDC",
    campaignId: "122452353397403",
    adGroupId: "179807517346774",
    adGroup: "Brand",
    keyword: "havells fans",
    bidAdjustment: 19.78,
    budgetStrategy: "Increase",
  },
  {
    campaignName: "Sok | SP | New | Generic | Exact | BLDC",
    campaignId: "542216646352991",
    adGroupId: "388913329999095",
    adGroup: "new",
    keyword: "bldc fan ceiling 1200mm",
    bidAdjustment: 20.6,
    budgetStrategy: "Decrease",
  },
  {
    campaignName: "Sok | SP | Generic | Broad | Blade length",
    campaignId: "318070592425456",
    adGroupId: "425782101994375",
    adGroup: "broad",
    keyword: "bldc ceiling fan 1200mm",
    bidAdjustment: 21.5,
    budgetStrategy: "Increase",
  },
  {
    campaignName: "Sok | SP | Generic | Exact | New | BLDC | 2",
    campaignId: "442664711895590",
    adGroupId: "541799847823517",
    adGroup: "generic new",
    keyword: "ceiling fans",
    bidAdjustment: 18.8,
    budgetStrategy: "Decrease",
  },
  {
    campaignName: "Sok | SP | Brand | PM | BLDC",
    campaignId: "553085685075925",
    adGroupId: "504800382808547",
    adGroup: "Brand",
    keyword: "havells",
    bidAdjustment: 17.55,
    budgetStrategy: "Increase",
  },
  // Blurred rows
  {
    campaignName: "Sok | SP | Brand | EM | BLDC",
    campaignId: "122452353397403",
    adGroupId: "179807517346774",
    adGroup: "Brand",
    keyword: "havells ceiling fans for home",
    bidAdjustment: 12.75,
    budgetStrategy: "Increase",
    isBlurred: true,
  },
  {
    campaignName: "Sok | SP | Brand | Exact | Ceiling Fan | ES",
    campaignId: "122452353397403",
    adGroupId: "179807517346774",
    adGroup: "Brand",
    keyword: "havells ceiling fans for home",
    bidAdjustment: 14.68,
    budgetStrategy: "Decrease",
    isBlurred: true,
  },
  {
    campaignName: "Sok | SP | Generic | Exact | New | BLDC | 2",
    campaignId: "442664711895590",
    adGroupId: "541799847823517",
    adGroup: "generic new",
    keyword: "fan",
    bidAdjustment: 18.116,
    budgetStrategy: "Increase",
    isBlurred: true,
  },
  {
    campaignName: "Sok | SP | New | Generic | Exact | BLDC",
    campaignId: "542216646352991",
    adGroupId: "388913329999095",
    adGroup: "new",
    keyword: "bldc-ceiling-fan",
    bidAdjustment: 26.585,
    budgetStrategy: "Increase",
    isBlurred: true,
  },
  {
    campaignName: "Sok | SP | Generic | Broad | Blade length",
    campaignId: "318070592425456",
    adGroupId: "425782101994375",
    adGroup: "broad",
    keyword: "ceiling fan 1200mm",
    bidAdjustment: 21,
    budgetStrategy: "Increase",
    isBlurred: true,
  },
];

export default function CampaignOpportunities() {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null); // Change type to string | null
  const [selectedCard, setSelectedCard] = useState<number>(0);

  // Modify the details modal to use the correct data based on selectedCard
  const getDetailsData = (cardIndex: number) => {
    return cardIndex === 1 ? ac090625Details : campaignDetails;
  };

  const handleApproveClick = () => {
    setShowModal(true);
  };

  const handleShowMore = () => {
    setShowDetailsModal(true);
  };

  const getStrategyTooltip = (strategy: string) => {
    return strategy === "Increase"
      ? "High Potential Bid Opportunity"
      : "Budget Efficiency Recommendation";
  };

  // Add this new function inside your CampaignOpportunities component
  const handleExport = () => {
    // Get the current data based on selected card
    const data = getDetailsData(selectedCard).filter((item) => !item.isBlurred);

    // Transform data to match table columns
    const exportData = data.map((item) => ({
      "Campaign Name": item.campaignName,
      "Ad Group": item.adGroup,
      Keyword: item.keyword,
      "Bid Adjustment": `₹${item.bidAdjustment.toFixed(2)}`,
      "Budget Strategy": item.budgetStrategy,
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Campaign Data");

    // Generate filename based on selected card
    const filename = `${opportunities[selectedCard].name}_campaign_data.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center justify-between max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-4">
          <Image
            src="/campaign_opportunities.png"
            alt="Campaign Opportunities"
            width={50}
            height={50}
            priority
            className="dark:filter dark:invert object-contain"
          />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Campaign Opportunities
          </h2>
        </div>

        {/* Right side - Cards Container */}
        <div className="flex justify-between gap-4">
          {opportunities.map((opportunity, index) => (
            <div
              key={index}
              className={`flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[300px] ${
                index === 1 ? "order-first" : ""
              }`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
                  {opportunity.name}
                </h3>
                <div className="flex items-center gap-2 mb-4 text-green-500">
                  <TrendingUp size={18} />
                  <span className="font-medium">{opportunity.spendRange}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleApproveClick}
                    className="w-full bg-amber-400 hover:bg-amber-500 !text-black font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(index);
                      handleShowMore();
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 !text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Campaign Opportunity : {opportunities[selectedCard].name}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-[60]">
                  <tr>
                    <th className="px-6 pt-2 pb-6 pl-3 text-left font-semibold">
                      Campaign Name
                    </th>
                    <th className="px-6 pt-2 pb-6 pl-3 text-left font-semibold">
                      Ad Group
                    </th>
                    <th className="px-6 pt-2 pb-6 pl-3 text-left font-semibold">
                      Keyword
                    </th>
                    <th className="px-6 pt-2 pb-6 pl-3 text-left font-semibold">
                      Bid Adjustment
                    </th>
                    <th className="px-6 pt-2 pb-6 pl-3 text-left font-semibold">
                      Budget Strategy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getDetailsData(selectedCard).map((detail, index) => (
                    <tr
                      key={index}
                      className={`
                        border-t dark:border-gray-600
                        ${
                          index % 2 === 0
                            ? "bg-gray-50 dark:bg-gray-800"
                            : "bg-white dark:bg-gray-700"
                        }
                        ${detail.isBlurred ? "blur-sm" : ""}
                      `}
                    >
                      <td className="px-6 pt-2 pb-6 pl-3">
                        {detail.campaignName}
                      </td>
                      <td className="px-6 pt-2 pb-6 pl-3">{detail.adGroup}</td>
                      <td className="px-6 pt-2 pb-6 pl-3">
                        {detail.isBlurred ? (
                          detail.keyword
                        ) : (
                          <Link
                            href={`/adGroupDetails?brand=BLDC&campaign=${encodeURIComponent(
                              detail.campaignName
                            )}&adGroup=${encodeURIComponent(
                              detail.adGroup
                            )}&adGroupId=${encodeURIComponent(
                              detail.adGroupId
                            )}&campaignId=${encodeURIComponent(
                              detail.campaignId
                            )}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                          >
                            {detail.keyword}
                          </Link>
                        )}
                      </td>
                      <td className="px-6 pt-2 pb-6 pr-3 text-right">
                        ₹&nbsp;{detail.bidAdjustment.toFixed(2)}
                      </td>
                      <td className="px-6 pt-2 pb-6 pl-3">
                        <div
                          className="flex items-center justify-center gap-2 relative group"
                          onMouseEnter={() =>
                            !detail.isBlurred &&
                            setHoveredStrategy(`row-${index}`)
                          }
                          onMouseLeave={() => setHoveredStrategy(null)}
                        >
                          {detail.budgetStrategy === "Increase" ? (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="#22c55e"
                              stroke="#22c55e"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="12,2 22,20 2,20" />
                            </svg>
                          ) : (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="#ef4444"
                              stroke="#ef4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="12,22 2,4 22,4" />
                            </svg>
                          )}
                          <span className="text-white font-medium">
                            {detail.budgetStrategy}
                          </span>
                          {!detail.isBlurred &&
                            hoveredStrategy === `row-${index}` && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-[70] px-3 py-1.5 text-sm !bg-orange-400 !text-black rounded-md shadow-lg whitespace-nowrap font-medium">
                                {getStrategyTooltip(detail.budgetStrategy)}
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Overlay for blurred rows */}
              {getDetailsData(selectedCard).some(
                (detail) => detail.isBlurred
              ) && (
                <div className="sticky bottom-0 left-0 right-0 flex items-center justify-center py-4 bg-gray-800/95 backdrop-blur-sm z-[70]">
                  <div className="text-white px-6 py-3 rounded-lg">
                    Please contact the Artha team to enable this feature
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Please contact the Artha team to enable this feature
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
