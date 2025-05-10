import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { StudentCard, TeacherCard } from "../../components/UserCard";

function AllUsers() {
  useEffect(() => {
    document.title = 'User List - SCC AMS'; // Added SCC AMS for consistency
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

  const cardAnimation = {
    initial: { scale: 0.8, y: 30, opacity: 0 },
    animate: { 
      scale: 1, 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
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
        initial="initial" // Inherit or define explicitly
        animate="animate" // Inherit or define explicitly
        className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 place-items-center w-full max-w-4xl" // Adjusted max-width and gaps
      >
        <motion.div variants={cardAnimation} className="w-full"> {/* Ensure cards take full width of their grid cell */}
          <StudentCard />
        </motion.div>

        <motion.div variants={cardAnimation} className="w-full"> {/* Ensure cards take full width of their grid cell */}
          <TeacherCard />
        </motion.div>

      </motion.div>
    </motion.div>
  );
}

export default AllUsers;
