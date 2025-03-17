import React from "react";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 bg-gray-100 border-t dark:bg-[#1e1e1e]">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <div className="flex items-center ">
          {/* Text placed after the image */}
          <span className="text-black dark:text-white  mr-[-48px]">
            Powered by
          </span>
          <div className="h-32 w-auto relative">
            {/* Image placed first */}
            <Image
              src="/artha-manta-logo-black.png"
              alt="Artha Manta Logo"
              width={128}
              height={128}
              className="h-full w-auto object-contain dark:hidden"
            />
            <Image
              src="/artha-manta-logo-white.png"
              alt="Artha Manta Logo"
              width={128}
              height={128}
              className="h-full w-auto object-contain dark:block hidden"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
