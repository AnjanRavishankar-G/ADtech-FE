import React, { useState } from "react";
import Sidebar from "./mainsidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 flex-1 p-6 ${
          collapsed ? "ml-16" : "ml-48"
        }  overflow-x-hidden`}
      >
      <div className="p-4 w-full">
          {children}
        </div>
        </div>
    </div>
  );
};

export default Layout;
