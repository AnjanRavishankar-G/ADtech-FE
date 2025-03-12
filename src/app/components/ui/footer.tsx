import React from 'react';

interface FooterProps {
  imageAlt?: string;
}

const Footer: React.FC<FooterProps> = ({ imageAlt = "Company Logo" }) => {
  return (
    <footer className="w-full py-6 bg-gray-100 border-t dark:bg-[#1e1e1e]">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
            <div className="flex items-center "> 
            {/* Text placed after the image */}
            <span className="text-black dark:text-white  mr-[-48px]">Powered by</span>
              <div className="h-32 w-auto">
                {/* Image placed first */}
                <img 
                  src="/artha-manta-logo-black.png" // Default image (light mode)
                  alt="Artha Manta Logo"
                  className="h-full w-auto object-contain dark:hidden" // Hide in dark mode
                />
                <img
                  src="/artha-manta-logo-white.png" // White logo (dark mode)
                  alt="Artha Manta Logo"
                  className="h-full w-auto object-contain dark:block hidden" // Show only in dark mode
                />
              </div>
            </div>
        </div>
    </footer>
  )
};

export default Footer;