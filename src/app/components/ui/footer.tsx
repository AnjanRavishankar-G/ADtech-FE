import React from 'react';
import Image from 'next/image';

interface FooterProps {
  imageAlt?: string;
}

const Footer: React.FC<FooterProps> = ({ imageAlt }) => {
  return (
    <footer className="w-full py-6 bg-gray-100 border-t dark:bg-[#1e1e1e]">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
            <div className="flex items-center"> 
            <span className="text-black dark:text-white mr-[-48px]">Powered by</span>
              <div className="h-32 w-[128px] relative">
                <Image 
                  src="/artha-manta-logo-black.png"
                  alt={imageAlt || 'Default alt text'}
                  fill
                  className="object-contain dark:hidden"
                  priority
                />
                <Image
                  src="/artha-manta-logo-white.png"
                  alt={imageAlt || 'Default alt text'}
                  fill
                  className="object-contain dark:block hidden"
                  priority
                />
              </div>
            </div>
        </div>
    </footer>
  )
};

export default Footer;