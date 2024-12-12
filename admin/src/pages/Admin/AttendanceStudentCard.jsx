import React, { useState } from 'react';

const AttendanceStudentCard = () => {
  // Hardcoded student attendance data
  const students = [
    {
        studentId: '3921317213',
        name: 'Kyle Dexter Macasubang',
        grade: 'Grade 10',
        section: 'A',
        timeIn: '6:36 AM',
        timeOut: '5:30 PM',
    },
    {
        studentId: '93217841239',
        name: 'Bea Mariz A.',
        grade: 'Grade 8',
        section: 'D',
        timeIn: '6:01 AM',
        timeOut: '5:43 PM',
    },
    {
        studentId: '1038472941',
        name: 'Liam J. Castillo',
        grade: 'Grade 12',
        section: 'B',
        timeIn: '6:15 AM',
        timeOut: '5:50 PM',
    },
    {
        studentId: '2093485729',
        name: 'Sofia G. Mendoza',
        grade: 'Grade 9',
        section: 'C',
        timeIn: '6:25 AM',
        timeOut: '5:35 PM',
    },
    {
        studentId: '3948572103',
        name: 'Ethan V. Cruz',
        grade: 'Grade 11',
        section: 'A',
        timeIn: '6:45 AM',
        timeOut: '5:55 PM',
    },
    {
        studentId: '5729103847',
        name: 'Ella R. Lopez',
        grade: 'Grade 7',
        section: 'F',
        timeIn: '6:10 AM',
        timeOut: '5:40 PM',
    },
    {
        studentId: '1298374650',
        name: 'Daniel K. Reyes',
        grade: 'Grade 10',
        section: 'B',
        timeIn: '6:30 AM',
        timeOut: '5:25 PM',
    },
    {
        studentId: '8754920138',
        name: 'Angelica M. Santos',
        grade: 'Grade 8',
        section: 'E',
        timeIn: '6:20 AM',
        timeOut: '5:45 PM',
    },
    {
        studentId: '9384751204',
        name: 'Lucas H. Garcia',
        grade: 'Grade 9',
        section: 'A',
        timeIn: '6:50 AM',
        timeOut: '5:30 PM',
    },
    {
        studentId: '4859203746',
        name: 'Mia S. Rivera',
        grade: 'Grade 7',
        section: 'C',
        timeIn: '6:05 AM',
        timeOut: '5:15 PM',
    },
];


  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);

  // Toggle between viewing time-in or time-out students
  const toggleView = (view) => {
    setIsViewingTimeIn(view === 'timeIn');
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg w-full">
      <div className="mb-4 flex justify-center">
        {/* Buttons to toggle between Time-In and Time-Out views */}
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
              <th className="px-4 py-2 text-left">Student ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Grade</th>
              <th className="px-4 py-2 text-left">Section</th>
              <th className="px-4 py-2 text-left">{isViewingTimeIn ? 'Time-In' : 'Time-Out'}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.studentId} className="border-b hover:bg-gray-100">
                <td className="px-4 py-2">{student.studentId}</td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">{student.grade}</td>
                <td className="px-4 py-2">{student.section}</td>
                <td className="px-4 py-2">
                  {isViewingTimeIn ? student.timeIn : student.timeOut}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceStudentCard;
