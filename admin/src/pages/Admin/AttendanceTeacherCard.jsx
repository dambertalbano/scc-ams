import React, { useState } from 'react';

const AttendanceTeacherCard = () => {
  // Hardcoded teacher data
  const teachers = [
    {
        teacherId: '929317412',
        name: 'Krystal Mariano',
        timeIn: '6:00 AM',
        timeOut: '5:00 PM',
    },
    {
        teacherId: '003', // No ID was provided for Rhodalyn, using '003' here
        name: 'Rhodalyn N. Baguan',
        timeIn: '6:07 AM',
        timeOut: '5:15 PM',
    },
    {
        teacherId: '104857392',
        name: 'Michael D. Cruz',
        timeIn: '6:10 AM',
        timeOut: '5:20 PM',
    },
    {
        teacherId: '293847561',
        name: 'Sandra L. Velasco',
        timeIn: '6:05 AM',
        timeOut: '5:10 PM',
    },
    {
        teacherId: '384756192',
        name: 'Arvin R. Santos',
        timeIn: '6:15 AM',
        timeOut: '5:25 PM',
    },
    {
        teacherId: '475920384',
        name: 'Cynthia P. Lopez',
        timeIn: '6:30 AM',
        timeOut: '5:45 PM',
    },
    {
        teacherId: '592038471',
        name: 'Jerome G. Dela Cruz',
        timeIn: '6:20 AM',
        timeOut: '5:35 PM',
    },
    {
        teacherId: '672910384',
        name: 'Diana S. Reyes',
        timeIn: '6:12 AM',
        timeOut: '5:18 PM',
    },
    {
        teacherId: '748392010',
        name: 'Nathaniel J. Garcia',
        timeIn: '6:25 AM',
        timeOut: '5:40 PM',
    },
    {
        teacherId: '839204750',
        name: 'Lucia H. Fernandez',
        timeIn: '6:18 AM',
        timeOut: '5:28 PM',
    },
];


  const [timedInTeachers, setTimedInTeachers] = useState([]);
  const [timedOutTeachers, setTimedOutTeachers] = useState([]);
  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);

  // Simulate the data
  const simulateTeacherData = () => {
    const timedIn = teachers.map(teacher => ({
      teacherId: teacher.teacherId,
      name: teacher.name,
      timeIn: teacher.timeIn,
    }));

    const timedOut = teachers.map(teacher => ({
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

  React.useEffect(() => {
    simulateTeacherData();
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
