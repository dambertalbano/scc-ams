import React, { useEffect, useState } from 'react';

const AttendanceUtilityCard = () => {
  
  const utilityStaff = [
    {
        utilityId: '10847189231',
        name: 'Christopher Laciapag',
        timeIn: '08:30 AM',
        timeOut: '04:30 PM',
    },
    {
        utilityId: '932163141',
        name: 'Vladi Jamani',
        timeIn: '09:15 AM',
        timeOut: '05:00 PM',
    },
    {
        utilityId: '20485937281',
        name: 'Maricar D. Ramos',
        timeIn: '08:00 AM',
        timeOut: '04:00 PM',
    },
    {
        utilityId: '31028475629',
        name: 'Jericho P. Cruz',
        timeIn: '08:45 AM',
        timeOut: '05:15 PM',
    },
    {
        utilityId: '47520391842',
        name: 'Angela M. De Leon',
        timeIn: '09:00 AM',
        timeOut: '05:30 PM',
    },
    {
        utilityId: '58392017462',
        name: 'Oscar B. Santos',
        timeIn: '07:50 AM',
        timeOut: '03:50 PM',
    },
    {
        utilityId: '69203847159',
        name: 'Eleanor G. Flores',
        timeIn: '08:15 AM',
        timeOut: '04:45 PM',
    },
    {
        utilityId: '73829104628',
        name: 'Manuel R. Lopez',
        timeIn: '08:20 AM',
        timeOut: '05:00 PM',
    },
    {
        utilityId: '84930271593',
        name: 'Jasmine H. Villar',
        timeIn: '09:10 AM',
        timeOut: '05:20 PM',
    },
    {
        utilityId: '95812037465',
        name: 'Dario S. Fernandez',
        timeIn: '08:40 AM',
        timeOut: '05:10 PM',
    },
];

  const [timedInUtilityStaff, setTimedInUtilityStaff] = useState([]);
  const [timedOutUtilityStaff, setTimedOutUtilityStaff] = useState([]);
  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);

  // Simulate the data for time-in and time-out
  const simulateUtilityData = () => {
    const timedIn = utilityStaff.map(utility => ({
      utilityId: utility.utilityId,
      name: utility.name,
      timeIn: utility.timeIn,
    }));

    const timedOut = utilityStaff.map(utility => ({
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
          className="bg-green-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-green-600"
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
