"use client";
import React, { useState } from "react";
import { useTheme } from '@/app/context/ThemeContext';
import { FaMoon, FaSun, FaKey } from 'react-icons/fa';
import { GiOctopus, GiTargeting } from "react-icons/gi";
import { Handshake, Home, LogOut, ChevronLeft, ChevronRight, ChevronDown, Package2, Settings } from "lucide-react";
import { usePathname } from 'next/navigation';
// import Image from 'next/image';
interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  toggleSidebar, 
  selectedTab,
  setSelectedTab 
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showTeams, setShowTeams] = useState(false);
  const [showShastra, setShowShastra] = useState(false);
  const [showProducts, setShowProducts] = useState(true); // Start expanded
  const [showSettings, setShowSettings] = useState(false);
  const pathname = usePathname();
  const isAdGroupPage = pathname?.includes('/adGroupDetails');

  return (
    <div
      className={`transition-all duration-300 fixed left-0 top-0 h-screen bg-white shadow-lg z-10 dark:text-white dark:bg-[#252525] ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 bg-white rounded-full p-1 shadow-md border border-gray-200 z-20 dark:bg-[#252525]"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex flex-col h-full justify-between">
        <div className="p-4">
          <ul className="space-y-4">
            <li>
              <a 
                href="/brand" 
                className={`flex items-center gap-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <Home size={20} />
                {!collapsed && <span>Home</span>}
              </a>
            </li>

            {/* Products Dropdown - Only show on adGroup pages */}
            {isAdGroupPage && (
              <li>
                <button
                  onClick={() => setShowProducts(!showProducts)}
                  className={`flex items-center gap-3 w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 ${
                    collapsed ? "justify-center" : "justify-between"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package2 size={20} />
                    {!collapsed && <span>Products</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showProducts ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
                {!collapsed && showProducts && (
                  <ul className="mt-2 ml-6 space-y-2">
                    <li>
                      <button 
                        onClick={() => setSelectedTab('keywordPerformance')}
                        className={`flex items-center gap-2 p-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white w-full ${
                          selectedTab === 'keywordPerformance' 
                            ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-gray-600 hover:text-black dark:text-gray-300"
                        }`}
                      >
                        <GiTargeting size={20} />
                        <span>Targeting</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setSelectedTab('NegativeKeyword')}
                        className={`flex items-center gap-2 p-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white w-full ${
                          selectedTab === 'NegativeKeyword' 
                            ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-gray-600 hover:text-black dark:text-gray-300"
                        }`}
                      >
                        <FaKey size={16} />
                        <span>Negative Keywords</span>
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            )}

            <li>
              <button
                onClick={() => setShowShastra(!showShastra)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 ${
                  collapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GiOctopus size={20} />
                  {!collapsed && <span>Lighthouse</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showShastra ? "rotate-180" : ""}`}
                  />
                )}
              </button>
              {!collapsed && showShastra && (
                <ul className="ml-6 mt-2 space-y-2">
                  <li>
                    <a href="/googleTrends" className="text-gray-900 hover:text-black dark:text-white">
                      Search Trends
                    </a>
                  </li>
                  <li>
                    <a href="/research" className="text-gray-900 hover:text-black dark:text-white">
                      Retail Insights
                    </a>
                  </li>
                  {/* <li>
                    <a href="#" className="text-gray-900 hover:text-black dark:text-white">
                      You-tube Trends
                    </a>
                  </li> */}
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Section 2: Teams with Dropdown */}
        <div className="p-4 border-t border-gray-200">
          <ul className="space-y-6">
            <li>
              <button
                className={`flex items-center gap-3 w-full text-gray-700 hover:text-black ${collapsed ? "justify-center" : ""}`}
                onClick={() => setShowTeams(!showTeams)}
              >
                <Handshake size={20} className="text-gray-700 dark:text-white" />
                {!collapsed && <span>Teams</span>}
                {!collapsed && <ChevronDown size={16} className={`transition-transform ${showTeams ? 'rotate-180' : ''}dark:text-white`} />}
              </button>
              {!collapsed && showTeams && (
                <ul className="ml-6 mt-2 space-y-2">
                  <li><a href="/teams/team1" className="text-gray-600 hover:text-black dark:text-white">Team 1</a></li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Section 3: Settings Dropdown */}
        <div className="p-4 border-t border-gray-200">
          <ul className="space-y-6">
            <li>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 ${
                  collapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-gray-700 dark:text-white" />
                  {!collapsed && <span>Settings</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showSettings ? "rotate-180" : ""}`}
                  />
                )}
              </button>
              {!collapsed && showSettings && (
                <ul className="mt-2 ml-6 space-y-2">
                  <li>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 p-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white w-full"
                    >
                      {theme === 'light' ? 
                        <FaMoon size={16} /> : 
                        <FaSun size={16} className="text-yellow-400" />
                      }
                      <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                    </button>
                  </li>
                  <li>
                    <a 
                      href="/login"
                      className="flex items-center gap-2 p-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
