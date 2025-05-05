import axios from 'axios'; // Import axios
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FaBell, FaFileExcel } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { StudentContext } from '../../context/StudentContext'; // Import StudentContext

const StudentAttendance = () => {
    const { sToken, backendUrl } = useContext(StudentContext); // Get token and backend URL from context

    const [studentInfo, setStudentInfo] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [semesterDates, setSemesterDates] = useState({ start: null, end: null });
    const [loading, setLoading] = useState(true); // Start with loading true
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalAbsences, setTotalAbsences] = useState(0); // Initialize absences to 0
    const [exporting, setExporting] = useState(false);

    // Function to calculate absences
    const calculateAbsences = useCallback((records, startDateStr, endDateStr) => {
        if (!startDateStr || !endDateStr) return 0;

        const startDate = new Date(startDateStr);
        startDate.setHours(0, 0, 0, 0); // Normalize start date
        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999); // Normalize end date

        const presentDates = new Set();
        records.forEach(record => {
            if (record.signInTime) { // Consider present if signed in
                const recordDate = new Date(record.signInTime);
                const localYear = recordDate.getFullYear();
                const localMonth = String(recordDate.getMonth() + 1).padStart(2, '0');
                const localDay = String(recordDate.getDate()).padStart(2, '0');
                presentDates.add(`${localYear}-${localMonth}-${localDay}`);
            }
        });

        let absences = 0;
        let currentDate = new Date(startDate);
        const today = new Date(); // Don't count absences for future dates
        today.setHours(23, 59, 59, 999);

        while (currentDate <= endDate && currentDate <= today) {
            const dayOfWeek = currentDate.getDay(); // Sunday = 0, Saturday = 6

            if (dayOfWeek !== 0) { // Exclude Sundays
                const localYear = currentDate.getFullYear();
                const localMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
                const localDay = String(currentDate.getDate()).padStart(2, '0');
                const dateStr = `${localYear}-${localMonth}-${localDay}`;

                if (!presentDates.has(dateStr)) {
                    absences++;
                }
            }
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }
        return absences;
    }, []);

    // Fetch student data and attendance
    useEffect(() => {
        const fetchStudentData = async () => {
            if (!sToken || !backendUrl) {
                setError("Authentication token or backend URL not found.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Assume an endpoint that returns student info, attendance for current semester, and semester dates
                const response = await axios.get(`${backendUrl}/api/student/attendance-profile`, {
                    headers: { Authorization: `Bearer ${sToken}` },
                });

                if (response.data && response.data.success) {
                    setStudentInfo(response.data.student);
                    setAttendanceRecords(response.data.attendance || []);
                    setSemesterDates(response.data.semesterDates || { start: null, end: null });
                } else {
                    throw new Error(response.data.message || "Failed to fetch student data.");
                }
            } catch (err) {
                console.error("Error fetching student data:", err);
                setError(err.response?.data?.message || err.message || "An error occurred while fetching data.");
                toast.error(err.response?.data?.message || err.message || "Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [sToken, backendUrl]);

    // Calculate absences when data is available
    useEffect(() => {
        if (attendanceRecords.length > 0 || (semesterDates.start && semesterDates.end)) {
            const absencesCount = calculateAbsences(attendanceRecords, semesterDates.start, semesterDates.end);
            setTotalAbsences(absencesCount);
        }
    }, [attendanceRecords, semesterDates, calculateAbsences]);


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            // Check if date is valid before formatting
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return 'Invalid Date';
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            // Check if date is valid before formatting
            if (isNaN(date.getTime())) {
                return 'Invalid Time';
            }
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {
            console.error("Error formatting time:", dateString, e);
            return 'Invalid Time';
        }
    };

    const generateExcel = () => {
        if (!studentInfo) {
            toast.warn("Student information not available for export.");
            return;
        }
        setExporting(true);
        try {
            const wb = XLSX.utils.book_new();

            const userInfo = [
                ['Name:', `${studentInfo.firstName} ${studentInfo.middleName ? studentInfo.middleName.charAt(0) + '.' : ''} ${studentInfo.lastName}`],
                ['Education Level:', studentInfo.educationLevel],
                ['Grade Year Level:', studentInfo.gradeYearLevel],
                ['Section:', studentInfo.section],
                ['Semester Start:', formatDate(semesterDates.start)],
                ['Semester End:', formatDate(semesterDates.end)],
                ['Total Absences (excluding Sundays):', totalAbsences],
                [], // Empty row for spacing
            ];

            const wsData = [
                ...userInfo,
                ['Date', 'Sign In Time', 'Sign Out Time'],
                ...attendanceRecords.map(record => [
                    formatDate(record.signInTime || record.date), // Use signInTime if available, fallback to record date
                    record.signInTime ? formatTime(record.signInTime) : 'N/A',
                    record.signOutTime ? formatTime(record.signOutTime) : 'N/A'
                ])
            ];

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Optional: Adjust column widths (example)
            ws['!cols'] = [
                { wch: 20 }, // Date
                { wch: 15 }, // Sign In
                { wch: 15 }  // Sign Out
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');
            XLSX.writeFile(wb, `${studentInfo.lastName}_${studentInfo.firstName}_Attendance.xlsx`);
            toast.success("Attendance exported successfully!");
        } catch (err) {
            console.error("Error generating Excel:", err);
            toast.error("Failed to generate Excel file.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return <div className="container mx-auto px-4 py-10 md:pt-36 text-center text-xl">Loading attendance data...</div>;
    }

    if (error) {
        return <div className="container mx-auto px-4 py-10 md:pt-36 text-center text-red-600 text-xl">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-10 md:pt-36 bg-gray-50 min-h-screen relative">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                📋 Attendance Records
            </h1>

            {/* Warning Message */}
            {totalAbsences >= 4 && (
                <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 max-w-3xl mx-auto rounded-lg shadow">
                    <p>
                        Warning: You have accumulated <strong>{totalAbsences}</strong> absences this semester. Please ensure regular attendance.
                    </p>
                </div>
            )}

            {/* Notification Button */}
            <div className="absolute top-4 right-4">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Show absence notification"
                >
                    <FaBell className="text-xl" />
                    <span>{totalAbsences}</span> {/* Show count on button */}
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Total Absences</h2>
                        <p className="text-gray-700 text-lg mb-2">
                            Semester Start: {formatDate(semesterDates.start)}
                        </p>
                         <p className="text-gray-700 text-lg mb-4">
                            Semester End: {formatDate(semesterDates.end)}
                        </p>
                        <p className="text-gray-700 text-lg">
                            You have a total of <strong>{totalAbsences}</strong> absences recorded during this period (excluding Sundays).
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
            {studentInfo && (
                <div className="mb-10 p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto space-y-2">
                    <div className="text-lg text-gray-700">
                        <strong>Name:</strong> {studentInfo.firstName} {studentInfo.middleName ? studentInfo.middleName.charAt(0) + '.' : ''} {studentInfo.lastName}
                    </div>
                    <div className="text-lg text-gray-700">
                        <strong>Education Level:</strong> {studentInfo.educationLevel}
                    </div>
                    <div className="text-lg text-gray-700">
                        <strong>Grade Year Level:</strong> {studentInfo.gradeYearLevel}
                    </div>
                    <div className="text-lg text-gray-700">
                        <strong>Section:</strong> {studentInfo.section}
                    </div>
                     <div className="text-lg text-gray-700 pt-2">
                        <strong>Current Semester:</strong> {formatDate(semesterDates.start)} - {formatDate(semesterDates.end)}
                    </div>
                </div>
            )}

            {/* Export Button */}
            <div className="flex justify-end max-w-5xl mx-auto mb-6">
                <button
                    className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center gap-2 ${exporting || !studentInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={generateExcel}
                    disabled={exporting || !studentInfo}
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
                        {attendanceRecords.length > 0 ? (
                            attendanceRecords.map((record, index) => (
                                <tr
                                    key={record._id || index} // Use record._id if available from backend
                                    className="border-b border-gray-200 hover:bg-gray-50 transition duration-150"
                                >
                                    {/* Display date based on signInTime if available */}
                                    <td className="px-6 py-4">{formatDate(record.signInTime || record.date)}</td>
                                    <td className="px-6 py-4">{formatTime(record.signInTime)}</td>
                                    <td className="px-6 py-4">{formatTime(record.signOutTime)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center px-6 py-10 text-gray-500">
                                    No attendance records found for this semester.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentAttendance;