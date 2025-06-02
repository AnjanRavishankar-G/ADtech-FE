"use client"
import Image from "next/image"
import { TrendingUp, ArrowUp, ArrowDown} from "lucide-react"
import { useState } from "react"

type OpportunityItem = {
  name: string
  spendRange: string
}

type CampaignDetail = {
  campaignName: string
  keyword: string
  bidAdjustment: number
  budgetStrategy: "Increase" | "Decrease"
  isBlurred?: boolean
}

const opportunities: OpportunityItem[] = [
  {
    name: "Havells - AC020625",
    spendRange: "7-10%"
  }
]

const campaignDetails: CampaignDetail[] = [
  {
    campaignName: "Sok | SP | New | Generic | Exact | BLDC",
    keyword: "fans ceiling fans 5 star",
    bidAdjustment: 21.34,
    budgetStrategy: "Decrease"
  },
  {
    campaignName: "Sok | SP | Brand | EM | BLDC",
    keyword: "havells ceiling fans for home",
    bidAdjustment: 17.85,
    budgetStrategy: "Increase"
  },
  {
    campaignName: "Sok | SP | BLDC | Broad | Temp",
    keyword: "ceiling fan",
    bidAdjustment: 19.5,
    budgetStrategy: "Increase"
  },
  {
    campaignName: "Sok | SP | Brand | EM | BLDC",
    keyword: "havells fans",
    bidAdjustment: 19.78,
    budgetStrategy: "Increase"
  },
  {
    campaignName: "Sok | SP | New | Generic | Exact | BLDC",
    keyword: "bldc fan ceiling 1200mm",
    bidAdjustment: 20.6,
    budgetStrategy: "Decrease"
  },
  {
    campaignName: "Sok | SP | BLDC | Broad | Temp",
    keyword: "bldc ceiling fan",
    bidAdjustment: 21.55,
    budgetStrategy: "Increase"
  },
  {
    campaignName: "Sok | SP | Generic | Broad | Blade length",
    keyword: "bldc ceiling fan 1200mm",
    bidAdjustment: 21.5,
    budgetStrategy: "Increase"
  },
  {
    campaignName: "Sok | SP | Generic | Exact | New | BLDC | 2",
    keyword: "ceiling fans",
    bidAdjustment: 18.8,
    budgetStrategy: "Decrease"
  },
  {
    campaignName: "Sok | SP | Brand | PM | BLDC",
    keyword: "havels",
    bidAdjustment: 17.55,
    budgetStrategy: "Increase"
  },
  {
    campaignName: "Sok | SP | Brand | PM | ES | Ceiling Fan",
    keyword: "havells",
    bidAdjustment: 7.98,
    budgetStrategy: "Decrease"
  },
  // Blurred rows
  {
    campaignName: "Sok | SP | Brand | EM | BLDC",
    keyword: "havells ceiling fans for home",
    bidAdjustment: 12.75,
    budgetStrategy: "Increase",
    isBlurred: true
  },
  {
    campaignName: "Sok | SP | Brand | Exact | Ceiling Fan | ES",
    keyword: "havells ceiling fans for home",
    bidAdjustment: 14.68,
    budgetStrategy: "Decrease",
    isBlurred: true
  },
  {
    campaignName: "Sok | SP | Generic | Exact | New | BLDC | 2",
    keyword: "fan",
    bidAdjustment: 18.116,
    budgetStrategy: "Increase",
    isBlurred: true
  },
  {
    campaignName: "Sok | SP | New | Generic | Exact | BLDC",
    keyword: "bldc+ceiling+fan",
    bidAdjustment: 26.585,
    budgetStrategy: "Increase",
    isBlurred: true
  },
  {
    campaignName: "Sok | SP | Generic | Broad | Blade length",
    keyword: "ceiling fan 1200mm",
    bidAdjustment: 21,
    budgetStrategy: "Increase",
    isBlurred: true
  }
]

export default function CampaignOpportunities() {
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null)

  const handleApproveClick = () => {
    setShowModal(true)
  }

  const handleShowMore = () => {
    setShowDetailsModal(true)
  }

  const getStrategyTooltip = (strategy: string) => {
    return strategy === "Increase"
      ? "High Potential Bid Opportunities"
      : "Budget Efficiency Recommendations"
  }

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

        {/* Right side - Single BLDC Card */}
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[300px]">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
              {opportunities[0].name}
            </h3>
            <div className="flex items-center gap-2 mb-4 text-green-500">
              <TrendingUp size={18} />
              <span className="font-medium">{opportunities[0].spendRange}</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleApproveClick}
                className="w-full bg-amber-400 hover:bg-amber-500 !text-black font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Approve
              </button>
              <button
                onClick={handleShowMore}
                className="w-full bg-gray-200 hover:bg-gray-300 !text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Campaign Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto relative">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Campaign Name</th>
                    <th className="px-4 py-3 text-left">Keyword</th>
                    <th className="px-4 py-3 text-center">Bid Adjustment</th>
                    <th className="px-4 py-3 text-center">Budget Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignDetails.map((detail, index) => (
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
                      <td className="px-4 py-3">{detail.campaignName}</td>
                      <td className="px-4 py-3">{detail.keyword}</td>
                      <td className="px-4 py-3 text-center">
                        ₹{detail.bidAdjustment.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`
                            flex items-center justify-center gap-2 relative group
                            px-3 py-2 rounded-lg mx-2
                            ${
                              detail.budgetStrategy === "Increase"
                                ? "bg-green-50 border border-green-200"
                                : "bg-red-50 border border-red-200"
                            }
                          `}
                          onMouseEnter={() =>
                            !detail.isBlurred && setHoveredStrategy(detail.keyword)
                          }
                          onMouseLeave={() => setHoveredStrategy(null)}
                        >
                          {detail.budgetStrategy === "Increase" ? (
                            <ArrowUp className="text-black dark:text-white" size={16} />
                          ) : (
                            <ArrowDown className="text-black dark:text-white" size={16} />
                          )}
                          <span
                            className={
                              detail.budgetStrategy === "Increase"
                                ? "!text-green-600 font-medium"
                                : "!text-red-600 font-medium"
                            }
                          >
                            {detail.budgetStrategy}
                          </span>
                          {!detail.isBlurred &&
                            hoveredStrategy === detail.keyword && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1.5 text-sm !bg-orange-400 !text-black rounded-md shadow-lg whitespace-nowrap font-medium">
                                {getStrategyTooltip(detail.budgetStrategy)}
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Moved overlay outside of table and tbody - this fixes the hydration error */}
              {campaignDetails.some((detail) => detail.isBlurred) && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    top: `${
                      campaignDetails.findIndex((d) => d.isBlurred) * 56 + 56
                    }px`, // Added 56px for header height
                    height: `${
                      campaignDetails.filter((d) => d.isBlurred).length * 56
                    }px`
                  }}
                >
                  <div className="bg-gray-800/90 text-white px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm z-20">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
  )
}