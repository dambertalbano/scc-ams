import { motion } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import { FiUsers } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';

const Dashboard = () => {
  const { aToken, getDashData, dashData } = useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Dashboard - SCC AMS'; // Added SCC AMS for consistency
  }, []);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken, getDashData]); // Added getDashData to dependency array

  const handleCardClick = (category) => {
    switch (category) {
      case 'Students':
        navigate('/student-list');
        break;
      case 'Teachers':
        navigate('/teacher-list');
        break;
      default:
        break;
    }
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
    >
      {dashData && (
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 w-full max-w-4xl justify-center"
        >
          {[
            { name: "Students", count: dashData.students },
            { name: "Teachers", count: dashData.teachers },
          ].map((item) => (
            <Card
              key={item.name}
              name={item.name}
              count={item.count}
              onClick={() => handleCardClick(item.name)}
            />
          ))}
        </motion.div>
      )}
      {!dashData && (
        <div className="text-white text-xl">Loading dashboard data...</div>
      )}
    </motion.div>
  );
};

const Card = ({ name, count, onClick }) => {
  const cardVariants = {
    initial: { scale: 0.8, y: 30, opacity: 0 },
    animate: {
      scale: 1,
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="relative w-full max-w-[350px] h-[200px] rounded-xl cursor-pointer bg-white border border-gray-300 overflow-hidden group shadow-lg flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#A81010] to-red-700 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />

      <FiUsers className="absolute z-0 -top-12 -right-12 text-9xl text-gray-100 group-hover:text-gray-100 group-hover:rotate-12 transition-transform duration-300" />

      <div className="relative z-10 text-center">
        <p className="text-4xl sm:text-5xl font-bold text-gray-600 group-hover:text-red-200 transition-colors duration-300">
          {count !== undefined && count !== null ? count : '0'}
        </p>
        <p className="text-lg sm:text-xl font-semibold text-gray-500 group-hover:text-red-100 transition-colors duration-300 mt-1">
          {name}
        </p>
      </div>
    </motion.div>
  );
};

export default Dashboard;