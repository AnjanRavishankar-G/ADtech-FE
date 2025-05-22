"use client";
import { useState } from "react";
import MainSidebar from "../components/ui/mainsidebar";
import Image from "next/image";

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState(false);

  const handleDownload = () => {
    const fileId = "1k0FLVIHqCVpSjeW5UExyTauEa4pWmkkF";
    // Using direct export link
    const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Open in new tab, which will trigger the download
    window.open(downloadLink, "_blank");
  };

  return (
    <div className="flex h-screen">
      <MainSidebar
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
        selectedTab=""
        setSelectedTab={() => {}}
      />
      <main
        className={`flex-1 p-5 overflow-auto transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Logo Header Section */}
        <div className="w-full p-4 rounded-lg bg-color:[#f1f4f5]">
          <div className="relative flex items-center justify-center w-full min-h-[100px]">
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

        {/* Reports Content */}
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-6">
          {/* Date Information */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Month: May 2025
            </h2>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
              Week: 12th May - 18th May
            </h3>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg
              dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Download WBR Report
          </button>
        </div>
      </main>
    </div>
  );
}