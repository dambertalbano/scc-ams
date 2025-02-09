import React, { useEffect, useState } from 'react';
import { assets } from '../../assets/assets';

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState({
    teacherName: 'Teacher!',
    totalStudents: 100,
    teacherAttendance: 3,
  });

  useEffect(() => {
    // Simulate fetching teacher's attendance and student data
    // You can replace this with an actual API call in a real app.
  }, []);

  return teacherData && (
    <div className="m-5">
      <div className="text-xl font-semibold text-gray-600 mb-4">
        <p>Welcome, {teacherData.teacherName}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {/* Total Students */}
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.people_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{teacherData.totalStudents}</p>
            <p className="text-gray-400">Total Students</p>
          </div>
        </div>
        {/* Attendance Records */}
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.appointment_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{teacherData.teacherAttendance}</p>
            <p className="text-gray-400">Attendance Record</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;