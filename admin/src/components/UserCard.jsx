import { motion } from 'framer-motion';
import React from 'react';
import { FiUsers } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const UserCard = ({ title, navigateTo }) => {
    const navigate = useNavigate();

    return (
      <motion.div
          variants={{
              initial: { scale: 0.5, y: 50, opacity: 0 },
              animate: { scale: 1, y: 0, opacity: 1 },
          }}
          transition={{ type: "spring", mass: 3, stiffness: 400, damping: 50 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate(navigateTo)}
          className="relative w-full max-w-[350px] h-[200px] sm:h-[200px] rounded-xl cursor-pointer bg-white border border-gray-300 overflow-hidden group shadow-lg flex flex-col items-center justify-center"
      >
          {/* Background Gradient Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#A81010] to-red-700 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />

          {/* Large Background Icon */}
          <FiUsers className="absolute z-0 -top-12 -right-12 text-9xl text-gray-100 group-hover:text-gray-100 group-hover:rotate-12 transition-transform duration-300" />

          {/* Foreground Content */}
          <div className="relative z-10 text-center">
              
              <p className="text-2xl font-semibold text-gray-600 group-hover:text-red-200 transition-colors duration-300 p-14"> {/* Added p-2 */}
                  {title}
              </p>
          </div>
      </motion.div>
  );
};

// Attendance Cards
export const AttendanceStudentCard = () => <UserCard title="Student Attendance" navigateTo="/attendance-student" />;
export const AttendanceTeacherCard = () => <UserCard title="Teacher Attendance" navigateTo="/attendance-teacher" />;

// Add Users
export const AddStudentCard = () => <UserCard title="Add Student" navigateTo="/add-student" />;
export const AddTeachersCard = () => <UserCard title="Add Teacher" navigateTo="/add-teacher" />;

// All Users
export const StudentCard = () => <UserCard title="List of Students" navigateTo="/student-list" />;
export const TeacherCard = () => <UserCard title="List of Teachers" navigateTo="/teacher-list" />;

// Card Container Component with Responsive Grid and Centering
const CardContainer = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <motion.div
                initial="initial"
                animate="animate"
                transition={{ staggerChildren: 0.1 }}
                className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full justify-items-center"
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
};

const cardAnimation = {
    initial: { scale: 0.5, y: 50, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    transition: { type: "spring", mass: 3, stiffness: 400, damping: 50 },
};

export default CardContainer;