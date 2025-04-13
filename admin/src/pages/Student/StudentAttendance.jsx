import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { FaFileExcel } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { StudentContext } from '../../context/StudentContext';

const StudentAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const { sToken, backendUrl } = useContext(StudentContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${backendUrl}/api/student/attendance`, {
                    headers: {
                        Authorization: `Bearer ${sToken}`,
                    },
                });
                if (response.data.success) {
                    // Merge records
                    const mergedRecords = [];
                    const recordMap = {};

                    response.data.attendance.forEach(record => {
                        const key = `${record.user._id}-${new Date(record.date).toDateString()}`;

                        if (!recordMap[key]) {
                            recordMap[key] = { ...record };
                        } else {
                            if (record.signInTime) {
                                recordMap[key].signInTime = record.signInTime;
                            }
                            if (record.signOutTime) {
                                recordMap[key].signOutTime = record.signOutTime;
                            }
                        }
                    });

                    for (const key in recordMap) {
                        mergedRecords.push(recordMap[key]);
                    }

                    setAttendanceRecords(mergedRecords);
                    console.log('attendanceRecords:', mergedRecords); // Add this line
                } else {
                    toast.error(response.data.message);
                    setError(response.data.message);
                }
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceRecords();
    }, [sToken, backendUrl]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const generateExcel = () => {
        const wb = XLSX.utils.book_new();

        // User Information for the Excel Sheet
        const userInfo = [
            ['Name:', `${attendanceRecords[0]?.user.firstName} ${attendanceRecords[0]?.user.middleName ? attendanceRecords[0]?.user.middleName.charAt(0) + '.' : ''} ${attendanceRecords[0]?.user.lastName}`],
            ['Education Level:', attendanceRecords[0]?.user.educationLevel],
            ['Grade Year Level:', attendanceRecords[0]?.user.gradeYearLevel],
            ['Section:', attendanceRecords[0]?.user.section],
            [], // Add a blank row for spacing
        ];

        const wsData = [
            ...userInfo, // Add user info at the top
            ['Date', 'Sign In Time', 'Sign Out Time'], // Table Headers
            ...attendanceRecords.map(record => [
                formatDate(record.date),
                record.signInTime ? formatTime(record.signInTime) : 'N/A',
                record.signOutTime ? formatTime(record.signOutTime) : 'N/A'
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');
        XLSX.writeFile(wb, 'Student Attendance Records.xlsx');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg font-semibold text-gray-700">Loading attendance records...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 pt-36">
                <div className="text-red-500 text-center">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 md:pt-36 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                📋 Attendance Records
            </h1>

            {/* User Information Card */}
            <div className="mb-10 p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto space-y-2">
                <div className="text-lg text-gray-700">
                    <strong>Name:</strong> {attendanceRecords[0]?.user.firstName} {attendanceRecords[0]?.user.middleName ? attendanceRecords[0]?.user.middleName.charAt(0) + '.' : ''} {attendanceRecords[0]?.user.lastName}
                </div>
                <div className="text-lg text-gray-700">
                    <strong>Education Level:</strong> {attendanceRecords[0]?.user.educationLevel}
                </div>
                <div className="text-lg text-gray-700">
                    <strong>Grade Year Level:</strong> {attendanceRecords[0]?.user.gradeYearLevel}
                </div>
                <div className="text-lg text-gray-700">
                    <strong>Section:</strong> {attendanceRecords[0]?.user.section}
                </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end max-w-3xl mx-auto mb-6">
                <button
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center gap-2"
                    onClick={generateExcel}
                >
                    <FaFileExcel className="text-xl" />
                    Export to Excel
                </button>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto max-w-5xl mx-auto rounded-lg shadow-lg bg-white">
                <table className="min-w-full table-auto text-base text-left text-gray-700">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 font-semibold uppercase">Date</th>
                            <th className="px-6 py-4 font-semibold uppercase">Sign In Time</th>
                            <th className="px-6 py-4 font-semibold uppercase">Sign Out Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceRecords.map((record, index) => (
                            <tr
                                key={record._id || index}
                                className="border-b border-gray-200 hover:bg-gray-50 transition duration-150"
                            >
                                <td className="px-6 py-4">{formatDate(record.date)}</td>
                                <td className="px-6 py-4">{record.signInTime ? formatTime(record.signInTime) : 'N/A'}</td>
                                <td className="px-6 py-4">{record.signOutTime ? formatTime(record.signOutTime) : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentAttendance;