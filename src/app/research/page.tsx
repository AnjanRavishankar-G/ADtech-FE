"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search, Loader2, AlertCircle } from "lucide-react";
import Layout from "../components/ui/Layout";
import Cookies from 'js-cookie';

type AmazonProductData = {
  asin: string;
  url: string;
  title: string;
  mrp: string | null;
  selling_price: string;
  discount: string | null;
  rating: string;
  review_count: string;
  sellers: string[];
  description?: string; // Make description optional
};
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchProductData(asin: string) {
  try {
    const res = await fetch(`${backendURL}/amazon-scraping/${asin}`, { cache: "no-store",
      headers: {
        'Authorization':  `Bearer ${Cookies.get('auth_token')}`,
        'Content-Type': 'application/json'  
      }
     });
    if (!res.ok) throw new Error("Failed to fetch product data");
    return await res.json();
  } catch (error) {
    console.error("Error fetching product data:", error);
    throw error;
  }
}

export default function AmazonProductSearch() {
  const [asin, setAsin] = useState<string>("");
  const [productData, setProductData] = useState<AmazonProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!asin.trim()) {
      setError("Please enter a valid ASIN");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setShowFullDescription(false);
    try {
      const data = await fetchProductData(asin);
      setProductData(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Product not found or error occurred";
      setError(errorMessage);
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white  p-4 rounded shadow-sm mb-4  dark:bg-black">
        <form onSubmit={handleSearch}>
          <label htmlFor="asin" className="block font-medium mb-2 text-gray-800 dark:text-gray-200">Enter Product ASIN:</label>
          <div className="flex">
            <input
              type="text"
              id="asin"
              value={asin}
              onChange={(e) => setAsin(e.target.value)}
              className="border p-2 rounded-l w-full dark:bg-gray-900 dark:text-white"
              placeholder="e.g., B07PXGQC1Q"
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r flex items-center "
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin mr-1" size={16} /> : <Search size={16} className="mr-1" />}
              {isLoading ? "..." : "Search"}
            </button>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm flex items-center">
              <AlertCircle size={16} className="mr-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {!isLoading && productData && (
        <div className="bg-white rounded shadow-sm p-4 dark:bg-black">
          <div className="border-b pb-2 mb-3">
            <h2 className="text-xl font-bold mb-3 border p-2 rounded bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
              {productData.title}
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="border p-2 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-600 dark:text-gray-300 text-sm">Price:</span>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {productData.selling_price}
                  {productData.mrp && (
                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm line-through">{productData.mrp}</span>
                  )}
                </div>
              </div>
              <div className="border p-2 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-600 dark:text-white text-sm">Rating:</span>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {productData.rating} ({productData.review_count} reviews)
                </div>
              </div>
            </div>
          </div>
          <div className="mb-3 border p-2 rounded bg-gray-50 dark:bg-gray-900">
            <h3 className="font-medium mb-1 text-gray-800 dark:text-white">Description</h3>
            {productData.description ? (
              <p
                className="text-gray-700 dark:text-white text-sm overflow-hidden line-clamp-5 cursor-pointer"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription 
                  ? productData.description 
                  : `${productData.description.slice(0, 100)}... Read more`}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No description available</p>
            )}
          </div>
          <Link
            href={productData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm "
          >
            View on Amazon
          </Link>
        </div>
      )}
    </div>
    </Layout>
  );
}
