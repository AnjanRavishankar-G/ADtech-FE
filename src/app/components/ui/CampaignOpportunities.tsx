"use client";
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';
import { useState } from 'react';

type OpportunityItem = {
  name: string;
  spendRange: string;
};

const opportunities: OpportunityItem[] = [
  { name: 'BLDC', spendRange: '7-10%' },
  { name: 'Water Purifier', spendRange: '7-10%' },
  { name: 'ES', spendRange: '5-7%' },
];

export default function CampaignOpportunities() {
  const [showModal, setShowModal] = useState(false);

  const handleApproveClick = () => {
    setShowModal(true);
  };

  return (
    <div className="mt-12 mb-8">
      {/* Header with logo and text */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Image
          src="/campaign_opportunities.png"
          alt="Campaign Opportunities"
          width={40}
          height={40}
          priority
          className="dark:filter dark:invert object-contain"
        />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Campaign Opportunities
        </h2>
      </div>

      {/* Opportunities cards container */}
      <div className="flex flex-wrap justify-center gap-6">
        {opportunities.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 
                     min-w-[280px] transition-transform hover:scale-105
                     border border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-medium text-gray-800 dark:text-white">
                {index + 1}. {item.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 mb-4 text-green-500">
              <TrendingUp size={18} />
              <span className="font-medium">Spends: {item.spendRange}</span>
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
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notice
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Please Contact the Artha Team to enable this Feature
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