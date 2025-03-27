"use client";
import React, { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  ArrowUpRight,
  // Plus,
  // Minus,
  Search,
} from "lucide-react";
import Layout from "../components/ui/Layout";
// import { time } from "console";

// Types for Interest Over Time
type TimeData = {
  date: string;
  [keyword: string]: string | number;
};

// Types for Geographic Comparison
type KeywordValue = {
  [keyword: string]: number;
};

type LocationData = {
  name: string;
  code: string;
  values: KeywordValue;
};

type GeographicData = {
  keywords: string[];
  locations: LocationData[];
};

// Types for Related Queries
type QueryItem = {
  query: string;
  value: string;
};

type QueryType = {
  rising?: QueryItem[];
  top?: QueryItem[];
};

type RelatedQueriesData = {
  [keyword: string]: QueryType;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// API Functions
import { createAuthenticatedFetch } from '@/utils/api';
import Cookies from 'js-cookie';

// Replace the fetchInterestOverTime function
async function fetchInterestOverTime(keywords: string[]) {
  const fetchWithAuth = createAuthenticatedFetch();
  try {
    const keywordsParam = keywords.join(",");
    const response = await fetchWithAuth(`${backendURL}/interestOverTime?q=${keywordsParam}`, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${Cookies.get('auth_token')}`,
        'Content-Type': 'application/json',
        'X-ID-Token': Cookies.get('id_token') || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers)
      });
      throw new Error(`Failed to fetch interest data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Fetched Interest Over Time Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching interest data:", error);
    throw error;
  }
}

// Replace the fetchGeographicData function
async function fetchGeographicData(keywords: string[]) {
  const fetchWithAuth = createAuthenticatedFetch();
  try {
    const keywordsParam = keywords.join(",");
    const response = await fetchWithAuth(`${backendURL}/comparedBy?q=${keywordsParam}&geo=IN`, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${Cookies.get('auth_token')}`,
        'Content-Type': 'application/json',
        'X-ID-Token': Cookies.get('id_token') || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers)
      });
      throw new Error(`Failed to fetch geographic data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Fetched Geographic Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching geographic data:", error);
    throw error;
  }
}

// Replace the fetchRelatedQueries function
async function fetchRelatedQueries(keywords: string[]) {
  const fetchWithAuth = createAuthenticatedFetch();
  try {
    const keywordsParam = keywords.join(",");
    const response = await fetchWithAuth(`${backendURL}/multiQueryRelatedQueries?keywords=${keywordsParam}`, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${Cookies.get('auth_token')}`,
        'Content-Type': 'application/json',
        'X-ID-Token': Cookies.get('id_token') || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers)
      });
      throw new Error(`Failed to fetch related queries: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Fetched Related Queries Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching related queries:", error);
    throw error;
  }
}

export default function GoogleTrendsDashboard() {
  // Add this to suppress hydration warnings from browser extensions like Grammarly
  useEffect(() => {
    // This suppresses the hydration warning about Grammarly attributes
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes('Hydration failed because')) {
        if (
          args[0]?.includes('data-new-gr-c-s-check-loaded') ||
          args[0]?.includes('data-gr-ext-installed')
        ) {
          return;
        }
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  // Common state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInputs, setKeywordInputs] = useState<string[]>(["", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interest Over Time state
  const [interestData, setInterestData] = useState<TimeData[]>([]);
  const [isLoadingInterest, setIsLoadingInterest] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);

  // Geographic Comparison state
  const [geoData, setGeoData] = useState<GeographicData | null>(null);
  const [geoCurrentPage, setGeoCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({ key: "", direction: 'descending' });
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Related Queries state
  const [queryData, setQueryData] = useState<RelatedQueriesData>({});
  const [queryType, setQueryType] = useState<"Rising" | "Top">("Rising");
  const [queryCurrentPage, setQueryCurrentPage] = useState(1);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Common settings
  const itemsPerPage = 5;

  // Handle keyword input change
  const handleKeywordChange = (index: number, value: string) => {
    const newKeywordInputs = [...keywordInputs];
    newKeywordInputs[index] = value;
    setKeywordInputs(newKeywordInputs);
  };

  // Handle search
  const handleSearch = () => {
    // Filter out empty keyword inputs
    const newKeywords = keywordInputs.filter(keyword => keyword.trim() !== "");
    
    
    if (newKeywords.length > 0) {
      setKeywords(newKeywords);
      
      // Reset pagination
      setGeoCurrentPage(1);
      setQueryCurrentPage(1);
      
      // Set default sorting to first keyword for geographic data
      if (newKeywords.length > 0) {
        setSortConfig({ key: newKeywords[0], direction: 'descending' });
      }
      
      // Load all data
      loadAllData(newKeywords);
    }
  };

  // Load all data at once
  const loadAllData = async (keys: string[]) => {
    if (keys.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load Interest Over Time data
      setIsLoadingInterest(true);
      setInterestError(null);
      try {
        const timeData = await fetchInterestOverTime(keys);
        setInterestData(timeData);
        return true;
      } catch (err) {
        setInterestError(err instanceof Error ? err.message : "An error occurred fetching interest data");
      } finally {
        setIsLoadingInterest(false);
      }
      
      // Load Geographic Comparison data
      setIsLoadingGeo(true);
      setGeoError(null);
      try {
        const geoData = await fetchGeographicData(keys);
        setGeoData(geoData);
        
      } catch (err) {
        setGeoError(err instanceof Error ? err.message : "An error occurred fetching geographic data");
      } finally {
        setIsLoadingGeo(false);
      }
      
      // Load Related Queries data
      setIsLoadingQuery(true);
      setQueryError(null);
      try {
        const queryData = await fetchRelatedQueries(keys);
        setQueryData(queryData);
      } catch (err) {
        setQueryError(err instanceof Error ? err.message : "An error occurred fetching query data");
      } finally {
        setIsLoadingQuery(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Interest Over Time Functions ----
  // Define a color palette for the lines
  const colors = ["#8884d8", "#82ca9d", "#ff7300", "#ff0000", "#0088FE"];

  // ---- Geographic Comparison Functions ----
  const handleSort = (keyword: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === keyword) {
        return {
          key: keyword,
          direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
        };
      }
      return { key: keyword, direction: 'descending' };
    });
  };

  const sortedLocations = React.useMemo(() => {
    if (!geoData?.locations) return [];
    
    const sortableItems = [...geoData.locations];
    
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a.values[sortConfig.key] || 0;
        const bValue = b.values[sortConfig.key] || 0;
        
        if (sortConfig.direction === 'ascending') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }
    
    return sortableItems;
  }, [geoData, sortConfig]);

  const paginatedGeoData = () => {
    if (!sortedLocations) return [];
    const startIndex = (geoCurrentPage - 1) * itemsPerPage;
    return sortedLocations.slice(startIndex, startIndex + itemsPerPage);
  };

  const geoTotalPages = () => {
    if (!sortedLocations) return 1;
    return Math.ceil(sortedLocations.length / itemsPerPage);
  };

  const handleGeoPageChange = (newPage: number) => {
    setGeoCurrentPage(newPage);
  };

  // Helper function to render bar chart
  const renderBarChart = (values: KeywordValue, keywords: string[]) => {
    const totalValue = keywords.reduce((sum, keyword) => sum + (values[keyword] || 0), 0);
    
    return (
      <div className="flex h-6 w-full">
        {keywords.map((keyword, idx) => {
          const value = values[keyword] || 0;
          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
          
          // Use different colors for different keywords
          const colors = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"];
          const color = colors[idx % colors.length];
          
          return (
            <div 
              key={keyword} 
              className={`${color} h-full`} 
              style={{ width: `${percentage}%` }}
              title={`${keyword}: ${value} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>
    );
  };

  // ---- Related Queries Functions ----
  const handleQueryTypeChange = (type: "Rising" | "Top") => {
    setQueryType(type);
    setQueryCurrentPage(1); // Reset to first page when changing query type
  };

  const paginatedQueryData = (keyword: string) => {
    const keywordData = queryData[keyword]?.[queryType.toLowerCase() as "rising" | "top"];
    if (!keywordData) return [];
    const startIndex = (queryCurrentPage - 1) * itemsPerPage;
    return keywordData.slice(startIndex, startIndex + itemsPerPage);
  };

  const queryTotalPages = (keyword: string) => {
    const keywordData = queryData[keyword]?.[queryType.toLowerCase() as "rising" | "top"];
    if (!keywordData) return 1;
    return Math.ceil(keywordData.length / itemsPerPage);
  };

  const handleQueryPageChange = (newPage: number) => {
    setQueryCurrentPage(newPage);
  };

  // ---- Download Functions ----
  const downloadGeoCSV = () => {
    if (!geoData) return;

    // Prepare CSV string
    const headers = ["#", "Location", "Code", ...geoData.keywords];
    const rows = sortedLocations.map((location, index) => [
      index + 1,
      location.name,
      location.code,
      ...geoData.keywords.map(keyword => location.values[keyword] || 0)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `geographic_comparison_${geoData.keywords.join("_")}.csv`;
    link.click();
  };

  const downloadQueryCSV = (keyword: string) => {
    const keywordData = queryData[keyword]?.[queryType.toLowerCase() as "rising" | "top"];
    if (!keywordData) return;

    // Prepare CSV string
    const headers = ["#", "Query", queryType === "Rising" ? "Change" : "Value"];
    const rows = keywordData.map((item, index) => [
      index + 1,
      item.query,
      item.value,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${keyword}_related_queries_${queryType.toLowerCase()}.csv`;
    link.click();
  };

  const downloadTimeCSV = () => {
    if (interestData.length === 0) return;

    // Get all keyword columns
    const keywordColumns = Object.keys(interestData[0]).filter(key => key !== "date");

    // Prepare CSV string
    const headers = ["Date", ...keywordColumns];
    const rows = interestData.map(item => [
      item.date,
      ...keywordColumns.map(keyword => item[keyword])
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `interest_over_time_${keywordColumns.join("_")}.csv`;
    link.click();
  };

  if (isLoading) return <div className="p-5">Loading all data...</div>;
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Google Trends Dashboard</h1>

        {/* Multiple Search Bars */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md dark:bg-black">
                <h2 className="text-lg font-medium mb-3">Search Keywords</h2>
                <div className="flex space-x-3 mb-4"> {/* Changed to flex and added space-x-3 for gap */}
                    {keywordInputs.map((keyword, index) => (
                        <div key={index} className="flex-grow"> {/* Added flex-grow to distribute space */}
                            <input
                                type="text"
                                className="p-3 border border-gray-300 rounded w-full dark:bg-black"
                                placeholder={`Enter keyword ${index + 1}`}
                                value={keyword}
                                onChange={(e) => handleKeywordChange(index, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center"> {/* Centered the search button */}
                    <button
                        className="px-6 py-3 flex items-center space-x-2 bg-blue-500 text-white rounded dark:bg-blue-700"
                        onClick={handleSearch}
                    >
                        <Search size={18} />
                        <span>Search</span>
                    </button>
                </div>
            </div>
        {keywords.length > 0 ? (
          <div className="space-y-8">
            {/* Interest Over Time Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-black">
              <div className="border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-medium">Interest Over Time: {keywords.join(", ")}</h2>
                <button 
                  className="px-3 py-1 flex items-center space-x-1 border rounded-md bg-white hover:bg-gray-50 dark:bg-black" 
                  onClick={() => downloadTimeCSV()}
                  disabled={interestData.length === 0}
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
              <div className="p-6">
                {isLoadingInterest ? (
                  <div className="text-center py-10">Loading interest data...</div>
                ) : interestError ? (
                  <div className="text-red-500 p-5">{interestError}</div>
                ) : interestData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={interestData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" className="dark:text-white" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      
                      {/* Dynamically generate lines for each keyword */}
                      {keywords.map((keyword, index) => (
                        <Line
                          key={keyword}
                          type="monotone"
                          dataKey={keyword}
                          stroke={colors[index % colors.length]} 
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10 text-gray-500 dark:text-white">No interest data available for the selected keywords.</div>
                )}
              </div>
            </div>

            {/* Geographic Comparison Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-black">
              <div className="border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-medium">
                  Interest by location: {keywords.join(", ")}
                </h2>
                <div className="flex items-center space-x-2">
                  <button 
                    className="px-3 py-1 flex items-center space-x-1 border rounded-md bg-white hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-900" 
                    onClick={() => downloadGeoCSV()}
                    disabled={!geoData}
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
                    <Filter size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {isLoadingGeo ? (
                  <div className="text-center py-10 dark:text-white">Loading geographic data...</div>
                ) : geoError ? (
                  <div className="text-red-500 p-5">{geoError}</div>
                ) : geoData ? (
                  <>
                    <div className="mb-3 text-sm text-gray-500 dark:text-white">
                      Sort by:
                      <div className="flex space-x-2 mt-1">
                        {geoData.keywords.map(keyword => (
                          <button 
                            key={keyword}
                            className={`px-3 py-1 border rounded-md ${sortConfig.key === keyword ? 'bg-blue-100 text-blue-800' : 'bg-white'} dark:bg-black`}
                            onClick={() => handleSort(keyword)}
                          >
                            Interest for {keyword}
                            {sortConfig.key === keyword && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-12 text-center">#</TableHead>
                          <TableHead>Location</TableHead>
                          {geoData.keywords.map(keyword => (
                            <TableHead key={keyword} className="w-24 text-right">
                              {keyword}
                            </TableHead>
                          ))}
                          <TableHead className="w-1/3">Comparison</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedGeoData().map((location, index) => (
                          <TableRow key={location.code} className="border-t">
                            <TableCell className="text-center text-gray-500">
                              {(geoCurrentPage - 1) * itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell className="font-medium">{location.name}</TableCell>
                            {geoData.keywords.map(keyword => (
                              <TableCell key={keyword} className="text-right">
                                {location.values[keyword] || 0}
                              </TableCell>
                            ))}
                            <TableCell>
                              {renderBarChart(location.values, geoData.keywords)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center p-3 text-sm text-gray-500">
                      <button
                        onClick={() => handleGeoPageChange(geoCurrentPage - 1)}
                        disabled={geoCurrentPage === 1}
                        className="flex items-center space-x-2 disabled:opacity-50"
                      >
                        <ChevronLeft size={18} />
                        <span>Previous</span>
                      </button>

                      <span>
                        Showing {(geoCurrentPage - 1) * itemsPerPage + 1}-{Math.min(geoCurrentPage * itemsPerPage, sortedLocations.length)} of {sortedLocations.length} locations
                      </span>

                      <button
                        onClick={() => handleGeoPageChange(geoCurrentPage + 1)}
                        disabled={geoCurrentPage === geoTotalPages()}
                        className="flex items-center space-x-2 disabled:opacity-50"
                      >
                        <span>Next</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-500">No geographic data available for the selected keywords.</div>
                )}
              </div>
            </div>

            {/* Related Queries Section */}
            <div>
              <h2 className="text-xl font-medium mb-4">Related Queries</h2>
              
              {isLoadingQuery ? (
                <div className="text-center py-10 bg-white rounded-lg shadow-md dark:text-white">Loading related queries data...</div>
              ) : queryError ? (
                <div className="text-red-500 p-5 bg-white rounded-lg shadow-md">{queryError}</div>
              ) : Object.keys(queryData).length > 0 ? (
                keywords.map((keyword) => (
                  <div key={keyword} className="mb-6 bg-white rounded-lg shadow-md overflow-hidden dark:bg-black">
                    <div className="border-b p-4 flex justify-between items-center">
                      <h3 className="text-lg font-medium">Related queries: {keyword}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="border rounded-md overflow-hidden flex">
                          <button
                            className={`px-3 py-1 ${queryType === "Rising" ? "bg-blue-100 text-blue-800" : "bg-white"} dark:bg-black dark:text-blue-400`}
                            onClick={() => handleQueryTypeChange("Rising")}
                          >
                            Rising
                          </button>
                          <button
                            className={`px-3 py-1 ${queryType === "Top" ? "bg-blue-100 text-blue-800" : "bg-white"} dark:bg-gray-500 dark:hover:bg-gray-900`}
                            onClick={() => handleQueryTypeChange("Top")}
                          >
                            Top
                          </button>
                        </div>
                        <button 
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900" 
                          onClick={() => downloadQueryCSV(keyword)}
                          disabled={!queryData[keyword] || !queryData[keyword][queryType.toLowerCase() as "rising" | "top"]?.length}
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      {!queryData[keyword] ? (
                        <div className="text-gray-500">No data available for this keyword</div>
                      ) : (
                        <div>
                          {paginatedQueryData(keyword).length === 0 ? (
                            <div className="text-gray-500">No {queryType.toLowerCase()} queries available</div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead className="w-12 text-center">SN</TableHead>
                                  <TableHead>Query</TableHead>
                                  <TableHead className="w-32 text-right">
                                    {queryType === "Rising" ? "Change" : "Value"}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedQueryData(keyword).map((item, index) => (
                                  <TableRow key={item.query} className="border-t">
                                    <TableCell className="text-center text-gray-500">{(queryCurrentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                    <TableCell className="font-medium">{item.query}</TableCell>
                                    <TableCell className="text-right">
                                      {queryType === "Rising" ? (
                                        <div className="flex items-center justify-end space-x-1">
                                          <span className="text-green-600">{item.value}</span>
                                          <ArrowUpRight size={16} className="text-green-600" />
                                        </div>
                                      ) : (
                                        <span>{item.value}</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}

                          {/* Pagination Controls */}
                          {paginatedQueryData(keyword).length > 0 && (
                            <div className="flex justify-between items-center p-3 text-sm text-gray-500">
                              <button
                                onClick={() => handleQueryPageChange(queryCurrentPage - 1)}
                                disabled={queryCurrentPage === 1}
                                className="flex items-center space-x-2 disabled:opacity-50"
                              >
                                <ChevronLeft size={18} />
                                <span>Previous</span>
                              </button>

                              <span>
                                Showing {(queryCurrentPage - 1) * itemsPerPage + 1}-
                                {Math.min(
                                  queryCurrentPage * itemsPerPage,
                                  queryData[keyword][queryType.toLowerCase() as "rising" | "top"]?.length || 0
                                )} of {queryData[keyword][queryType.toLowerCase() as "rising" | "top"]?.length || 0} queries
                              </span>

                              <button
                                onClick={() => handleQueryPageChange(queryCurrentPage + 1)}
                                disabled={queryCurrentPage === queryTotalPages(keyword)}
                                className="flex items-center space-x-2 disabled:opacity-50"
                              >
                                <span>Next</span>
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-md">No related queries data available for the selected keywords.</div>
              )}
            </div>
          </div>
        ) : (
          // Initial state - no search performed yet
          <div className="bg-white p-6 rounded-lg shadow-md text-center dark:bg-black">
            <p className="text-gray-500 dark:text-white">Enter keywords and click Search to view Google Trends data.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}