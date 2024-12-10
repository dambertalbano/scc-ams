import React, { useState, useEffect } from 'react';

const AttendanceTeacherCard = () => {
  // Mock data: Simulating teachers with ID, name, and time records
  const mockTeachers = [
    { teacherId: '001', name: 'Charli XCX', timeIn: '07:50 AM', timeOut: '03:50 PM' },
    { teacherId: '002', name: 'Ariana Grande', timeIn: '08:00 AM', timeOut: '04:00 PM' },
    { teacherId: '003', name: 'Imogen Heap', timeIn: '08:10 AM', timeOut: '04:10 PM' },
  ];

  // States for storing teachers who have timed in and timed out
  const [timedInTeachers, setTimedInTeachers] = useState([]);
  const [timedOutTeachers, setTimedOutTeachers] = useState([]);
  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);

  // Simulate the data
  const simulateTeacherData = () => {
    const timedIn = mockTeachers.map(teacher => ({
      teacherId: teacher.teacherId,
      name: teacher.name,
      timeIn: teacher.timeIn,
    }));

    const timedOut = mockTeachers.map(teacher => ({
      teacherId: teacher.teacherId,
      name: teacher.name,
      timeOut: teacher.timeOut,
    }));

    setTimedInTeachers(timedIn);
    setTimedOutTeachers(timedOut);
  };

  // Toggle between viewing time-in or time-out teachers
  const toggleView = (view) => {
    setIsViewingTimeIn(view === 'timeIn');
  };

  useEffect(() => {
    simulateTeacherData();
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-lg w-full">
      <div className="mb-4 flex justify-center">
        <button
          className="bg-black text-white text-sm font-medium py-2 px-4 rounded mr-2 hover:bg-gray-200 hover:text-black"
          onClick={() => toggleView('timeIn')}
        >
          View Time-In
        </button>
        <button
          className="bg-red-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-red-600"
          onClick={() => toggleView('timeOut')}
        >
          View Time-Out
        </button>
      </div>

      {/* Display the Time-In or Time-Out results based on toggle */}
      <div>
        <table className="min-w-full table-auto border-collapse mt-5">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Teacher ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">{isViewingTimeIn ? 'Time-In' : 'Time-Out'}</th>
            </tr>
          </thead>
          <tbody>
            {isViewingTimeIn
              ? timedInTeachers.map((teacher) => (
                  <tr key={teacher.teacherId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{teacher.teacherId}</td>
                    <td className="px-4 py-2">{teacher.name}</td>
                    <td className="px-4 py-2">{teacher.timeIn}</td>
                  </tr>
                ))
              : timedOutTeachers.map((teacher) => (
                  <tr key={teacher.teacherId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{teacher.teacherId}</td>
                    <td className="px-4 py-2">{teacher.name}</td>
                    <td className="px-4 py-2">{teacher.timeOut}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTeacherCard;
