"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingMessagesProps {
  messages: Array<{
    text: string;
    emoji?: string;
  }>;
}

export function LoadingMessages({ messages }: LoadingMessagesProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!messages.length) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 800); // Increased fade out time for smoother transition
      
    }, 4000); // Increased display time for better readability

    return () => clearInterval(interval);
  }, [messages]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  const emojiVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1.2,
      transition: {
        duration: 0.5,
        yoyo: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[300px]">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentMessageIndex}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center"
          >
            <motion.div
              variants={emojiVariants}
              className="text-6xl mb-8"
            >
              {messages[currentMessageIndex].emoji}
            </motion.div>
            
            <motion.p 
              variants={textVariants}
              className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400"
            >
              {messages[currentMessageIndex].text}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}