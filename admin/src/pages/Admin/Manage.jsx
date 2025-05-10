import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { ScheduleCard, SubjectCard } from "../../components/UserCard"; // Adjust import path if necessary

function Manage() {
  useEffect(() => {
    document.title = 'Manage System - SCC AMS'; // Updated title for clarity and consistency
  }, []);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const cardContainerVariants = {
    initial: {}, // Can be empty if pageVariants handles initial opacity
    animate: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }, // Stagger cards after page fades in
  };

  return (
    <motion.div // Changed to motion.div and applied page variants and new styling
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10" // Kiosk-like background
    >
      <motion.div
        variants={cardContainerVariants} // Apply variants for staggering
        initial="initial"
        animate="animate"
        className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 place-items-center w-full max-w-4xl" // Adjusted gaps and max-width
      >
        <motion.div variants={cardAnimation} className="w-full"> {/* Ensure cards take full width */}
          <SubjectCard />
        </motion.div>
        <motion.div variants={cardAnimation} className="w-full"> {/* Ensure cards take full width */}
          <ScheduleCard />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const cardAnimation = {
  initial: { scale: 0.8, y: 30, opacity: 0 }, // Adjusted for consistency
  animate: { 
    scale: 1, 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 } // Adjusted for consistency
  },
  // Removed separate transition object, it's part of animate
};

export default Manage;
