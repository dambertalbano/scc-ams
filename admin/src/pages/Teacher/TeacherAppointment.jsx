import React, { useContext, useEffect, useState } from 'react';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherAppointments = () => {
  const { dToken, getAppointments } = useContext(TeacherContext);

  // Mock data: Simulating students enrolled in the teacher's subject
  const mockStudents = [
    { studentId: '1', name: 'Alice Johnson', grade: '10', section: 'A', timeIn: '08:00 AM', timeOut: '04:00 PM' },
    { studentId: '2', name: 'Bob Smith', grade: '6', section: 'C', timeIn: '08:15 AM', timeOut: '04:15 PM' },
    { studentId: '3', name: 'Charlie Brown', grade: '10', section: 'A', timeIn: '08:10 AM', timeOut: '04:10 PM' },
    { studentId: '4', name: 'David Wilson', grade: '6', section: 'C', timeIn: '08:20 AM', timeOut: '04:20 PM' },
  ];

  const [students, setStudents] = useState(mockStudents);
  const [filteredStudents, setFilteredStudents] = useState(mockStudents);
  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  // Simulate fetching data for students
  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
    setFilteredStudents(mockStudents);
  }, [dToken]);

  const toggleView = (view) => {
    setIsViewingTimeIn(view === 'timeIn');
  };

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterStudents(query, gradeFilter, sectionFilter);
  };

  // Handle grade filter
  const handleGradeFilter = (e) => {
    const grade = e.target.value;
    setGradeFilter(grade);
    filterStudents(searchQuery, grade, sectionFilter);
  };

  // Handle section filter
  const handleSectionFilter = (e) => {
    const section = e.target.value;
    setSectionFilter(section);
    filterStudents(searchQuery, gradeFilter, section);
  };

  // Filter students based on search and filters
  const filterStudents = (search, grade, section) => {
    const filtered = students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(search);
      const matchesGrade = grade ? student.grade === grade : true;
      const matchesSection = section ? student.section === section : true;
      return matchesSearch && matchesGrade && matchesSection;
    });
    setFilteredStudents(filtered);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg w-full">
      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-wrap justify-end items-center gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          className="border rounded px-4 py-2"
          value={searchQuery}
          onChange={handleSearch}
        />
        <select
          className="border rounded px-4 py-2"
          value={gradeFilter}
          onChange={handleGradeFilter}
        >
          <option value="">Filter by Grade</option>
          <option value="10">Grade 10</option>
          <option value="6">Grade 6</option>
        </select>
        <select
          className="border rounded px-4 py-2"
          value={sectionFilter}
          onChange={handleSectionFilter}
        >
          <option value="">Filter by Section</option>
          <option value="A">Section A</option>
          <option value="C">Section C</option>
        </select>
      </div>

      {/* Toggle Buttons for Time-In and Time-Out */}
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

      {/* Student Table */}
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
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.studentId} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{student.studentId}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.grade}</td>
                  <td className="px-4 py-2">{student.section}</td>
                  <td className="px-4 py-2">
                    {isViewingTimeIn ? student.timeIn : student.timeOut}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-4">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherAppointments;
