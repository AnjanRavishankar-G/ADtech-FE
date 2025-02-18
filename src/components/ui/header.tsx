'use client';

import { useTheme } from '@/app/context/ThemeContext'; // Import the useTheme hook
import { FaMoon, FaSun } from 'react-icons/fa'; // Import icons for moon and sun (you'll need to install react-icons)

const Header = () => {
  const { theme, toggleTheme } = useTheme(); // Access theme and toggle function

  return (
    <header className="flex justify-between items-center p-4  text-white transition-all duration-300">
      <h1 className="text-lg font-semibold"></h1>
      <button
        onClick={toggleTheme} // Toggle the theme on button click
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} // Accessibility label
        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-all duration-300"
      >
        {theme === 'light' ? (
          <FaMoon className="text-xl" /> // Moon icon for light mode
        ) : (
          <FaSun className="text-xl" /> // Sun icon for dark mode
        )}
        <span className="hidden sm:block">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
      </button>
    </header>
  );
};

export default Header;
