"use client"
import Image from "next/image"

const outOfBudgetCampaigns = [
    "Sok | SP | BLDC | Broad | Temp",
    "Sok | SP | Generic | Broad | Blade length",
    "Sok | SP | Broad | Comp KW",
    "Sok | SP | PT | Comp | BLDC new",
    "Sok | SP | PT | Self | BLDC",
    "Sok | SP | Auto | Elio | BLDC",
]

export default function OutOfBudgetCampaigns() {
    return (
        <div className="mt-8 mb-8">
            <div className="flex items-center justify-between max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {/* Left side - Logo and Title */}
                <div className="flex items-center gap-4">
                    <Image
                        src="/Out_of_Budget.png"
                        alt="Out of Budget"
                        width={50}
                        height={50}
                        priority
                        className="dark:filter dark:invert object-contain"
                    />
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Out of Budget Campaigns
                    </h2>
                </div>

                {/* Right side - Campaign List */}
                <div className="flex-1 max-w-xl ml-8">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {outOfBudgetCampaigns.map((campaign, index) => (
                            <div
                                key={index}
                                className={`
                                    px-6 py-3
                                    ${
                                        index !== outOfBudgetCampaigns.length - 1
                                            ? "border-b border-gray-200 dark:border-gray-600"
                                            : ""
                                    }
                                    ${
                                        index % 2 === 0
                                            ? "bg-gray-50 dark:bg-gray-700"
                                            : "bg-gray-100 dark:bg-gray-600"
                                    }
                                    hover:bg-gray-200 dark:hover:bg-gray-500
                                    transition-colors duration-150
                                    text-gray-700 dark:text-gray-100
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {campaign}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}