import React, { useEffect, useState } from 'react';
import { FaBell, FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const StudentAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false); // No need to fetch data, so loading is false
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [totalAbsences, setTotalAbsences] = useState(4); // Mock absences set to 4
    const [exporting, setExporting] = useState(false);

    // Mock data for attendance and semester dates
    const mockResponse = {
        success: true,
        attendance: [
            {
                user: {
                    _id: "67ee1ff0f034a7a8631c592d",
                    firstName: "Dave Gabriel",
                    middleName: "Viral",
                    lastName: "Galang",
                    educationLevel: "Primary",
                    gradeYearLevel: "Grade 5",
                    section: "1"
                },
                date: "2025-04-03T05:43:14.680Z",
                signInTime: "2025-04-03T05:43:14.680Z",
                signOutTime: null
            }
        ],
        semesterDates: {
            start: "2025-01-05T00:00:00.000Z",
            end: "2025-05-15T23:59:59.999Z"
        }
    };

    // Set attendance records from mock data using useEffect
    useEffect(() => {
        setAttendanceRecords(mockResponse.attendance);
    }, []); // Empty dependency array ensures this runs only once

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const generateExcel = () => {
        setExporting(true);
        const wb = XLSX.utils.book_new();

        const userInfo = attendanceRecords.length > 0 ? [
            ['Name:', `${attendanceRecords[0]?.user.firstName} ${attendanceRecords[0]?.user.middleName ? attendanceRecords[0]?.user.middleName.charAt(0) + '.' : ''} ${attendanceRecords[0]?.user.lastName}`],
            ['Education Level:', attendanceRecords[0]?.user.educationLevel],
            ['Grade Year Level:', attendanceRecords[0]?.user.gradeYearLevel],
            ['Section:', attendanceRecords[0]?.user.section],
            [], // Add a blank row for spacing
        ] : [['No attendance records available']];

        const wsData = [
            ...userInfo,
            ['Date', 'Sign In Time', 'Sign Out Time'],
            ...attendanceRecords.map(record => [
                formatDate(record.date),
                record.signInTime ? formatTime(record.signInTime) : 'N/A',
                record.signOutTime ? formatTime(record.signOutTime) : 'N/A'
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');
        XLSX.writeFile(wb, 'Student Attendance Records.xlsx');
        setExporting(false);
    };

    return (
        <div className="container mx-auto px-4 py-10 md:pt-36 bg-gray-50 min-h-screen relative">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                📋 Attendance Records
            </h1>

            {/* Warning Message */}
            {totalAbsences >= 4 && (
                <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 max-w-3xl mx-auto rounded-lg">
                    <p>
                        Warning: The student has accumulated <strong>{totalAbsences}</strong> absences. If this continues, the student will be reprimanded.
                    </p>
                </div>
            )}

            {/* Notification Button */}
            <div className="absolute top-4 right-4">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaBell className="text-xl" />
                    Notifications
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Total Absences</h2>
                        <p className="text-gray-700 text-lg">
                            You have a total of <strong>{totalAbsences}</strong> absences since the semester started.
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center gap-2 ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={generateExcel}
                    disabled={exporting}
                >
                    <FaFileExcel className="text-xl" />
                    {exporting ? 'Exporting...' : 'Export to Excel'}
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