"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Changed from setTokens to login

  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };
  
  async function handleSubmit(e: { preventDefault: () => void; }) {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await fetch("https://a5ehaj23t5.execute-api.us-east-1.amazonaws.com/dev/api/Auth_login", {
        method: "POST",
        mode: 'cors',
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Received tokens:', { 
          auth_token: data.auth_token ? 'present' : 'missing',
          id_token: data.id_token ? 'present' : 'missing'
        });
        
        // Store tokens in cookies
        Cookies.set('auth_token', data.auth_token, { expires: 1 });
        Cookies.set('id_token', data.id_token, { expires: 1 });
        
        // Use login instead of setTokens
        login(data.auth_token, data.id_token);
        
        router.push("/brand");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Left side with image */}
      <div className="hidden md:block md:w-1/2 bg-blue-100 dark:bg-gray-800 relative">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg">
              {/* Grid overlay similar to original design */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-12 h-full">
                  {Array(144)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="border border-white/10"></div>
                    ))}
                </div>
              </div>
              
              <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white h-full">
                <div className="bg-white rounded-full p-3 mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h1 className="text-5xl font-bold mb-6">Unlock Your Project Performance</h1>
                <p className="text-xl opacity-90 text-center">
                  You will never know everything.<br />
                  But you will know more...
                </p>
                
                <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                  <button className="flex items-center bg-white/10 hover:bg-white/20 rounded-full px-6 py-3 transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - login form with updated UI */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md dark:bg-black">
          <Link href="/" className="inline-block">
            <div className="bg-purple-600 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </Link>
          
          <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-gray-900 dark:text-white">
            Hey, Hello 👋
          </div>
          <div className="2xl:text-lg text-base text-gray-600 2xl:mt-2 leading-6 dark:text-white">
            Enter the information you entered while registering.
          </div>
          
          <form onSubmit={handleSubmit} className="mt-5 2xl:mt-7">
            <div>
              <label htmlFor="email" className="mb-2 font-medium text-gray-600 dark:text-white">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="youremail@example.com"
                className="w-full p-2 border rounded border-gray-300 dark:text-white dark:bg-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>
            
            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="font-medium text-gray-600 dark:text-white">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={passwordType}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
                  onClick={togglePasswordType}
                >
                  {passwordType === "password" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-5 mb-8 flex flex-wrap gap-2">
              <div className="flex-1 flex items-center gap-1.5">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer dark:text-white">
                  Remember me
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded hover:shadow-lg transition duration-200 disabled:bg-purple-400"
            >
              {isLoading && <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          
        </div>
      </div>
    </div>
  );
}
