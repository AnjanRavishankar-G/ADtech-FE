import React from "react";
import Image from "next/image";

interface FooterProps {
  imageAlt?: string;
}

const Footer: React.FC<FooterProps> = ({ imageAlt }) => {
  return (
    <footer className="w-full py-2 bg-gray-100 border-t dark:bg-[#1e1e1e]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex flex-col items-center">
            <Image
              src="/dentsu-seeklogo.png"
              alt="Dentsu Logo"
              width={80}
              height={28}
              priority
              className="mx-auto -mb-6 mr-20"
            />
            <div className="flex items-center">
              <span className="text-black dark:text-white mr-[-52px] text-base font-medium">
                Powered by
              </span>
              <div className="h-24 w-[140px] relative">
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
