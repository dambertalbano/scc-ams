import React, { useEffect, useState } from 'react';

const AttendanceAdministratorCard = () => {
  // Hardcoded administrator data
  const administrators = [
    {
        adminId: '1398612491',
        name: 'Neil Briones',
        timeIn: '7:43 AM',
        timeOut: '5:30 PM',
    },
    {
        adminId: '93213714',
        name: 'Chester C. Muñez',
        timeIn: '7:21 AM',
        timeOut: '5:15 PM',
    },
    {
        adminId: '46293811',
        name: 'Marie S. Delgado',
        timeIn: '8:00 AM',
        timeOut: '6:00 PM',
    },
    {
        adminId: '57329102',
        name: 'John A. Santos',
        timeIn: '7:35 AM',
        timeOut: '5:25 PM',
    },
    {
        adminId: '71829384',
        name: 'Clarisse D. Ramos',
        timeIn: '7:45 AM',
        timeOut: '5:50 PM',
    },
    {
        adminId: '83926145',
        name: 'Gabriel R. Lim',
        timeIn: '7:30 AM',
        timeOut: '5:20 PM',
    },
    {
        adminId: '92837465',
        name: 'Sophia L. Cruz',
        timeIn: '7:50 AM',
        timeOut: '5:45 PM',
    },
    {
        adminId: '49503827',
        name: 'Michael E. Tan',
        timeIn: '8:05 AM',
        timeOut: '6:10 PM',
    },
    {
        adminId: '76019384',
        name: 'Andrea P. Guzman',
        timeIn: '7:40 AM',
        timeOut: '5:35 PM',
    },
    {
        adminId: '65218473',
        name: 'Victor C. Lopez',
        timeIn: '7:55 AM',
        timeOut: '5:40 PM',
    },
];

  const [timedInAdmins, setTimedInAdmins] = useState([]);
  const [timedOutAdmins, setTimedOutAdmins] = useState([]);
  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);

  // Simulate the data
  const simulateAdminData = () => {
    const timedIn = administrators.map(admin => ({
      adminId: admin.adminId,
      name: admin.name,
      timeIn: admin.timeIn,
    }));

    const timedOut = administrators.map(admin => ({
      adminId: admin.adminId,
      name: admin.name,
      timeOut: admin.timeOut,
    }));

    setTimedInAdmins(timedIn);
    setTimedOutAdmins(timedOut);
  };

  // Toggle between viewing time-in or time-out admins
  const toggleView = (view) => {
    setIsViewingTimeIn(view === 'timeIn');
  };

  useEffect(() => {
    simulateAdminData();
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
              <th className="px-4 py-2 text-left">Admin ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">{isViewingTimeIn ? 'Time-In' : 'Time-Out'}</th>
            </tr>
          </thead>
          <tbody>
            {isViewingTimeIn
              ? timedInAdmins.map((admin) => (
                  <tr key={admin.adminId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{admin.adminId}</td>
                    <td className="px-4 py-2">{admin.name}</td>
                    <td className="px-4 py-2">{admin.timeIn}</td>
                  </tr>
                ))
              : timedOutAdmins.map((admin) => (
                  <tr key={admin.adminId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{admin.adminId}</td>
                    <td className="px-4 py-2">{admin.name}</td>
                    <td className="px-4 py-2">{admin.timeOut}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceAdministratorCard;
