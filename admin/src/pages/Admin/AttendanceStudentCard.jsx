import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AttendanceStudentCard = () => {
  // Mock data: Simulating student records with IDs, names, grades, sections, and times
  const mockStudents = [
    { studentId: '1', name: 'Cat', grade: '10', section: 'A', timeIn: '08:00 AM', timeOut: '04:00 PM' },
    { studentId: '2', name: 'Dog', grade: '6', section: 'C', timeIn: '08:15 AM', timeOut: '04:15 PM' },
  ];

  // States for storing timed-in and timed-out students
  const [timedInStudents, setTimedInStudents] = useState([]);
  const [timedOutStudents, setTimedOutStudents] = useState([]);
  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);

  // Use mock data directly, simulate fetching timed-in or timed-out students
  const simulateTimeData = () => {
    // Simulate a scenario where all students are either timed in or out
    const timedIn = mockStudents.map(student => ({
      studentId: student.studentId,
      name: student.name,
      grade: student.grade,
      section: student.section,
      timeIn: student.timeIn,
    }));

    const timedOut = mockStudents.map(student => ({
      studentId: student.studentId,
      name: student.name,
      grade: student.grade,
      section: student.section,
      timeOut: student.timeOut,
    }));

    // Update state with mock data
    setTimedInStudents(timedIn);
    setTimedOutStudents(timedOut);
  };

  // Toggle between viewing time-in or time-out students
  const toggleView = (view) => {
    setIsViewingTimeIn(view === 'timeIn');
  };

  // Trigger the simulation of data (like fetching data)
  useEffect(() => {
    simulateTimeData();
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-lg w-full">
      <div className="mb-4 flex justify-center">
        {/* Buttons to toggle between Time-In and Time-Out views */}
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
              <th className="px-4 py-2 text-left">Student ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Grade</th>
              <th className="px-4 py-2 text-left">Section</th>
              <th className="px-4 py-2 text-left">{isViewingTimeIn ? 'Time-In' : 'Time-Out'}</th>
            </tr>
          </thead>
          <tbody>
            {isViewingTimeIn
              ? timedInStudents.map((student) => (
                  <tr key={student.studentId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{student.studentId}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.grade}</td>
                    <td className="px-4 py-2">{student.section}</td>
                    <td className="px-4 py-2">{student.timeIn}</td>
                  </tr>
                ))
              : timedOutStudents.map((student) => (
                  <tr key={student.studentId} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{student.studentId}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.grade}</td>
                    <td className="px-4 py-2">{student.section}</td>
                    <td className="px-4 py-2">{student.timeOut}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceStudentCard;
