"use client";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { useState } from "react";

type OpportunityItem = {
  name: string;
  spendRange: string;
};

const opportunities: OpportunityItem[] = [
  { name: "BLDC", spendRange: "7-10%" },
];

export default function CampaignOpportunities() {
  const [showModal, setShowModal] = useState(false);

  const handleApproveClick = () => {
    setShowModal(true);
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

        {/* Right side - Single BLDC Card */}
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[300px]">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
              {opportunities[0].name}
            </h3>
            <div className="flex items-center gap-2 mb-4 text-green-500">
              <TrendingUp size={18} />
              <span className="font-medium">Spends: {opportunities[0].spendRange}</span>
            </div>
            <button
              onClick={handleApproveClick}
              className="w-full bg-amber-400 hover:bg-amber-500 
                     !text-black font-medium py-2 px-4 rounded-lg
                     transition-colors duration-200"
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Please contact the Artha team to enable this feature
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700
                       transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
