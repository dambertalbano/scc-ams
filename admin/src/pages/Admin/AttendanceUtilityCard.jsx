import React, { useState, useEffect } from 'react';

const AttendanceUtilityCard = () => {
  // Mock data: Simulating utility staff with ID, name, and time records
  const mockUtilityStaff = [
    { utilityId: 'U001', name: 'Ethel Cain', timeIn: '06:50 AM', timeOut: '02:50 PM' },
    { utilityId: 'U002', name: 'Doja Cat', timeIn: '07:00 AM', timeOut: '03:00 PM' },
    { utilityId: 'U003', name: 'Brat Summer', timeIn: '07:10 AM', timeOut: '03:10 PM' },
  ];

  // States for storing utility staff who have timed in and timed out
  const [timedInUtilityStaff, setTimedInUtilityStaff] = useState([]);
  const [timedOutUtilityStaff, setTimedOutUtilityStaff] = useState([]);
  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);

  // Simulate the data
  const simulateUtilityData = () => {
    const timedIn = mockUtilityStaff.map(utility => ({
      utilityId: utility.utilityId,
      name: utility.name,
      timeIn: utility.timeIn,
    }));

    const timedOut = mockUtilityStaff.map(utility => ({
      utilityId: utility.utilityId,
      name: utility.name,
      timeOut: utility.timeOut,
    }));

    setTimedInUtilityStaff(timedIn);
    setTimedOutUtilityStaff(timedOut);
  };

  // Toggle between viewing time-in or time-out utility staff
  const toggleView = (view) => {
    setIsViewingTimeIn(view === 'timeIn');
  };

  useEffect(() => {
    simulateUtilityData();
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
              <th className="px-4 py-2 text-left">Utility ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">{isViewingTimeIn ? 'Time-In' : 'Time-Out'}</th>
            </tr>
          </thead>
          <tbody>
            {isViewingTimeIn
              ? timedInUtilityStaff.map((utility) => (
                  <tr key={utility.utilityId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{utility.utilityId}</td>
                    <td className="px-4 py-2">{utility.name}</td>
                    <td className="px-4 py-2">{utility.timeIn}</td>
                  </tr>
                ))
              : timedOutUtilityStaff.map((utility) => (
                  <tr key={utility.utilityId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{utility.utilityId}</td>
                    <td className="px-4 py-2">{utility.name}</td>
                    <td className="px-4 py-2">{utility.timeOut}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceUtilityCard;
