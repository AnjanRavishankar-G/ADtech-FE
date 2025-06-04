"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import Layout from "../components/ui/Layout";
import { LoadingMessages } from "../components/ui/LoadingMessages";
import { AnimatePresence, motion } from "framer-motion";

import Cookies from "js-cookie";
// import { useRouter } from 'next/navigation';

// Types for Interest Over Time
type TimeData = {
  date: string;
  [keyword: string]: string | number;
};

// Add this type definition near your other types
type TimeSeriesItem = {
  date: string;
  [key: string]: string | number;
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

// Add new types
// type DateRangeOption = '30D' | '90D' | '180D' | '1Y' | 'ALL';

type CombinedData = {
  interestData: TimeData[];
  geoData: GeographicData;
  queryData: RelatedQueriesData;
};

// type GeoVisualizationData = {
//   name: string;
//   value: number;
//   percentage: number;
// };

// First, add a type for the lowercase query types
type QueryTypeLowerCase = "rising" | "top";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Update the keyword formatting function
function formatKeywords(keywords: string[]): string {
  return keywords
    .map((k) => k.trim()) // Just trim, don't remove spaces within keywords
    .filter((k) => k) // Remove empty strings
    .join(",");
}

// Fix the validateKeywords function
async function validateKeywords(inputString: string): Promise<string[]> {
  try {
    // First split the input string into an array of keywords
    const keywords = inputString
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);

    const response = await fetch(`${backendURL}/validate-keywords`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("auth_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keywords }),
    });

    if (!response.ok) {
      throw new Error("Failed to validate keywords");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Validation failed");
    }

    return data.corrected;
  } catch (error) {
    console.error("Error validating keywords:", error);
    throw error;
  }
}

// Update the fetch functions
async function fetchInterestOverTime(keywords: string[]) {
  try {
    // 1. Initiate request
    const initResponse = await fetch(
      `${backendURL}/interest-over-time/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords: formatKeywords(keywords) }),
      }
    );

    if (!initResponse.ok) {
      throw new Error(`Failed to initiate request: ${initResponse.status}`);
    }

    const { requestId } = await initResponse.json();
    const startTime = Date.now();
    const MAX_TIME = 240000; // 4 minutes

    // 2. Poll for results
    while (Date.now() - startTime < MAX_TIME) {
      const statusResponse = await fetch(
        `${backendURL}/interest-over-time/status/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("auth_token")}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to check status: ${statusResponse.status}`);
      }

      const result = await statusResponse.json();

      switch (result.status) {
        case "completed":
          return result.data;
        case "error":
          throw new Error(result.error);
        default:
          await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    throw new Error("Request timed out");
  } catch (error) {
    console.error("Error fetching interest data:", error);
    throw error;
  }
}

// Similarly update fetchRelatedQueries
async function fetchRelatedQueries(keywords: string[]) {
  try {
    // 1. Initiate request
    const initResponse = await fetch(
      `${backendURL}/multi-query-related/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords: formatKeywords(keywords) }),
      }
    );

    if (!initResponse.ok) {
      throw new Error(`Failed to initiate request: ${initResponse.status}`);
    }

    const { requestId } = await initResponse.json();
    const startTime = Date.now();
    const MAX_TIME = 240000;

    // 2. Poll for results
    while (Date.now() - startTime < MAX_TIME) {
      const statusResponse = await fetch(
        `${backendURL}/multi-query-related/status/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("auth_token")}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to check status: ${statusResponse.status}`);
      }

      const result = await statusResponse.json();

      switch (result.status) {
        case "completed":
          return result.data;
        case "error":
          throw new Error(result.error);
        default:
          await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    throw new Error("Request timed out");
  } catch (error) {
    console.error("Error fetching related queries:", error);
    throw error;
  }
}

// Update fetchGeographicData in page.tsx
async function fetchGeographicData(
  keywords: string[]
): Promise<GeographicData> {
  const MAX_POLLING_TIME = 240000; // 4 minutes
  const MIN_POLL_INTERVAL = 3000; // 3 seconds
  const MAX_POLL_INTERVAL = 15000; // 15 seconds
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let pollInterval = MIN_POLL_INTERVAL;

  try {
    // 1. Initiate request
    const initResponse = await fetch(`${backendURL}/compared-by/initiate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("auth_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keywords: formatKeywords(keywords) }),
    });

    if (!initResponse.ok) {
      throw new Error(`Failed to initiate request: ${initResponse.status}`);
    }

    const { requestId } = await initResponse.json();
    const startTime = Date.now();

    // 2. Poll for results with exponential backoff
    while (Date.now() - startTime < MAX_POLLING_TIME) {
      try {
        const statusResponse = await fetch(
          `${backendURL}/compared-by/status/${requestId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("auth_token")}`,
            },
          }
        );

        if (!statusResponse.ok) {
          throw new Error(`Failed to check status: ${statusResponse.status}`);
        }

        const result = await statusResponse.json();

        switch (result.status) {
          case "completed":
            return result.data;
          case "error":
            if (
              (result.error?.includes("503") ||
                result.error?.includes("try again later") ||
                result.error?.includes("timeout")) &&
              retryCount < MAX_RETRIES
            ) {
              retryCount++;
              pollInterval = Math.min(pollInterval * 1.5, MAX_POLL_INTERVAL);
              await new Promise((resolve) => setTimeout(resolve, pollInterval));
              continue;
            }
            throw new Error(result.error || "Processing failed");
          case "pending":
          case "processing":
            if (Date.now() - startTime > 180000) {
              // 3 minutes
              pollInterval = MAX_POLL_INTERVAL;
            } else {
              pollInterval = Math.min(pollInterval * 1.2, MAX_POLL_INTERVAL);
            }
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            break;
        }
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
          continue;
        }
        throw error;
      }
    }

    throw new Error("Request timed out");
  } catch (error) {
    console.error("Error fetching geographic data:", error);
    throw error;
  }
}

// Update the fetchAIAnalysis function
async function fetchAIAnalysis(combinedData: CombinedData) {
  try {
    const response = await fetch(`${backendURL}/trend-analysis`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("auth_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interest_data: combinedData.interestData,
        geographic_data: combinedData.geoData,
        query_data: combinedData.queryData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to fetch AI analysis: ${response.status}`
      );
    }
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    throw error;
  }
}

// Add this constant at the top of your file
const LOADING_MESSAGES = [
  {
    text: "Surfing the Swell of Search...",
    emoji: "🌊",
  },
  {
    text: "We're currently deep-diving through a sea of keywords,",
    emoji: "🐠",
  },
  {
    text: "decoding mysterious spikes, and fending off rogue trending terms.",
    emoji: "🐠",
  },
  {
    text: "Our manta scouts are mapping the tides of intent, so you can ride the next big wave before your competition even waxes their board.",
    emoji: "🏄‍♂️",
  },
  {
    text: "Give us a few seconds while we fish out the real gold from the abyss—because nobody has time for irrelevant queries in Q2",
    emoji: "😅",
  },
  {
    text: "Reeling in real-time search trends… hang tight.",
    emoji: "🎣",
  },
];

// Add this helper function near the top with other utility functions
const parseDateString = (
  dateStr: string
): { startDate: Date; endDate: Date } => {
  // Remove extra spaces and normalize the date string
  const normalizedStr = dateStr.replace(/\s+/g, " ").trim();
  console.log("Normalized date string:", normalizedStr);

  // Extract years
  const years = normalizedStr.match(/\d{4}/g) || [];
  const startYear = years[0] || new Date().getFullYear();
  const endYear = years[1] || startYear;

  // Extract months and days
  const monthDayMatch = normalizedStr.match(/([A-Za-z]+)\s+(\d+)/g);
  const startMonthDay = monthDayMatch ? monthDayMatch[0] : "";
  const endMonthDay =
    monthDayMatch && monthDayMatch[1] ? monthDayMatch[1] : startMonthDay;

  // Create date objects
  const startDate = new Date(`${startMonthDay}, ${startYear}`);
  const endDate = new Date(`${endMonthDay}, ${endYear}`);

  console.log("Parsed dates:", { startDate, endDate });
  return { startDate, endDate };
};

// Add this helper function to determine if we should show months only
const shouldShowMonthsOnly = (dates: TimeData[]): boolean => {
  if (dates.length <= 7) return false; // Show individual dates for 7 or fewer data points

  // Get unique months in the dataset
  const uniqueMonths = new Set(
    dates.map((date) => {
      const { startDate } = parseDateString(date.date);
      return startDate.getMonth();
    })
  );

  // If we have more than 4 unique months, show months only
  return uniqueMonths.size > 4;
};

// Update the formatDateLabel function
const formatDateLabel = (
  dateStr: string,
  index: number,
  dates: TimeData[]
): string => {
  const { startDate } = parseDateString(dateStr);
  const month = startDate.toLocaleString("default", { month: "short" });
  const day = startDate.getDate();

  // If we should show months only
  if (shouldShowMonthsOnly(dates)) {
    // Only show the month label for the first occurrence of each month
    const isFirstOccurrenceOfMonth =
      index === 0 ||
      parseDateString(dates[index - 1].date).startDate.getMonth() !==
        startDate.getMonth();

    return isFirstOccurrenceOfMonth ? month : "";
  }

  // For shorter ranges, show individual dates
  return `${month} ${day}`;
};

export default function GoogleTrendsDashboard() {
  // Common state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputKeyword, setInputKeyword] = useState<string>("");
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
    direction: "ascending" | "descending";
  }>({ key: "", direction: "descending" });
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Related Queries state
  const [queryData, setQueryData] = useState<RelatedQueriesData>({});
  const [queryType, setQueryType] = useState<"Rising" | "Top">("Top"); // Change default to "Top"
  const [queryCurrentPage, setQueryCurrentPage] = useState(1);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Add to existing state declarations
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // const [showCities, setShowCities] = useState(false);
  // const [geoChartData, setGeoChartData] = useState<GeoVisualizationData[]>([]);

  // New state for date range
  // const [selectedRange, setSelectedRange] = useState<DateRangeOption>('30D');
  // const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Add this type for the slider state
  type DateRangeSlider = {
    start: number;
    end: number;
  };

  // Add to your component's state declarations
  const [sliderRange, setSliderRange] = useState<DateRangeSlider>({
    start: 45,
    end: 100,
  });

  // Common settings
  const itemsPerPage = 5;

  // Modify the handleSearch function
  const handleSearch = async () => {
    if (inputKeyword.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        // Pass the string directly to validateKeywords
        const validatedKeywords = await validateKeywords(inputKeyword);

        // If keywords were corrected, show notification
        const originalKeywords = inputKeyword.split(",").map((k) => k.trim());
        const hasCorrections = validatedKeywords.some(
          (k, i) => k !== originalKeywords[i]
        );

        if (hasCorrections) {
          const confirmed = window.confirm(
            `Some keywords were corrected:\n${originalKeywords
              .map((ok, i) =>
                ok !== validatedKeywords[i]
                  ? `${ok} → ${validatedKeywords[i]}`
                  : null
              )
              .filter(Boolean)
              .join("\n")}\n\nDo you want to use the corrected keywords?`
          );

          if (!confirmed) {
            setIsLoading(false);
            return;
          }
        }

        // Update state with validated keywords
        setKeywords(validatedKeywords);
        setInputKeyword(validatedKeywords.join(", "));

        // Reset pagination
        setGeoCurrentPage(1);
        setQueryCurrentPage(1);

        if (validatedKeywords.length > 0) {
          setSortConfig({
            key: validatedKeywords[0],
            direction: "descending",
          });
        }

        // Load all data with validated keywords
        await loadAllData(validatedKeywords);
      } catch (error) {
        setError(
          typeof error === "string" ? error : "Error processing keywords"
        );
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // First, add this new state to track individual data availability
  const [dataAvailability, setDataAvailability] = useState({
    interestOverTime: false,
    relatedQueries: false,
    geographic: false,
    analysis: false,
  });

  // Then, replace the existing loadAllData function with this version
  const loadAllData = async (keys: string[]) => {
    try {
      // Reset states
      setIsLoading(true);
      setError(null);
      setAiAnalysis(null);
      setAiError(null);
      setDataAvailability({
        interestOverTime: false,
        relatedQueries: false,
        geographic: false,
        analysis: false,
      });

      // Initialize all loading states
      setIsLoadingInterest(true);
      setIsLoadingGeo(true);
      setIsLoadingQuery(true);

      // Load each endpoint independently
      const loadTimeSeriesData = async () => {
        try {
          const timeData = await fetchInterestOverTime(keys);
          const processed = processTimeSeriesData(timeData);
          setInterestData(processed);
          setInterestError(null);
          setDataAvailability((prev) => ({
            ...prev,
            interestOverTime: true,
          }));
          return processed;
        } catch (error) {
          setInterestError(
            error instanceof Error ? error.message : "Error loading time series"
          );
          return null;
        } finally {
          setIsLoadingInterest(false);
        }
      };

      const loadRelatedQueriesData = async () => {
        try {
          const queryData = await fetchRelatedQueries(keys);
          setQueryData(queryData);
          setQueryError(null);
          setDataAvailability((prev) => ({
            ...prev,
            relatedQueries: true,
          }));
          return queryData;
        } catch (error) {
          setQueryError(
            error instanceof Error ? error.message : "Error loading queries"
          );
          return null;
        } finally {
          setIsLoadingQuery(false);
        }
      };

      const loadGeographicData = async () => {
        try {
          const geoData = await fetchGeographicData(keys);
          setGeoData(geoData);
          setGeoError(null);
          setDataAvailability((prev) => ({
            ...prev,
            geographic: true,
          }));
          return geoData;
        } catch (error) {
          setGeoError(
            error instanceof Error
              ? error.message
              : "Error loading geographic data"
          );
          return null;
        } finally {
          setIsLoadingGeo(false);
        }
      };

      // Start all requests in parallel
      const [timeSeriesPromise, queriesPromise, geoPromise] = [
        loadTimeSeriesData(),
        loadRelatedQueriesData(),
        loadGeographicData(),
      ];

      // Monitor completion of initial endpoints
      Promise.all([timeSeriesPromise, queriesPromise, geoPromise]).then(
        async ([timeData, queryData, geoData]) => {
          if (timeData && queryData && geoData) {
            setIsLoadingAI(true);
            try {
              const analysis = await fetchAIAnalysis({
                interestData: timeData,
                geoData,
                queryData,
              });
              setAiAnalysis(analysis);
              setAiError(null);
              setDataAvailability((prev) => ({
                ...prev,
                analysis: true,
              }));
            } catch (error) {
              setAiError(
                error instanceof Error
                  ? error.message
                  : "Error loading analysis"
              );
            } finally {
              setIsLoadingAI(false);
            }
          }
        }
      );

      // Show main content as soon as any data is available
      setIsLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    }
  };

  // Load all data at once
  // const loadAllData = async (keys: string[]) => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     setAiAnalysis(null);
  //     setAiError(null);

  //     // Set all loading states
  //     setIsLoadingInterest(true);
  //     setIsLoadingGeo(true);
  //     setIsLoadingQuery(true);

  //     // Load all data in parallel
  //     const [timeData, geoData, queryData] = await Promise.all([
  //       fetchInterestOverTime(keys),
  //       fetchGeographicData(keys),
  //       fetchRelatedQueries(keys),
  //     ]);

  //     // Process time series data before setting state
  //     const processed30DayData = processTimeSeriesData(timeData);
  //     setInterestData(processed30DayData);

  //     // Set individual data states
  //     setGeoData(geoData);
  //     setQueryData(queryData);

  //     // Clear any previous errors
  //     setInterestError(null);
  //     setGeoError(null);
  //     setQueryError(null);

  //     // If all data is loaded successfully, fetch AI analysis
  //     setIsLoadingAI(true);
  //     const combinedData: CombinedData = {
  //       interestData: processed30DayData,
  //       geoData: geoData,
  //       queryData: queryData,
  //     };

  //     const analysis = await fetchAIAnalysis(combinedData);
  //     setAiAnalysis(analysis);
  //     setAiError(null);
  //   } catch (err) {
  //     const errorMessage =
  //       err instanceof Error ? err.message : "An error occurred";
  //     setError(errorMessage);
  //     setAiError(errorMessage);
  //     setInterestError(errorMessage);
  //     setGeoError(errorMessage);
  //     setQueryError(errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //     setIsLoadingAI(false);
  //     setIsLoadingInterest(false);
  //     setIsLoadingGeo(false);
  //     setIsLoadingQuery(false);
  //   }
  // };

  // Add getFilteredInterestData here, after loadAllData and before Interest Over Time Functions
  const getFilteredInterestData = () => {
    console.log("Current interest data:", interestData);
    console.log("Current slider range:", sliderRange);
    if (!interestData.length) return [];
    const filtered = interestData.slice(sliderRange.start, sliderRange.end);
    console.log("Filtered interest data:", filtered);
    return filtered;
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
          direction:
            prevConfig.direction === "ascending" ? "descending" : "ascending",
        };
      }
      return { key: keyword, direction: "descending" };
    });
  };

  const sortedLocations = React.useMemo(() => {
    if (!geoData?.locations) return [];

    const sortableItems = [...geoData.locations];

    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a.values[sortConfig.key] || 0;
        const bValue = b.values[sortConfig.key] || 0;

        if (sortConfig.direction === "ascending") {
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

  // ---- Related Queries Functions ----
  const handleQueryTypeChange = (type: "Rising" | "Top") => {
    setQueryType(type);
  };

  // Update the paginatedQueryData function
  const paginatedQueryData = (keyword: string) => {
    const keywordData = queryData[keyword];
    if (!keywordData) return [];

    const type = queryType.toLowerCase() as QueryTypeLowerCase;
    const queryTypeData = keywordData[type];
    if (!queryTypeData || !Array.isArray(queryTypeData)) {
      console.log("No data found for:", keyword, type);
      return [];
    }

    const startIndex = (queryCurrentPage - 1) * itemsPerPage;
    return queryTypeData.slice(startIndex, startIndex + itemsPerPage);
  };

  // Also update the queryTotalPages function
  const queryTotalPages = (keyword: string) => {
    const keywordData = queryData[keyword];
    if (!keywordData) return 1;

    const type = queryType.toLowerCase() as QueryTypeLowerCase;
    const queryTypeData = keywordData[type];
    if (!queryTypeData || !Array.isArray(queryTypeData)) return 1;

    return Math.ceil(queryTypeData.length / itemsPerPage);
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
      ...geoData.keywords.map((keyword) => location.values[keyword] || 0),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `geographic_comparison_${geoData.keywords.join("_")}.csv`;
    link.click();
  };

  const downloadQueryCSV = (keyword: string) => {
    const keywordData =
      queryData[keyword]?.[queryType.toLowerCase() as QueryTypeLowerCase];
    if (!keywordData) return;

    // Prepare CSV string
    const headers = [
      "#",
      "Query",
      queryType === "Rising" ? "Change" : "Index Search Interest",
    ];
    const rows = keywordData.map((item, index) => [
      index + 1,
      item.query,
      queryType === "Rising" ? item.value : item.value,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${keyword}_related_queries.csv`;
    link.click();
  };

  const downloadTimeCSV = () => {
    if (interestData.length === 0) return;

    // Get all keyword columns
    const keywordColumns = Object.keys(interestData[0]).filter(
      (key) => key !== "date"
    );

    // Prepare CSV string
    const headers = ["Date", ...keywordColumns];
    const rows = interestData.map((item) => [
      item.date,
      ...keywordColumns.map((keyword) => item[keyword]),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `interest_over_time_${keywordColumns.join("_")}.csv`;
    link.click();
  };

  // First, ensure the TrendAnalysis type exactly matches the Python output
  type TrendAnalysis = {
    topPerformingGeos: {
      states: Array<{
        name: string;
        values: Record<string, number>;
        totalScore: number;
        growthRate: number;
        significantQueries: string[];
      }>;
    };
    temporalInsights: {
      trendDirection: "increasing" | "decreasing" | "stable";
      seasonality: {
        peaks: string[];
        troughs: string[];
      };
      recentTrend: {
        last30Days: "up" | "down" | "stable";
        percentageChange: number;
      };
      forecastNextQuarter: "up" | "down" | "stable";
    };
    audiencePersonas: {
      segments: Array<{
        name: string;
        percentage: number;
        primaryInterests: string[];
        searchBehavior: {
          peakTimes: string[];
          topQueries: string[];
          relatedTerms: string[];
        };
        keyInsight: string;
      }>;
    };
    competitiveAnalysis: {
      keywordComparison: Array<{
        keyword: string;
        relativeStrength: number;
        growthTrend: "up" | "down" | "stable";
        uniqueQueries: string[];
      }>;
    };
    dataQuality: {
      confidenceScore: number;
      dataGaps: string[];
      sampleSize: "high" | "medium" | "low";
    };
  };

  const AIAnalysisSection = () => {
    if (isLoadingAI) {
      return (
        <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      );
    }

    if (aiError) {
      return (
        <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-8">
          <div className="text-red-500">
            Error loading AI analysis: {aiError}
          </div>
        </div>
      );
    }

    if (!aiAnalysis) return null;

    let analysis: TrendAnalysis;
    try {
      analysis =
        typeof aiAnalysis === "string"
          ? JSON.parse(aiAnalysis)
          : (aiAnalysis as TrendAnalysis);

      // Add check for states data
      if (!analysis.topPerformingGeos?.states?.length) {
        return (
          <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Artha Deep Dive Analysis
            </h2>
            <div className="text-center py-6 text-gray-500">
              No geographic analysis data available for these keywords.
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error("Error parsing analysis data:", error);
      return null;
    }

    return (
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Artha Deep Dive Analysis
        </h2>

        {/* Top Performing Geos Bar Chart */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            Top Performing Geos by State
          </h3>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={analysis.topPerformingGeos.states}
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 30,
              }}
              barSize={25} // Slightly larger bar width
              barGap={3} // Minimal space between bars in same group
              barCategoryGap={20} // Smaller space between different categories
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={100}
                tick={{
                  fill: "var(--text-primary, currentColor)",
                  fontSize: 12,
                }}
              />
              <YAxis
                label={{
                  value: "Index Search Interest",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "var(--text-primary, currentColor)",
                    fontSize: 18,
                  },
                }}
                tick={{
                  fill: "var(--text-primary, currentColor)",
                  fontSize: 12,
                }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                contentStyle={{
                  backgroundColor: "var(--background, #fff)",
                  borderRadius: "8px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={60}
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "16px",
                }}
              />
              {Object.keys(analysis.topPerformingGeos.states[0].values).map(
                (keyword, index) => (
                  <Bar
                    key={keyword}
                    dataKey={`values.${keyword}`}
                    name={keyword}
                    fill={colors[index % colors.length]}
                    radius={[4, 4, 0, 0]}
                  >
                    {analysis.topPerformingGeos.states.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={colors[index % colors.length]}
                        style={{
                          filter: "brightness(1.1)",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ))}
                  </Bar>
                )
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Add this component before the Related Queries table section
  const RelatedQueriesVisualization = () => {
    const [selectedKeyword, setSelectedKeyword] = useState(keywords[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Process data for visualization
    const getVisualizationData = (keyword: string) => {
      const keywordData =
        queryData[keyword]?.[queryType.toLowerCase() as QueryTypeLowerCase] ||
        [];
      return keywordData
        .slice(0, 15) // Show top 15 queries
        .map((item) => ({
          query: item.query,
          value: parseFloat(item.value.replace(/[^0-9.]/g, "")) || 0,
        }))
        .sort((a, b) => b.value - a.value);
    };

    const chartData = getVisualizationData(selectedKeyword);

    return (
      <div className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden mb-8">
        <div className="border-b p-4">
          <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
            Movers and Shakers
          </h2>

          {/* Improved Dropdown */}
          <div className="relative inline-block w-auto">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white w-[250px]"
            >
              <span className="truncate">{selectedKeyword}</span>
              <ChevronDown size={16} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-[250px] bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                {keywords.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => {
                      setSelectedKeyword(keyword);
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white truncate"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={600}>
              <BarChart
                data={chartData}
                margin={{
                  top: 40,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="query"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={100} // Increased height
                  tickSize={8}
                  tick={{
                    fontSize: 16,
                    fill: "var(--text-primary, currentColor)",
                    fontWeight: 500,
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: "var(--text-secondary, #6b7280)",
                    fontWeight: 500,
                  }}
                  tickFormatter={(value) => `${value}%`}
                  label={{
                    value: "Index Search Interest",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "var(--text-primary, currentColor)",
                      fontSize: 18,
                    },
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                  contentStyle={{
                    backgroundColor: "var(--background, #fff)",
                    borderColor: "var(--border, #e2e8f0)",
                    borderRadius: "8px",
                    padding: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                  formatter={(value) => [`Score: ${value}`, selectedKeyword]}
                  labelStyle={{
                    color: "var(--text-primary, currentColor)",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]} // Increased radius
                  fill="#8884d8" // Single color for all bars
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="#8884d8" // Same color as parent Bar
                      style={{
                        filter: "brightness(1.1)",
                        transition: "filter 0.2s",
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No visualization data available
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add this new component for the date range controls
  const DateRangeControls = () => {
    return (
      <div className="flex flex-col space-y-4 mb-4">
        {/* Single slider for date range */}
        <div className="px-4 w-full">
          <input
            type="range"
            min={0}
            max={interestData.length}
            value={sliderRange.start}
            onChange={(e) => {
              const newStart = parseInt(e.target.value);
              setSliderRange((prev) => ({
                start: Math.min(newStart, prev.end - 1),
                end: prev.end,
              }));
            }}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  // Update the formatDateRange function
  const formatDateRange = (dates: TimeData[]): string => {
    console.log("Formatting date range for dates:", dates);
    if (!dates.length) return "";

    const firstDate = parseDateString(dates[0].date);
    const lastDate = parseDateString(dates[dates.length - 1].date);

    console.log("First date range:", firstDate);
    console.log("Last date range:", lastDate);

    const formatDate = (date: Date) => {
      const month = date.toLocaleString("default", { month: "short" });
      const day = date.getDate();
      return `${month} ${day}`;
    };

    // Always return just the month and day, regardless of year
    return `${formatDate(firstDate.startDate)}-${formatDate(lastDate.endDate)}`;
  };

  // Update the year display in the header
  const getYearRange = (dates: TimeData[]): string => {
    if (!dates.length) return "";

    const firstDate = parseDateString(dates[0].date);
    const lastDate = parseDateString(dates[dates.length - 1].date);

    const startYear = firstDate.startDate.getFullYear();
    const endYear = lastDate.endDate.getFullYear();

    return startYear === endYear
      ? startYear.toString()
      : `${startYear}-${endYear}`;
  };

  if (
    isLoading &&
    !dataAvailability.interestOverTime &&
    !dataAvailability.relatedQueries
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto"
          >
            <LoadingMessages messages={LOADING_MESSAGES} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-900 transition-colors">
        <div className="w-full max-w-6xl p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
            Artha Search Trends Dashboard
          </h1>

          <div className="mb-6 flex flex-col items-center space-y-4">
            <div className="flex justify-center w-full max-w-2xl">
              <input
                type="text"
                className="p-2 text-md border border-gray-300 rounded w-full bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                placeholder="Enter category, brand, product keywords"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded text-md hover:bg-blue-600 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {keywords.length > 0 ? (
            <div className="space-y-8">
              {/* 1. Time Series Analysis */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-black">
                <div className="border-b p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                        Search Trends Analysis
                      </h2>
                      {interestData.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {getYearRange(getFilteredInterestData())} •{" "}
                          {formatDateRange(getFilteredInterestData())}
                        </p>
                      )}
                    </div>
                    <button
                      className="px-3 py-1 flex items-center space-x-1 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => downloadTimeCSV()}
                      disabled={interestData.length === 0}
                    >
                      <Download size={16} />
                      <span>Export</span>
                    </button>
                  </div>
                  <DateRangeControls />
                </div>

                <div className="p-6">
                  {isLoadingInterest ? (
                    <div className="flex justify-center py-8">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg text-gray-600 dark:text-gray-300"
                      >
                        Processing trend data...
                      </motion.div>
                    </div>
                  ) : interestError ? (
                    <div className="text-red-500 p-5">{interestError}</div>
                  ) : interestData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={450}>
                      <BarChart
                        data={getFilteredInterestData()}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--border-secondary, #e5e7eb)"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="date"
                          angle={0}
                          textAnchor="middle"
                          height={40}
                          interval={0}
                          tick={{
                            fontSize: 12,
                            fill: "var(--text-secondary, #6b7280)",
                            fontWeight: 500,
                          }}
                          tickFormatter={(value, index) =>
                            formatDateLabel(
                              value,
                              index,
                              getFilteredInterestData()
                            )
                          }
                        />
                        <YAxis
                          tick={{
                            fontSize: 12,
                            fill: "var(--text-secondary, #6b7280)",
                            fontWeight: 500,
                          }}
                          tickFormatter={(value) => `${value}%`}
                          label={{
                            value: "Index Search Interest",
                            angle: -90,
                            position: "insideLeft",
                            style: {
                              textAnchor: "middle",
                              fill: "var(--text-primary, currentColor)",
                              fontSize: 18,
                            },
                          }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background, #fff)",
                            borderColor: "var(--border, #e2e8f0)",
                            borderRadius: "8px",
                            padding: "12px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            color: "var(--text-primary, currentColor)",
                          }}
                          cursor={{
                            fill: "rgba(0, 0, 0, 0.04)",
                          }}
                          labelFormatter={(value) =>
                            value.replace(/\u2009/g, " ")
                          }
                          formatter={(value, name) => [`${value}%`, name]}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: "14px",
                            fontWeight: 500,
                            paddingTop: "20px",
                          }}
                        />
                        {keywords.map((keyword, index) => (
                          <Bar
                            key={keyword}
                            dataKey={keyword}
                            fill={colors[index % colors.length]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                            name={keyword}
                          >
                            {interestData.map((_, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={colors[index % colors.length]}
                                style={{
                                  filter: "brightness(1.1)",
                                  transition: "all 0.3s ease",
                                }}
                              />
                            ))}
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      No trend data available for the selected keywords.
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Movers and Shakers */}
              <RelatedQueriesVisualization />

              {/* 3. Geographic Location */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-black">
                <div className="border-b p-4 flex justify-between items-center">
                  <h2 className="text-xl font-medium">
                    Interest by location: {keywords.join(", ")}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      {geoData?.keywords.map((keyword) => (
                        <button
                          key={keyword}
                          className={`px-3 py-1 ${
                            sortConfig.key === keyword
                              ? "bg-blue-100 text-blue-800"
                              : "bg-white"
                          } dark:bg-black text-sm`}
                          onClick={() => handleSort(keyword)}
                        >
                          {keyword}
                          {sortConfig.key === keyword && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      className="px-3 py-1 flex items-center space-x-1 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-900"
                      onClick={() => downloadGeoCSV()}
                    >
                      <Download size={16} />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {isLoadingGeo ? (
                    <div className="flex justify-center py-8">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg text-gray-600 dark:text-gray-300"
                      >
                        Analyzing geographic patterns...
                      </motion.div>
                    </div>
                  ) : geoError ? (
                    <div className="text-red-500 p-5">{geoError}</div>
                  ) : geoData ? (
                    <>
                      <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                          data={paginatedGeoData()}
                          margin={{
                            top: 20,
                            right: 20,
                            left: 30,
                            bottom: 30,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            height={100}
                            tick={{
                              fill: "var(--text-primary, currentColor)",
                              fontSize: 12,
                            }}
                          />
                          <YAxis
                            label={{
                              value: "Index Search Interest",
                              angle: -90,
                              position: "insideLeft",
                              style: {
                                textAnchor: "middle",
                                fill: "var(--text-primary, currentColor)",
                                fontSize: 18,
                              },
                            }}
                          />
                          <Tooltip
                            cursor={{
                              fill: "rgba(0, 0, 0, 0.04)",
                            }}
                            contentStyle={{
                              backgroundColor: "var(--background, #fff)",
                              borderRadius: "8px",
                              padding: "12px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              paddingTop: "22px",
                            }}
                          />
                          {geoData.keywords.map((keyword, index) => (
                            <Bar
                              key={keyword}
                              dataKey={`values.${keyword}`}
                              name={keyword}
                              fill={colors[index % colors.length]}
                              radius={[4, 4, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Pagination Controls */}
                      <div className="flex justify-between items-center p-3 mt-4 text-sm text-gray-500">
                        <button
                          onClick={() =>
                            handleGeoPageChange(geoCurrentPage - 1)
                          }
                          disabled={geoCurrentPage === 1}
                          className="flex items-center space-x-2 disabled:opacity-50"
                        >
                          <ChevronLeft size={18} />
                          <span>Previous 5</span>
                        </button>

                        <span>
                          Showing {(geoCurrentPage - 1) * itemsPerPage + 1}-
                          {Math.min(
                            geoCurrentPage * itemsPerPage,
                            sortedLocations.length
                          )}{" "}
                          of {sortedLocations.length}
                        </span>

                        <button
                          onClick={() =>
                            handleGeoPageChange(geoCurrentPage + 1)
                          }
                          disabled={geoCurrentPage === geoTotalPages()}
                          className="flex items-center space-x-2 disabled:opacity-50"
                        >
                          <span>Next 5</span>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No geographic data available
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Artha Analysis */}
              <AIAnalysisSection />

              {/* 5. Multi Queries Table */}
              <div>
                <h2 className="text-xl font-medium mb-4">Related Queries</h2>

                {isLoadingQuery ? (
                  <div className="flex justify-center py-8">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg text-gray-600 dark:text-gray-300"
                    >
                      Gathering related queries...
                    </motion.div>
                  </div>
                ) : queryError ? (
                  <div className="text-red-500 p-5 bg-white rounded-lg shadow-md">
                    {queryError}
                  </div>
                ) : Object.keys(queryData).length > 0 ? (
                  keywords.map((keyword) => (
                    <div
                      key={keyword}
                      className="mb-6 bg-white rounded-lg shadow-md overflow-hidden dark:bg-black"
                    >
                      <div className="border-b p-4 flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          Related queries: {keyword}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="border rounded-md overflow-hidden flex">
                            <button
                              className={`px-3 py-1 ${
                                queryType === "Rising"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-white"
                              } dark:bg-black dark:text-blue-400`}
                              onClick={() => handleQueryTypeChange("Rising")}
                            >
                              Rising
                            </button>
                            <button
                              className={`px-3 py-1 ${
                                queryType === "Top"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-white"
                              } dark:bg-gray-500 dark:hover:bg-gray-900`}
                              onClick={() => handleQueryTypeChange("Top")}
                            >
                              Top
                            </button>
                          </div>
                          <button
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900"
                            onClick={() => downloadQueryCSV(keyword)}
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        {!queryData[keyword] ||
                        !queryData[keyword][
                          queryType.toLowerCase() as QueryTypeLowerCase
                        ] ? (
                          <div className="text-gray-500">
                            No data available for this query type
                          </div>
                        ) : (
                          <div>
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead className="w-12 text-center">
                                    SN
                                  </TableHead>
                                  <TableHead>Keywords</TableHead>
                                  <TableHead className="w-32 text-right">
                                    {queryType === "Rising"
                                      ? "Change"
                                      : "Index Search Interest"}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedQueryData(keyword).map(
                                  (item, index) => (
                                    <TableRow
                                      key={`${item.query}-${index}`}
                                      className="border-t"
                                    >
                                      <TableCell className="text-center text-gray-500">
                                        {(queryCurrentPage - 1) * itemsPerPage +
                                          index +
                                          1}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {item.query}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {queryType === "Rising" ? (
                                          <div className="flex items-center justify-end space-x-1">
                                            <span className="text-green-600">
                                              {item.value}
                                            </span>
                                            <ArrowUpRight
                                              size={16}
                                              className="text-green-600"
                                            />
                                          </div>
                                        ) : (
                                          <span>{item.value}</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center p-3 text-sm text-gray-500">
                              <button
                                onClick={() =>
                                  handleQueryPageChange(queryCurrentPage - 1)
                                }
                                disabled={queryCurrentPage === 1}
                                className="flex items-center space-x-2 disabled:opacity-50"
                              >
                                <ChevronLeft size={18} />
                                <span>Previous</span>
                              </button>

                              <span>
                                Showing{" "}
                                {(queryCurrentPage - 1) * itemsPerPage + 1}-
                                {Math.min(
                                  queryCurrentPage * itemsPerPage,
                                  queryData[keyword][
                                    queryType.toLowerCase() as QueryTypeLowerCase
                                  ]?.length || 0
                                )}{" "}
                                of{" "}
                                {queryData[keyword][
                                  queryType.toLowerCase() as QueryTypeLowerCase
                                ]?.length || 0}{" "}
                                queries
                              </span>

                              <button
                                onClick={() =>
                                  handleQueryPageChange(queryCurrentPage + 1)
                                }
                                disabled={
                                  queryCurrentPage === queryTotalPages(keyword)
                                }
                                className="flex items-center space-x-2 disabled:opacity-50"
                              >
                                <span>Next</span>
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-md">
                    No related queries data available for the selected keywords.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

// Add this function at the top level, near other utility functions
const processTimeSeriesData = (data: TimeSeriesItem[]): TimeData[] => {
  console.log("Raw time series data:", data);
  if (!Array.isArray(data)) return [];

  const processedData = data.map((item) => {
    // Convert the date format for display
    const dateStr = item.date.replace(/\u2009|\u2013/g, " ");
    return {
      date: dateStr,
      ...Object.fromEntries(
        Object.entries(item).filter(([key]) => key !== "date")
      ),
    };
  });
  console.log("Processed time series data:", processedData);
  return processedData;
};
