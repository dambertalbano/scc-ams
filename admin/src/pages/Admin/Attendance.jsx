import { motion } from "framer-motion";
import React, { useEffect } from "react";
import {
  AttendanceStudentCard,
  AttendanceTeacherCard,
} from "../../components/UserCard";

function Attendance() {

  useEffect(() => {
    document.title = 'Attendance';
    }, []);

    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 p-6">
        
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 place-items-center"
          >
            <motion.div variants={cardAnimation}>
              <AttendanceStudentCard />
            </motion.div>
            <motion.div variants={cardAnimation}>
              <AttendanceTeacherCard />
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

export default Attendance;