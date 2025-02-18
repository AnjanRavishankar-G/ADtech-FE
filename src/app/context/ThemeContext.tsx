'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for the context value
interface ThemeContextType {
  theme: 'light' | 'dark'; // Theme can only be 'light' or 'dark'
  toggleTheme: () => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to access the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode; // Type for children to accept any React component
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Type the theme state

  useEffect(() => {
    // Get saved theme from localStorage (if any)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to light theme
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    // Remove previous theme class from the body
    document.body.classList.remove('light', 'dark');
    // Add the current theme class to the body
    document.body.classList.add(theme);

    // Save the selected theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
