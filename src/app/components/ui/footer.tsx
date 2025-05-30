import React from "react";
import Image from "next/image";

interface FooterProps {
  imageAlt?: string;
}

const Footer: React.FC<FooterProps> = ({ imageAlt }) => {
  return (
    <footer className="w-full py-6 bg-gray-100 border-t dark:bg-[#1e1e1e]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Reduced space-y from 4 to 2 */}
          <div className="flex flex-col items-center">
            <Image
              src="/dentsu-seeklogo.png"
              alt="Dentsu Logo"
              width={100} // Slightly smaller
              height={35}
              priority
              className="mx-auto -mb-8 mr-14" // Reduced margin bottom
            />
            <div className="flex items-center mt-1">
              {/* Added margin top */}
              <span className="text-black dark:text-white mr-[-48px]">
                Powered by
              </span>
              <div className="h-32 w-[128px] relative">
                <Image
                  src="/artha-manta-logo-black.png"
                  alt={imageAlt || "Default alt text"}
                  fill
                  className="object-contain dark:hidden"
                  priority
                />
                <Image
                  src="/artha-manta-logo-white.png"
                  alt={imageAlt || "Default alt text"}
                  fill
                  className="object-contain dark:block hidden"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
