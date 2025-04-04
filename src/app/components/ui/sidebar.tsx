"use client";

import { useState } from "react";
import { Menu, X, LogOut, CircleHelp } from "lucide-react";
import { useTheme } from '@/app/context/ThemeContext';
import { FaMoon, FaSun, FaKey,  FaArrowRight } from 'react-icons/fa';
import { GiTargeting } from "react-icons/gi";

type SidebarProps = {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
};

export default function Sidebar({ selectedTab, setSelectedTab }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-8 left-4 z-50 bg-white p-1 rounded-full shadow-md border border-gray-200"
      >
        {isOpen ? <X size={20} className="text-black" /> : <Menu size={20} className="text-black" />}
      </button>

      <div className={`h-screen flex transition-all duration-300 ${isOpen ? "ml-48" : "ml-16"}`}>
        <div
          className={`h-screen bg-white dark:bg-[#252525] shadow-lg transition-all duration-300 fixed top-0 left-0 z-10 ${
            isOpen ? "w-48" : "w-16"
          }`}
        >
          <div className="dark:bg-[#1e1e1e] rounded-2xl p-1">
          </div>

          <ul className="space-y-6 p-4 mt-16">
            <li className="py-2">
                <button
                onClick={() => setSelectedTab("asin")}
                className={`flex items-center gap-4 w-full ${
                  selectedTab === "asin" 
                  ? "text-blue-600 font-bold" 
                  : "text-gray-700 hover:text-black"
                } ${isOpen ? "" : "justify-center"}`}
                >
                {isOpen && <span>Products</span>}
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => setSelectedTab("keywordPerformance")}
                className={`flex items-center ${isOpen ? 'gap-4 justify-start' : 'justify-center'} w-full text-gray-700 hover:text-black`}
              >
                <GiTargeting size={20} />
                {isOpen && <span>Targeting</span>}
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => setSelectedTab("NegativeKeyword")}
                className={`flex items-center ${isOpen ? 'gap-2 pl-1' : 'justify-center'} w-full text-gray-700 hover:text-black`}
              >
                <FaKey size={20} />
                {isOpen && <span>Negative Keywords</span>}
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => setSelectedTab("keywordRecommendation")}
                className={`flex items-center ${isOpen ? 'gap-4 justify-start' : 'justify-center'} w-full text-gray-700 hover:text-black`}
              >
                <FaArrowRight size={20} />
                {isOpen && <span>Keyword Recommendations</span>}
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-4 w-full text-gray-700 hover:text-black dark:text-white ${
                  isOpen ? "" : "justify-center"
                }`}
              >
                {theme === 'light' ? <FaMoon size={20} /> : <FaSun size={20} className="text-yellow-400" />}
                {isOpen && <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>}
              </button>
            </li>
            <li className="py-2">
              <button
                className={`flex items-center gap-4 w-full text-gray-700 hover:text-black ${
                  isOpen ? "" : "justify-center"
                }`}
              >
                <CircleHelp size={20} />
                {isOpen && <span>Help</span>}
              </button>
            </li>

            <li className="py-2">
              <button
                className={`flex items-center gap-4 w-full text-gray-700 hover:text-black ${
                  isOpen ? "" : "justify-center"
                }`}
              >
                <LogOut size={20} />
                {isOpen && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </div>

        <div className="flex-1 p-4">
          {/* Content goes here */}
        </div>
      </div>
    </div>
  );
}
