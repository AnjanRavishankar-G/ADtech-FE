"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";

export default function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cubeAnimated, setCubeAnimated] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  const [inSection2, setInSection2] = useState(false);
  const [inSection3, setInSection3] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Video setup (existing logic)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleResize = () => {
      if (video && typeof window !== "undefined") {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        video.style.objectPosition = mobile ? "70% center" : "center";
      }
    };

    const handleLoadStart = () => {
      console.log("Video loading started");
    };

    const handleCanPlay = () => {
      console.log("Video can start playing");
      setIsVideoLoaded(true);
      video.play().catch((error) => {
        console.log("Autoplay failed, setting up click handler:", error);
        setupClickHandler();
      });
    };

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
    };

    const handleError = (e: Event) => {
      console.error("Video error:", e);
      setVideoError(true);
    };

    const setupClickHandler = () => {
      const handleUserInteraction = () => {
        video
          .play()
          .then(() => {
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("touchstart", handleUserInteraction);
          })
          .catch(console.error);
      };

      document.addEventListener("click", handleUserInteraction, { once: true });
      document.addEventListener("touchstart", handleUserInteraction, {
        once: true,
      });
    };

    checkMobile();
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);
    window.addEventListener("resize", handleResize);
    handleResize();

    setIsVideoLoaded(true);

    video.load();

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Scroll direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section intersection observers
  useEffect(() => {
    const observer2 = new IntersectionObserver(
      ([entry]) => {
        setInSection2(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const observer3 = new IntersectionObserver(
      ([entry]) => {
        setInSection3(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (section2Ref.current) observer2.observe(section2Ref.current);
    if (section3Ref.current) observer3.observe(section3Ref.current);

    return () => {
      observer2.disconnect();
      observer3.disconnect();
    };
  }, []);

  // Cube animation logic
  useEffect(() => {
    if (inSection2 && scrollDirection === "down") {
      setCubeAnimated(true);
    } else if (scrollDirection === "up" || inSection3) {
      setCubeAnimated(false);
    }
  }, [inSection2, inSection3, scrollDirection]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest(".menu-container")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      <div className="scroll-smooth">
        {/* Section 1 - Hero with Video */}
        <div className="relative h-screen w-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            } ${isMobile ? "object-[70%_center]" : "object-center"}`}
          >
            <source src="/manta_video_artha.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {!isVideoLoaded && !videoError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center z-5">
              <div className="text-white text-center">
                <div className="animate-pulse mb-4">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <p className="text-lg">Loading...</p>
              </div>
            </div>
          )}

          {videoError && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black z-5" />
          )}

          <div className="absolute inset-0 bg-black/20 z-10" />

          {/* Header container - adjust padding */}
          <div className="absolute top-0 left-0 z-50 w-full px-8">
            <div className="flex items-center justify-between mt-3">
              {/* Left logo */}
              <div className="flex items-center -mt-12">
                <Image
                  src="/artha_logo_white.png"
                  alt="Artha Logo"
                  width={128}
                  height={32}
                  className="h-12 w-auto transition-transform duration-300 hover:scale-105"
                  style={{ height: "auto" }}
                />
              </div>
              {/* Right container */}
              <div className="flex items-center gap-1">
                <div className="flex items-center -mt-8">
                  <Image
                    src="/artha-manta-logo-white.png"
                    alt="Artha Manta Logo"
                    width={144}
                    height={36}
                    className="h-14 w-auto transition-transform duration-300 hover:scale-105"
                    style={{ height: "auto" }}
                  />
                </div>

                {/* Hamburger menu - adjusted margin */}
                <div className="relative menu-container -ml-16 -mt-8">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-3 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Open menu"
                  >
                    <div className="space-y-2">
                      <motion.div
                        className="w-8 h-0.5 bg-white"
                        animate={{
                          rotate: isMenuOpen ? 45 : 0,
                          y: isMenuOpen ? 8 : 0,
                        }}
                      />
                      <motion.div
                        className="w-8 h-0.5 bg-white"
                        animate={{ opacity: isMenuOpen ? 0 : 1 }}
                      />
                      <motion.div
                        className="w-8 h-0.5 bg-white"
                        animate={{
                          rotate: isMenuOpen ? -45 : 0,
                          y: isMenuOpen ? -8 : 0,
                        }}
                      />
                    </div>
                  </motion.button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 backdrop-blur-lg bg-white/10 rounded-lg shadow-2xl py-2 z-[100] border border-white/20"
                      >
                        <motion.a
                          href="/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-3 text-white hover:bg-white/20 transition-colors"
                          whileHover={{ x: 5 }}
                          style={{ fontFamily: "League Spartan, sans-serif" }}
                        >
                          Login
                        </motion.a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center">
              <h2
                className="text-4xl md:text-5xl font-light text-white"
                style={{ fontFamily: "League Spartan, sans-serif" }}
              >
                Turn insight into <span className="font-semibold">impact.</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Section 2 - About with Animated Cube */}
        <div
          ref={section2Ref}
          className="relative min-h-screen w-full bg-black flex items-center justify-center py-20"
        >
          <div className="max-w-6xl mx-auto px-8 text-center">
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ amount: 0.3 }} // Removed once: true
            >
              <motion.p
                className="text-white text-3xl md:text-4xl lg:text-5xl font-medium mb-8 leading-relaxed"
                style={{ fontFamily: "League Spartan, sans-serif" }}
              >
                At <span className="font-semibold">artha</span>, we harness
                intelligence to transform complex
                <br />
                purchase data into crystal-clear insights.
              </motion.p>

              <motion.p
                className="text-white text-3xl md:text-4xl lg:text-5xl font-medium leading-relaxed"
                style={{ fontFamily: "League Spartan, sans-serif" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ amount: 0.3 }} // Removed once: true
              >
                Our innovative technology uncovers hidden trends
                <br />
                and delivers actionable intelligence, empowering you to
                <br />
                make decisions that truly matter.
              </motion.p>
            </motion.div>

            <div ref={cubeRef} className="flex justify-center">
              <div
                className={`cube-container ${
                  cubeAnimated ? "animate" : "shrink"
                }`}
              >
                <div className="cube">
                  <div className="face front"></div>
                  <div className="face back"></div>
                  <div className="face right"></div>
                  <div className="face left"></div>
                  <div className="face top"></div>
                  <div className="face bottom"></div>

                  <div className="segment seg-1"></div>
                  <div className="segment seg-2"></div>
                  <div className="segment seg-3"></div>
                  <div className="segment seg-4"></div>
                  <div className="segment seg-5"></div>
                  <div className="segment seg-6"></div>
                  <div className="segment seg-7"></div>
                  <div className="segment seg-8"></div>
                  <div className="segment seg-9"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 - Feature Cards with Wave Background */}
        <div
          ref={section3Ref}
          className="relative py-20 overflow-hidden min-h-[80vh] bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900"
        >
          {/* Animated Wave Background */}
          <div className="absolute inset-0 z-0">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 1200 800"
            >
              <defs>
                <linearGradient
                  id="waveGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
                  <stop offset="50%" stopColor="rgba(168, 85, 247, 0.4)" />
                  <stop offset="100%" stopColor="rgba(236, 72, 153, 0.4)" />
                </linearGradient>
              </defs>
              <motion.path
                fill="url(#waveGradient)"
                initial={{
                  d: "M0,800 L1200,800 L1200,100 C900,200 500,0 200,100 L0,100 Z",
                }}
                animate={{
                  d: [
                    "M0,800 L1200,800 L1200,100 C900,200 500,0 200,100 L0,100 Z",
                    "M0,800 L1200,800 L1200,200 C900,100 500,300 200,200 L0,200 Z",
                    "M0,800 L1200,800 L1200,100 C900,200 500,0 200,100 L0,100 Z",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 10,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>

          {/* Update content container */}
          <div className="relative z-10 max-w-7xl mx-auto px-8 flex items-center justify-center min-h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <EnhancedFeatureCard
                  key={feature.title}
                  {...feature}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section 4 - Contact Form */}
        <div className="relative min-h-screen flex flex-col lg:flex-row items-stretch bg-black overflow-hidden">
          {/* Left Content */}
          <motion.div
            className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ amount: 0.3 }} // Removed once: true
          >
            <div className="max-w-xl">
              <motion.h2
                className="text-5xl font-light text-white mb-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ amount: 0.3 }} // Removed once: true
              >
                {"Let\u2019s Build Something"} <br />
                <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Extraordinary
                </span>
              </motion.h2>
              <motion.p
                className="text-xl text-gray-400 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ amount: 0.3 }} // Removed once: true
              >
                Transform your digital presence with our cutting-edge solutions.
              </motion.p>
            </div>
          </motion.div>

          {/* Right Content - Contact Form */}
          <motion.div
            className="w-full lg:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ amount: 0.3 }} // Removed once: true
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-blue-900/90 backdrop-blur-xl" />

            <div className="relative h-full flex items-center justify-center p-8">
              <EnhancedContactForm />
            </div>
          </motion.div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AnimatedBackground />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-4">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 mb-4">
              <a
                href="#"
                className="hover:text-white transition-colors"
                style={{ fontFamily: "League Spartan, sans-serif" }}
              >
                Terms & Conditions
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                style={{ fontFamily: "League Spartan, sans-serif" }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                style={{ fontFamily: "League Spartan, sans-serif" }}
              >
                Refund Policy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                style={{ fontFamily: "League Spartan, sans-serif" }}
              >
                Accessibility Statement
              </a>
            </div>
            <div className="text-center text-sm">
              <p style={{ fontFamily: "League Spartan, sans-serif" }}>
                © 2025 Artha. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }

        .cube-container {
          perspective: 1000px;
          width: 120px;
          height: 120px;
          position: relative;
          transition: transform 0.5s ease-in-out;
        }

        .cube-container.shrink {
          transform: scale(0.4) !important;
        }

        .cube-container.shrink .segment {
          opacity: 0 !important;
          transform: translate3d(0, 0, 0) !important;
        }

        .cube {
          position: relative;
          width: 120px;
          height: 120px;
          transform-style: preserve-3d;
          transition: transform 3s ease-in-out;
        }

        .face {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 2s ease-in-out;
        }

        .front {
          background: linear-gradient(135deg, #ff006e, #8338ec);
          transform: rotateY(0deg) translateZ(60px);
        }
        .back {
          background: linear-gradient(135deg, #3a86ff, #06ffa5);
          transform: rotateY(180deg) translateZ(60px);
        }
        .right {
          background: linear-gradient(135deg, #ffbe0b, #fb5607);
          transform: rotateY(90deg) translateZ(60px);
        }
        .left {
          background: linear-gradient(135deg, #8338ec, #3a86ff);
          transform: rotateY(-90deg) translateZ(60px);
        }
        .top {
          background: linear-gradient(135deg, #06ffa5, #ffbe0b);
          transform: rotateX(90deg) translateZ(60px);
        }
        .bottom {
          background: linear-gradient(135deg, #fb5607, #ff006e);
          transform: rotateX(-90deg) translateZ(60px);
        }

        .segment {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          opacity: 0;
          transition: all 2.5s ease-in-out;
          transform-style: preserve-3d;
        }

        .seg-1 {
          background: linear-gradient(135deg, #ff006e, #8338ec);
        }
        .seg-2 {
          background: linear-gradient(135deg, #3a86ff, #06ffa5);
        }
        .seg-3 {
          background: linear-gradient(135deg, #ffbe0b, #fb5607);
        }
        .seg-4 {
          background: linear-gradient(135deg, #8338ec, #3a86ff);
        }
        .seg-5 {
          background: linear-gradient(135deg, #06ffa5, #ffbe0b);
        }
        .seg-6 {
          background: linear-gradient(135deg, #fb5607, #ff006e);
        }
        .seg-7 {
          background: linear-gradient(135deg, #ff006e, #06ffa5);
        }
        .seg-8 {
          background: linear-gradient(135deg, #3a86ff, #ffbe0b);
        }
        .seg-9 {
          background: linear-gradient(135deg, #8338ec, #fb5607);
        }

        .cube-container:not(.animate):not(.shrink) .cube {
          transform: rotateX(0deg) rotateY(0deg) scale(0.8);
        }

        .cube-container.animate .cube {
          transform: rotateX(360deg) rotateY(720deg) scale(1.2);
          animation: cubeExpand 4s ease-in-out forwards;
        }

        .cube-container.animate .face {
          opacity: 0.7;
          transform-origin: center;
        }

        .cube-container.animate .front {
          transform: rotateY(0deg) translateZ(100px) scale(0.8);
        }
        .cube-container.animate .back {
          transform: rotateY(180deg) translateZ(100px) scale(0.8);
        }
        .cube-container.animate .right {
          transform: rotateY(90deg) translateZ(100px) scale(0.8);
        }
        .cube-container.animate .left {
          transform: rotateY(-90deg) translateZ(100px) scale(0.8);
        }
        .cube-container.animate .top {
          transform: rotateX(90deg) translateZ(100px) scale(0.8);
        }
        .cube-container.animate .bottom {
          transform: rotateX(-90deg) translateZ(100px) scale(0.8);
        }

        .cube-container.animate .segment {
          opacity: 1;
          animation: segmentFloat 3s ease-in-out forwards;
        }

        .cube-container.animate .seg-1 {
          transform: translate3d(-80px, -80px, 80px) rotateY(45deg);
          animation-delay: 0.5s;
        }
        .cube-container.animate .seg-2 {
          transform: translate3d(80px, -80px, 80px) rotateX(45deg);
          animation-delay: 0.7s;
        }
        .cube-container.animate .seg-3 {
          transform: translate3d(80px, 80px, 80px) rotateZ(45deg);
          animation-delay: 0.9s;
        }
        .cube-container.animate .seg-4 {
          transform: translate3d(-80px, 80px, 80px) rotateY(-45deg);
          animation-delay: 1.1s;
        }
        .cube-container.animate .seg-5 {
          transform: translate3d(0px, -100px, 0px) rotateX(90deg);
          animation-delay: 1.3s;
        }
        .cube-container.animate .seg-6 {
          transform: translate3d(100px, 0px, 0px) rotateY(90deg);
          animation-delay: 1.5s;
        }
        .cube-container.animate .seg-7 {
          transform: translate3d(0px, 100px, 0px) rotateX(-90deg);
          animation-delay: 1.7s;
        }
        .cube-container.animate .seg-8 {
          transform: translate3d(-100px, 0px, 0px) rotateY(-90deg);
          animation-delay: 1.9s;
        }
        .cube-container.animate .seg-9 {
          transform: translate3d(0px, 0px, -100px) rotateZ(180deg);
          animation-delay: 2.1s;
        }

        @keyframes cubeExpand {
          0% {
            transform: rotateX(0deg) rotateY(0deg) scale(0.8);
          }
          50% {
            transform: rotateX(180deg) rotateY(360deg) scale(1.5);
          }
          100% {
            transform: rotateX(360deg) rotateY(720deg) scale(1.2);
          }
        }

        @keyframes segmentFloat {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.8;
          }
        }

        @media (max-width: 768px) {
          /* Updated mobile logo sizes and positioning */
          img[alt="Artha Logo"] {
            height: 3rem !important; /* Reduced from 3.5rem */
          }
          
          img[alt="Artha Manta Logo"] {
            height: 4rem !important; /* Reduced from 4.5rem */
          }
          
          /* Adjusted mobile spacing */
          .absolute.top-0.left-0.z-50.w-full.px-8 {
            padding: 0.25rem 1rem; /* Reduced padding */
          }
          
          .absolute.top-0.left-0.z-50.w-full.px-8 .flex.items-center.justify-between {
            gap: 0.5rem;
            margin-top: 0.25rem; /* Reduced from 0.5rem */
          }
        }

        /* Updated menu container styles */
        .menu-container {
          position: relative;
          z-index: 100;
        }

        .menu-container button {
          position: relative;
          z-index: 101;
          width: 52px; /* Slightly larger clickable area */
          height: 52px;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-center;
        }

        /* Enhanced dropdown styling */
        .menu-container > div[class*="absolute"] {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          z-index: 102;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
}

// Enhanced Feature Card Component
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

const EnhancedFeatureCard = ({
  title,
  description,
  icon,
  index,
}: FeatureCardProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 100, scale: 0.8 }
      }
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/20 transition-all duration-300" // Changed p-8 to p-10
    >
      <motion.div
        className="w-20 h-20 mb-8 relative" // Changed from w-16 h-16 mb-6
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        {icon}
      </motion.div>
      <h3
        className="text-3xl font-bold text-white mb-6" // Changed from text-2xl and mb-4
        style={{ fontFamily: "League Spartan, sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="text-lg text-gray-300 leading-relaxed" // Added text-lg
        style={{ fontFamily: "League Spartan, sans-serif" }}
      >
        {description}
      </p>
    </motion.div>
  );
};

// Enhanced Contact Form Component
const EnhancedContactForm = () => {
  return (
    <motion.div
      className="w-full max-w-md space-y-8 p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ amount: 0.3 }} // Removed once: true
    >
      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <input
              type="text"
              placeholder="First Name *"
              required
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ fontFamily: "League Spartan, sans-serif" }}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <input
              type="text"
              placeholder="Last Name"
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ fontFamily: "League Spartan, sans-serif" }}
            />
          </motion.div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <input
            type="email"
            placeholder="Email Address *"
            required
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ fontFamily: "League Spartan, sans-serif" }}
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <input
            type="tel"
            placeholder="Phone Number"
            pattern="[0-9]{10}"
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ fontFamily: "League Spartan, sans-serif" }}
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <textarea
            placeholder="Your Message"
            rows={4}
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            style={{ fontFamily: "League Spartan, sans-serif" }}
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          style={{ fontFamily: "League Spartan, sans-serif" }}
        >
          Get in touch
        </motion.button>
      </form>
    </motion.div>
  );
};

// Animated Background Component
const AnimatedBackground = () => {
  const [particles, setParticles] = useState<
    Array<{ id: number; left: number; top: number }>
  >([]);

  useEffect(() => {
    // Generate particles only on client-side
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

const features = [
  {
    title: "Precision Analytics",
    description:
      "Leverage advanced algorithms and granular data breakdowns to drive measurable outcomes.",
    icon: (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
    ),
  },
  {
    title: "Real Time Insights",
    description:
      "Monitor and adjust strategies instantly with real-time data analysis and reporting.",
    icon: (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
    ),
  },
  {
    title: "Strategic Impact",
    description:
      "Transform insights into actionable intelligence for measurable business impact.",
    icon: (
      <div className="w-full h-full bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
    ),
  },
];
