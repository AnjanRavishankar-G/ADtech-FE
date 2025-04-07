"use client";
import "@/css/brand.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../components/ui/footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import DateRangePicker from "../components/ui/datePicker";
import BasicRadialBar from "../components/ui/RadialbarChart"; // Updated RadialBar
import BasicPieChart from "../components/ui/bargraph";
import Layout from "../components/ui/Layout";
import { createAuthenticatedFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type BrandTargetData = {
  Brand: string;
  DateTime: string;
  DailySales: number;
  Target: number;
  TargetAchieved: number;
  Goal: number;
};

type OurBrandData ={
  profileId: number;
  currencyCode: string;
  name: string;
};
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;


async function fetchFilteredBrandTargetData(startDate: string, endDate: string) {
  const fetchWithAuth = createAuthenticatedFetch();
  try {
    const url = `${backendURL}/filtered_brands?start_date=${startDate}&end_date=${endDate}`;
    const response = await fetchWithAuth(url);
    const data = await response.json();
    return data.length > 0 ? data : null;
  } catch (error) {
    console.error("Error fetching brand target data:", error);
    return null;
  }
}

// Modify the fetchUniqueBrandTargetData function
async function fetchUniqueBrandTargetData() {
  const fetchWithAuth = createAuthenticatedFetch();
  try {
    console.log('Fetching brand target data...');
    const userRole = Cookies.get('id_token'); // Get the role from id_token
    
    const response = await fetchWithAuth(`${backendURL}/report/real_brand_table`, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${Cookies.get('auth_token')}`,
        'Content-Type': 'application/json',
        'X-ID-Token': userRole || '' // Pass role in X-ID-Token header
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
      throw new Error(`Failed to fetch brand target data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchUniqueBrandTargetData:', error);
    throw error;
  }
}

export default function BrandTargetTables() {
  const router = useRouter();
  
  const [brandTargetData, setBrandTargetData] = useState<BrandTargetData[] | null>(null);
  const [uniqueBrandTargetData, setUniqueBrandTargetData] = useState<BrandTargetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDataAvailable, setIsDataAvailable] = useState<boolean>(true);
  const [brands, setBrands] = useState<OurBrandData[]>([]);
   // State to manage date range picker visibility
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    // Add error state
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWithAuth = createAuthenticatedFetch();
    
    const userRole = Cookies.get('id_token');
    fetchWithAuth(`${backendURL}/our-brand`, {
      headers: {
      'Authorization': `Bearer ${Cookies.get('auth_token')}`,
      'Content-Type': 'application/json',
      'X-ID-Token': userRole || '' // Adding user role in header
      }
    })
      .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
      })
      .then(data => {
      if (data.brands) {
        setBrands(data.brands);
      } else {
        console.error("Invalid data format:", data);
      }
      })
      .catch(error => {
      console.error("Error fetching brand data:", error);
      setError(error.message);
      if (error.message.includes('401')) {
        router.push('/login');
      }
      });
    }, [router]);


  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Starting data load...');
        const uniqueData = await fetchUniqueBrandTargetData();
        setUniqueBrandTargetData(uniqueData);
        
        if (startDate && endDate) {
          const formattedStartDate = startDate.toISOString().split("T")[0];
          const formattedEndDate = endDate.toISOString().split("T")[0];
          const filteredData = await fetchFilteredBrandTargetData(formattedStartDate, formattedEndDate);
          
          setBrandTargetData(filteredData || []);
          setIsDataAvailable(!!filteredData);
        } else {
          setBrandTargetData(null);
          setIsDataAvailable(true);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (err instanceof Error && err.message.includes('No authentication token found')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [startDate, endDate, router]);

  if (isLoading) return <div>Loading...</div>;

  // Calculate total target and total target achieved
  const totalTarget = uniqueBrandTargetData.reduce(
    (acc, brand) => acc + (brand.Goal || 0),
    0
  );
  
  const totalTargetAchieved = uniqueBrandTargetData.reduce(
    (acc, brand) => acc + (brand.Target || 0),
    0
  );

  const topBrands = [...uniqueBrandTargetData]
    .sort((a, b) => b.DailySales - a.DailySales)
    .slice(0, 5);

  const displayData = startDate && endDate ? (brandTargetData || []) : topBrands;

  // Generate the data for the radial charts
  const brandProgressData = uniqueBrandTargetData.map((brand) => {
    const progress = brand.Target > 0 ? (brand.Target / brand.Goal) * 100 : 0;
    return Math.round(progress); // Round to the nearest integer for simplicity
  });

  // For the combined chart: total progress across all brands
  const combinedProgress = Math.round((totalTargetAchieved / totalTarget) * 100);

  const brandNames = uniqueBrandTargetData.map((brand) => brand.Brand);

   // Get only top 5 brands for the radial chart
   const top8BrandsProgress = brandProgressData.slice(0, 5);
   const top8BrandNames = brandNames.slice(0, 5);


  const brandSalesData = uniqueBrandTargetData.map((brand) => brand.TargetAchieved);
  // Get only first 5 brands for the pie chart
  const first8BrandSalesData = brandSalesData.slice(0, 5);

  
   // Sort brands by sales achieved in descending order and get top 5
  const topBrandsBySales = [...uniqueBrandTargetData]
   .sort((a, b) => b.TargetAchieved - a.TargetAchieved)
   .slice(0, 5);

  const handleButtonClick = () => {
    setIsDatePickerOpen(!isDatePickerOpen); // Toggle date picker visibility
    };

const brandProgressDataTop5 = topBrandsBySales.map((brand) => brand.TargetAchieved);
const brandNamesTop5 = topBrandsBySales.map((brand) => brand.Brand);



//   // Sorting brands by Spends (assuming actual spend data is available)
// const topBrandsBySpends = [...uniqueBrandTargetData]
// .sort((a, b) => b.Spends - a.Spends) // Sort by Spends
// .slice(0, 5); // Get top 5 brands

// // Extract spends data and names for Pie Chart
// const brandSpendsDataTop5 = topBrandsBySpends.map((brand) => brand.Spends);
// const brandNamesTop5Spends = topBrandsBySpends.map((brand) => brand.Brand);

  return (
    <Layout>
      <div className="p-5">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="p-5 ">
            <div className="w-full p-4 rounded-lg bg-color:[#f1f4f5]">
              <div className="flex flex-col  items-start">
                <div className="text-white text-4xl font-serif tracking-wider">
                  <h2 className="text-4xl font-light p-2">IPG</h2>
                </div>
                <div className="text-white p-2">
                  <h2 className="text-2xl font-light">
                    Total Accounts: {uniqueBrandTargetData.length}
                  </h2>
                  <h2 className="text-2xl font-light">Total Active: 25</h2>
                  <h2 className="text-2xl font-light">
                    Total revenue: INR {totalTargetAchieved.toLocaleString()}
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-5">
              <h1 className="text-xl font-bold mb-7 text-center">Brands</h1>
              <div className="flex flex-col md:flex-row flex-wrap justify-start gap-5 bg-[#f1f4f5] dark:bg-[#1e1e1e] rounded-2xl">
                {/* Combined Radial Chart */}
                <div className="flex-1 md:w-1/3 lg:w-1/4 h-[350px] text-center bg-white shadow-lg rounded-2xl p-4 border dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
                  <BasicRadialBar
                    height={350}
                    series={[combinedProgress]} // Combined progress for all brands
                    combined={true}
                    hollowSize="51%"
                  />
                </div>

                {/* Individual Radial Chart with Multiple Brands */}
                <div className="flex-1 md:w-1/3 lg:w-1/4 h-[350px] text-center bg-white shadow-lg rounded-2xl p-4 border dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
                  <BasicRadialBar 
                    height={550}
                    series={top8BrandsProgress} // Multiple progress for individual brands
                    labels={top8BrandNames} // Add brand names as labels
                    hollowSize="30%" 
                  /> 
                </div>
                  {/* Individual Radial Chart with Multiple Brands */}
                    <div className="flex-1 h-[350px] text-center align-content: center; bg-white shadow-lg rounded-2xl p-4 border dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
                      <BasicPieChart 
                      series={first8BrandSalesData} 
                      height={550}
                      labels={top8BrandNames}
                      colors={["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0", "#2a40f1", "#2af1c7", "#79f728"]}/>  
                    </div> 
              </div>
              
              {/* Button to open the Date Range Picker */}
            <button 
              onClick={handleButtonClick}
              className="text-Black bg-white shadow-2xl hover:bg-gray-400 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 mt-4 mb-3 dark:hover:bg-gray-700 dark:bg-black  dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]"
            >
              {isDatePickerOpen ? "Close Date Picker" : "Select Date Range"}
            </button>

            {isDatePickerOpen && (
            <DateRangePicker onDateRangeChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
                setIsDatePickerOpen(false);
              }} />
            )}

              <div className="shadow-2xl p-4 bg-white rounded-2xl dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
                {!isDataAvailable && (
                  <div className="text-red-500 text-center mb-4">
                    No data available for selected date range
                  </div>
                )}
                {/* Brand Table */}
                <div className="overflow-auto max-h-[500px]">
                  <Table className="min-w-full border text-center">
                    <TableHeader className="bg-gray-200 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Goal (₹)</TableHead>
                  <TableHead>Spends (₹)</TableHead>
                  <TableHead>Sales Achieved (₹)</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
                    </TableHeader>
                    <TableBody>
                {displayData.map((brand, index) => (
                  <TableRow key={`${brand.Brand}-${brand.DateTime}-${index}`}>
                    <TableCell className="border border-default-300 hover:bg-default-100 transition-colors cursor-pointer p-0">
                      <Link 
                        href={`/campaign?brand=${encodeURIComponent(brand.Brand)}`} 
                        className="text-black hover:bg-gray-300 block w-full h-full p-4 dark:text-white dark:hover:bg-blue-900"
                      >
                        {brand.Brand}
                      </Link>
                    </TableCell>
                    <TableCell>{brand.Goal?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{brand.DailySales?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{brand.Target?.toLocaleString() || '-'}</TableCell>
                    <TableCell>
                      {brand.Target > 0 ? ((brand.Target / brand.Goal) * 100).toFixed(2) : "0.00"}%
                    </TableCell>
                  </TableRow>
                ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
            <div className="mt-12 flex gap-4 rounded-2xl">
              <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
              {/* tablee for top 5 brands according to sales achived */}
              <h2 className="text-2xl font-bold mb-4 mt-8 text-center ">Top 5 Brands Based on Sales Achieved</h2>
              <div className="flex space-x-10 ">
                <div className="flex-1 overflow-x-auto">
                  <Table className="min-w-full border text-center">
                    <TableHeader className="bg-black text-white top-0 z-10 ">
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Sales Achieved (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topBrandsBySales.map((brand) => (
                        <TableRow key={brand.Brand}>
                          <TableCell className="w-1/3">{brand.Brand}</TableCell>
                          <TableCell className="w-1/3">{brand.Target?.toLocaleString() || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <BasicPieChart 
                        series={brandProgressDataTop5} 
                        height={350}
                        labels={brandNamesTop5}/>
                </div>
              </div>     
              </div>
            <div className="w-1/2 shadow-2xl p-4 bg-white rounded-lg dark:bg-black dark:text-white dark:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
              <h2 className="text-2xl font-bold mb-4 mt-8 text-center">Top 5 Brands Based on Spends</h2>
              <div className="flex space-x-10 ">
                <div className="flex-1 overflow-x-auto">
                  <Table className="min-w-full border border-blue-600 text-center">
                    <TableHeader className="bg-black text-white top-0 z-10">
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Spends (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topBrandsBySales.map((brand) => (
                        <TableRow key={brand.Brand}>
                          <TableCell className="w-1/3">{brand.Brand}</TableCell>
                          <TableCell className="w-1/3">{brand.DailySales?.toLocaleString() || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* for pie chart */}
                
                        <BasicPieChart 
                        series={brandProgressDataTop5} 
                        height={350}
                        labels={brandNamesTop5}/>
                    
                </div>
              </div>  
            </div>
            </div>
            </div>
                <Table className="min-w-full border text-center">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand Name</TableHead>
                      <TableHead>Profile ID</TableHead>
                      <TableHead>Currency Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands && brands.length > 0 ? (
                      brands.map((brand) => (
                        <TableRow key={brand.profileId}>
                          <TableCell>{brand.name}</TableCell>
                          <TableCell>{brand.profileId}</TableCell>
                          <TableCell>{brand.currencyCode}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3}>No brands data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
            <div >
              <Footer/>
            </div>
            </div>
        )}
      </div>
    </Layout>
  );
}