import { motion } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import { FiUsers } from "react-icons/fi"; // All cards use this icon
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';

const Dashboard = () => {
  const { aToken, getDashData, dashData } = useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Dashboard';
    }, []);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

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

  return (
    dashData && (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-6xl justify-center"
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
      </div>
    )
  );
};

const Card = ({ name, count, onClick }) => {
  return (
    <motion.div
            variants={{
                initial: { scale: 0.5, y: 50, opacity: 0 },
                animate: { scale: 1, y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", mass: 3, stiffness: 400, damping: 50 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className="relative w-full p-14 rounded-lg border border-gray-300 cursor-pointer bg-white overflow-hidden group shadow-md" // Increased padding from p-8 to p-12
        >
            {/* Background */}
            <div className="absolute inset-0 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"
                style={{
                    background: 'linear-gradient(to right, rgba(168, 16, 16, 1), rgba(168, 16, 16, 0.5), rgba(255, 255, 255, 0.5))',
                }} />

            {/* Large Background Person Icon */}
            <FiUsers className="absolute z-0 -top-12 -right-12 text-9xl text-gray-300 group-hover:text-customRed group-hover:rotate-12 transition-transform duration-300" />

            {/* Foreground Content */}
            <div className="relative z-10">
                <p className="text-5xl font-bold text-gray-700 group-hover:text-white transition-colors duration-300">{count}</p>
                <p className="text-xl font-semibold text-gray-600 group-hover:text-red-200 transition-colors duration-300">{name}</p>
            </div>
        </motion.div>
  );
};

export default Dashboard;