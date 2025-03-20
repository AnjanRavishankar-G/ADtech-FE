import React, { useState } from "react";
import { useTheme } from '@/app/context/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import { GiOctopus } from "react-icons/gi";
import { Handshake, CircleHelp, Home, LogOut, ChevronLeft, ChevronRight, ChevronDown} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [showTeams, setShowTeams] = useState(false);
  const [showShastra, setShowShastra] = useState(false);

  return (
    <div
      className={`transition-all duration-300 fixed left-0 top-0 h-screen bg-white shadow-lg z-10 dark:text-white dark:bg-[#252525] ${
        collapsed ? "w-16" : "w-48"
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
        {/* Section 1: Home and Search */}
        <div className="p-4">
          <ul className="space-y-6">
            <li>
              <a href="/brand" className={`flex items-center gap-3 text-gray-700 hover:text-black ${collapsed ? "justify-center" : ""}`}>
                <Home size={20} className="text-gray-700 dark:text-white" />
                {!collapsed && <span>Home</span>}
              </a>
            </li>
            <li>
              <button
                className={`flex items-center gap-3 w-full text-gray-700 hover:text-black ${collapsed ? "justify-center" : ""}`}
                onClick={() => setShowShastra(!showShastra)}
              >
                <GiOctopus  size={20} className="text-gray-700 dark:text-white" />
                {!collapsed && <span>Lighthouse</span>}
                {!collapsed && <ChevronDown size={16} className={`transition-transform ${showShastra ? 'rotate-180' : ''} dark:text-white`} />}
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
                  <li>
                    <a href="#" className="text-gray-900 hover:text-black dark:text-white">
                      You-tube Trends
                    </a>
                  </li>
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
                  <li><a href="/teams/team2" className="text-gray-600 hover:text-black dark:text-white">Team 2</a></li>
                  <li><a href="/teams/team3" className="text-gray-600 hover:text-black dark:text-white">Team 3</a></li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Section 3: Dark Mode, Help, Logout */}
        <div className="p-4 border-t border-gray-200">
          <ul className="space-y-6">
            <li>
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                className={`flex items-center gap-3 text-gray-700 hover:text-black ${collapsed ? "justify-center" : ""}`}
              >
                {theme === 'light' ? <FaMoon size={20} /> : <FaSun size={20} className="text-yellow-400" />}
                {!collapsed && <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>}
              </button>
            </li>
            <li>
              <a href="/help" className={`flex items-center gap-3 text-gray-700 hover:text-black ${collapsed ? "justify-center" : ""}`}>
                <CircleHelp size={20} className="text-gray-700 dark:text-white"/>
                {!collapsed && <span>Help</span>}
              </a>
            </li>
            <li>
              <a href="/logout" className={`flex items-center text-gray-700 hover:text-black ${collapsed ? "justify-center" : ""}`}>
                <LogOut size={20} className="text-gray-700 dark:text-white"/>
                {!collapsed && <span>Logout</span>}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
