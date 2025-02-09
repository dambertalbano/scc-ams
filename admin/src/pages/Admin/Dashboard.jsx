import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';

const Dashboard = () => {
  const { aToken, getDashData, dashData } = useContext(AdminContext);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  // Handler function for card clicks to navigate
  const handleCardClick = (category) => {
    switch (category) {
      case 'Students':
        navigate('/student-list'); // Navigate to the student list page
        break;
      case 'Teachers':
        navigate('/teacher-list'); // Navigate to the teacher list page
        break;
      case 'Administrators':
        navigate('/administrator-list'); // Navigate to the administrator list page
        break;
      case 'Utilities':
        navigate('/utility-list'); // Navigate to the utility list page
        break;
      default:
        break;
    }
  };

  return dashData && (
    <div className="m-5">
      <div className="flex flex-wrap gap-5 justify-center"> {/* Centered the cards and added larger gaps */}
        
        {/* Students Card */}
        <div
          className="flex items-center gap-2 bg-white p-5 min-w-[220px] max-w-[300px] rounded-xl border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-lg"
          onClick={() => handleCardClick('Students')}
        >
          <img className="w-16" src={assets.people_icon} alt="Students" />
          <div>
            <p className="text-2xl font-semibold text-gray-600">{dashData.students}</p>
            <p className="text-gray-500">Students</p>
          </div>
        </div>

        {/* Teachers Card */}
        <div
          className="flex items-center gap-2 bg-white p-5 min-w-[220px] max-w-[300px] rounded-xl border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-lg"
          onClick={() => handleCardClick('Teachers')}
        >
          <img className="w-16" src={assets.people_icon} alt="Teachers" />
          <div>
            <p className="text-2xl font-semibold text-gray-600">{dashData.teachers}</p>
            <p className="text-gray-500">Teachers</p>
          </div>
        </div>

        {/* Administrators Card */}
        <div
          className="flex items-center gap-2 bg-white p-5 min-w-[220px] max-w-[300px] rounded-xl border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-lg"
          onClick={() => handleCardClick('Administrators')}
        >
          <img className="w-16" src={assets.people_icon} alt="Administrators" />
          <div>
            <p className="text-2xl font-semibold text-gray-600">{dashData.administrators}</p>
            <p className="text-gray-500">Administrators</p>
          </div>
        </div>

        {/* Utilities Card */}
        <div
          className="flex items-center gap-2 bg-white p-5 min-w-[220px] max-w-[300px] rounded-xl border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-lg"
          onClick={() => handleCardClick('Utilities')}
        >
          <img className="w-16" src={assets.people_icon} alt="Utilities" />
          <div>
            <p className="text-2xl font-semibold text-gray-600">{dashData.utilitys}</p>
            <p className="text-gray-500">Utilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
