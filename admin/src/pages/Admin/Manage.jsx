import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { ScheduleCard, SubjectCard } from "../../components/UserCard"; // Adjust import path if necessary

function Manage() {
  useEffect(() => {
    document.title = 'Manage - Admin';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.1 }}
        className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 place-items-center"
      >
        <motion.div variants={cardAnimation}>
          <SubjectCard />
        </motion.div>
        <motion.div variants={cardAnimation}>
          <ScheduleCard />
        </motion.div>
      </motion.div>
    </div>
  );
}

const cardAnimation = {
  initial: { scale: 0.5, y: 50, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1 },
  transition: { type: "spring", mass: 3, stiffness: 400, damping: 50 },
};

export default Manage;
