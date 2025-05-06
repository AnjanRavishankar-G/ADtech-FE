"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, AlertCircle, Star, ChevronRight, ChevronDown, Truck, Heart } from "lucide-react";
import Layout from "../components/ui/Layout";
import Cookies from 'js-cookie';
import { LoadingMessages } from '../components/ui/LoadingMessages';
import { motion, AnimatePresence } from 'framer-motion';

// Updated type definition to match our enhanced backend
type AmazonProductData = {
  asin: string;
  url: string;
  title: string;
  brand: string | null;
  manufacturer: string | null;
  mrp: string | null;
  selling_price: string | null;
  discount: string | null;
  rating: string | null;
  review_count: string | null;
  description: string | null;
  product_details: Record<string, string>;
  images: string[];
  reviews: Array<{
    rating: string | null;
    title: string | null;
    text: string | null;
    author: string | null;
    date: string | null;
  }>;
  sold_by: string | null;
};

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const LOADING_MESSAGES = [
  {
    text: "Plunging into the Retail Abyss...",
    emoji: "🛒"
  },
  {
    text: "We're currently swimming through product pages, dodging sponsored sharks, and untangling reviews from reef-sized rankings.",
    emoji: "🐠"
  },
  {
    text: "Our manta scouts are surfacing top-performing SKUs, spotting demand ripples, and decoding those mysterious trend currents.",
    emoji: "🌊"
  },
  {
    text: "Give us a moment while we net the insights that matter—so your next campaign doesn't get lost in the long tail.",
    emoji: "😎"
  },
  {
    text: "Scanning tides for competition trends and treasure… hang tight.",
    emoji: "🏊‍♂️"
  }
];

async function fetchProductData(asin: string) {
  try {
    const res = await fetch(`${backendURL}/amazon-scraping/${asin}`, { 
      cache: "no-store",
      headers: {
        'Authorization': `Bearer ${Cookies.get('auth_token')}`,
        'Content-Type': 'application/json'  
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch product data");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error fetching product data:", error);
    throw error;
  }
}

function StarRating({ rating }: { rating: string | null }) {
  if (!rating) return null;
  
  const ratingNum = parseFloat(rating);
  const fullStars = Math.floor(ratingNum);
  const hasHalfStar = ratingNum - fullStars >= 0.5;
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="text-yellow-400">
          {i < fullStars ? (
            <Star size={16} fill="#FBBF24" />
          ) : i === fullStars && hasHalfStar ? (
            <Star size={16} fill="#FBBF24" className="opacity-50" />
          ) : (
            <Star size={16} className="text-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AmazonProductSearch() {
  const [input, setInput] = useState<string>("");
  const [productData, setProductData] = useState<AmazonProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) {
      setError("Please enter a valid ASIN or Amazon URL");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setShowFullDescription(false);
    setCurrentImageIndex(0);
    setExpandedDetails({});
    
    try {
      const asinMatch = input.match(/\/dp\/([A-Z0-9]{10})(?:\/|$)/);
      const asin = asinMatch ? asinMatch[1] : input;
      
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

  const toggleDetailSection = (section: string) => {
    setExpandedDetails(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white p-4 rounded shadow-sm mb-4 dark:bg-gray-800">
          <form onSubmit={handleSearch}>
            <label htmlFor="input" className="block font-medium mb-2 text-gray-800 dark:text-gray-200">
            Enter Competitor URL (Amazon):
            </label>
            <div className="flex">
              <input
                type="text"
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border p-2 rounded-l w-full dark:bg-gray-700 dark:text-white"
                placeholder="e.g., B07PXGQC1Q or Amazon product URL"
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r flex items-center"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-1" size={16} /> : <Search size={16} className="mr-1" />}
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
            {error && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-sm flex items-center">
                <AlertCircle size={16} className="mr-1 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl px-4"
              >
                <LoadingMessages messages={LOADING_MESSAGES} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {!isLoading && productData && (
          <div className="bg-white rounded shadow-sm dark:bg-gray-800">
            {/* Product Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {productData.brand && <span className="mr-2">Brand: <span className="text-blue-600 hover:underline">{productData.brand}</span></span>}
                </div>
              </div>
              <h1 className="text-xl font-medium mt-1 text-gray-900 dark:text-white">
                {productData.title}
              </h1>
              <div className="flex items-center mt-2">
                <StarRating rating={productData.rating} />
                {productData.rating && (
                  <span className="ml-1 text-blue-600 hover:underline text-sm">
                    {productData.rating} ({productData.review_count} ratings)
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6 p-4">
              {/* Image Gallery - 5 columns */}
              <div className="md:col-span-5">
                <div className="sticky top-4">
                  {productData.images && productData.images.length > 0 ? (
                    <div>
                      <div className="aspect-square relative border border-gray-200 dark:border-gray-700 rounded mb-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                        <Image 
                          src={productData.images[currentImageIndex]} 
                          alt={productData.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      {productData.images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {productData.images.slice(0, 5).map((img, idx) => (
                            <div 
                              key={idx}
                              className={`relative w-16 h-16 border flex-shrink-0 cursor-pointer ${
                                idx === currentImageIndex 
                                  ? 'border-blue-500 dark:border-blue-400' 
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                              onClick={() => setCurrentImageIndex(idx)}
                            >
                              <Image 
                                src={img} 
                                alt={`Thumbnail ${idx+1}`}
                                fill
                                className="object-contain"
                                sizes="64px"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                      <span className="text-gray-500 dark:text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info - 4 columns */}
              <div className="md:col-span-4">
                {/* Price Section */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  {productData.selling_price && (
                    <div className="flex items-baseline">
                      <span className="text-2xl font-medium text-gray-900 dark:text-white">
                        {productData.selling_price}
                      </span>
                      {productData.mrp && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm line-through">
                          {productData.mrp}
                        </span>
                      )}
                    </div>
                  )}
                  {productData.discount && (
                    <div className="text-green-600 dark:text-green-400 text-sm font-medium mt-1">
                      {productData.discount}
                    </div>
                  )}
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {productData.manufacturer && (
                      <div className="mt-2">Manufacturer: {productData.manufacturer}</div>
                    )}
                  </div>
                  {productData.sold_by && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Sold by: {productData.sold_by}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3 mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">About this item</h3>
                  {productData.description ? (
                    <div className="text-gray-700 dark:text-gray-300 text-sm">
                      <div className={showFullDescription ? "" : "line-clamp-4"}>
                        {productData.description}
                      </div>
                      {productData.description.length > 200 && (
                        <button 
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-blue-600 hover:underline text-sm mt-2 flex items-center"
                        >
                          {showFullDescription ? "Show less" : "Read more"}
                          {showFullDescription ? (
                            <ChevronDown size={14} className="ml-1" />
                          ) : (
                            <ChevronRight size={14} className="ml-1" />
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No description available</p>
                  )}
                </div>

                {/* Product Details */}
                {Object.keys(productData.product_details || {}).length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded p-3 mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Product Details</h3>
                    <div className="text-sm">
                      {Object.entries(productData.product_details)
                        .slice(0, expandedDetails.details ? undefined : 5)
                        .map(([key, value]) => (
                          <div key={key} className="grid grid-cols-12 py-1">
                            <div className="col-span-5 text-gray-600 dark:text-gray-400">{key}</div>
                            <div className="col-span-7 text-gray-900 dark:text-white">{value}</div>
                          </div>
                        ))}
                      
                      {Object.keys(productData.product_details).length > 5 && (
                        <button 
                          onClick={() => toggleDetailSection('details')}
                          className="text-blue-600 hover:underline text-sm mt-2 flex items-center"
                        >
                          {expandedDetails.details ? "Show less" : "Show more details"}
                          {expandedDetails.details ? (
                            <ChevronDown size={14} className="ml-1" />
                          ) : (
                            <ChevronRight size={14} className="ml-1" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Buy Box - 3 columns */}
              <div className="md:col-span-3">
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                  <div className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    {productData.selling_price || "Price not available"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Truck size={14} className="mr-1 text-green-600 dark:text-green-500" />
                      <span>Free delivery available</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-1.5 px-4 rounded-full text-sm">
                      Add to Cart
                    </button>
                    <button className="w-full bg-orange-400 hover:bg-orange-500 text-gray-900 py-1.5 px-4 rounded-full text-sm">
                      Buy Now
                    </button>
                    <button className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-1.5 px-4 rounded-full text-sm flex items-center justify-center">
                      <Heart size={14} className="mr-1" /> Add to Wish List
                    </button>
                  </div>
                </div>

                <Link
                  href={productData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-blue-600 hover:underline text-sm"
                >
                  View on Amazon →
                </Link>
              </div>
            </div>

            {/* Reviews Section */}
            {productData.reviews && productData.reviews.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Customer Reviews
                </h2>
                <div className="space-y-4">
                  {productData.reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <div className="flex items-center mb-1">
                        <div className="mr-2">
                          <StarRating rating={review.rating} />
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-gray-900 dark:text-white">{review.title}</h4>
                        )}
                      </div>
                      {review.author && review.date && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          By {review.author} on {review.date}
                        </div>
                      )}
                      {review.text && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{review.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}