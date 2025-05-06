import axios from 'axios';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FaBell, FaFileExcel } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { StudentContext } from '../../context/StudentContext';

const StudentAttendance = () => {
    const { sToken, backendUrl } = useContext(StudentContext);

    const [studentInfo, setStudentInfo] = useState(null);
    // attendanceRecords will store the raw data from backend (timestamp, eventType)
    const [rawAttendanceRecords, setRawAttendanceRecords] = useState([]);
    // processedAttendance will store data formatted for the table (date, signInTime, signOutTime)
    const [processedAttendance, setProcessedAttendance] = useState([]);
    const [semesterDates, setSemesterDates] = useState({ start: null, end: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalAbsences, setTotalAbsences] = useState(0);
    const [exporting, setExporting] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) { return 'Invalid Date'; }
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Time';
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) { return 'Invalid Time'; }
    };

    // Function to calculate absences based on raw records
    const calculateAbsences = useCallback((records, startDateStr, endDateStr) => {
        if (!startDateStr || !endDateStr) return 0;

        const startDate = new Date(startDateStr);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);

        const presentDates = new Set();
        // Use raw records which have eventType and timestamp
        records.forEach(record => {
            if (record.eventType === "sign-in" && record.timestamp) { // Check for sign-in events
                const recordDate = new Date(record.timestamp);
                const localYear = recordDate.getFullYear();
                const localMonth = String(recordDate.getMonth() + 1).padStart(2, '0');
                const localDay = String(recordDate.getDate()).padStart(2, '0');
                presentDates.add(`${localYear}-${localMonth}-${localDay}`);
            }
        });

        let absences = 0;
        let currentDate = new Date(startDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        while (currentDate <= endDate && currentDate <= today) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0) { // Exclude Sundays
                const localYear = currentDate.getFullYear();
                const localMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
                const localDay = String(currentDate.getDate()).padStart(2, '0');
                const dateStr = `${localYear}-${localMonth}-${localDay}`;
                if (!presentDates.has(dateStr)) {
                    absences++;
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return absences;
    }, []);

    // Process raw attendance records to pair sign-ins and sign-outs
    const processAttendanceForTable = useCallback((records) => {
        const dailyRecords = {};

        records.forEach(record => {
            if (!record.timestamp) return;
            const recordDate = new Date(record.timestamp);
            const dateKey = recordDate.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!dailyRecords[dateKey]) {
                dailyRecords[dateKey] = { date: record.timestamp, signInTime: null, signOutTime: null };
            }

            if (record.eventType === "sign-in") {
                // Prefer earlier sign-in if multiple exist for a day (though ideally shouldn't happen)
                if (!dailyRecords[dateKey].signInTime || new Date(record.timestamp) < new Date(dailyRecords[dateKey].signInTime)) {
                    dailyRecords[dateKey].signInTime = record.timestamp;
                }
            } else if (record.eventType === "sign-out") {
                // Prefer later sign-out
                if (!dailyRecords[dateKey].signOutTime || new Date(record.timestamp) > new Date(dailyRecords[dateKey].signOutTime)) {
                    dailyRecords[dateKey].signOutTime = record.timestamp;
                }
            }
        });
        // Convert to array and sort by date
        return Object.values(dailyRecords).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, []);


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
                const response = await axios.get(`${backendUrl}/api/student/attendance-profile`, {
                    headers: { Authorization: `Bearer ${sToken}` },
                });

                if (response.data && response.data.success) {
                    setStudentInfo(response.data.student);
                    // Store raw records
                    setRawAttendanceRecords(response.data.attendance || []);
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

    // Calculate absences and process records for table when data is available
    useEffect(() => {
        if (rawAttendanceRecords.length > 0 || (semesterDates.start && semesterDates.end)) {
            const absencesCount = calculateAbsences(rawAttendanceRecords, semesterDates.start, semesterDates.end);
            setTotalAbsences(absencesCount);
            const processed = processAttendanceForTable(rawAttendanceRecords);
            setProcessedAttendance(processed);
        } else if (!loading && semesterDates.start && semesterDates.end) { // Handle case with semester dates but no records
            setTotalAbsences(calculateAbsences([], semesterDates.start, semesterDates.end));
            setProcessedAttendance([]);
        }
    }, [rawAttendanceRecords, semesterDates, calculateAbsences, processAttendanceForTable, loading]);


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
                [],
            ];

            const wsData = [
                ...userInfo,
                ['Date', 'Sign In Time', 'Sign Out Time'],
                // Use processedAttendance for Excel export
                ...processedAttendance.map(record => [
                    formatDate(record.date), // This is the date of the record (could be signInTime)
                    formatTime(record.signInTime),
                    formatTime(record.signOutTime)
                ])
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
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

    // ... (rest of the component: loading, error, JSX for modal, info card, export button) ...

    // --- MODIFIED TABLE RENDERING ---
    return (
        <div className="container mx-auto px-4 py-10 md:pt-36 bg-gray-50 min-h-screen relative">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                📋 Attendance Records
            </h1>

            {totalAbsences >= 4 && (
                <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 max-w-3xl mx-auto rounded-lg shadow">
                    <p>
                        Warning: You have accumulated <strong>{totalAbsences}</strong> absences this semester (excluding Sundays). Please ensure regular attendance.
                    </p>
                </div>
            )}

            <div className="absolute top-4 right-4">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Show absence notification"
                >
                    <FaBell className="text-xl" />
                    <span>{totalAbsences}</span>
                </button>
            </div>

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
                        {/* Use processedAttendance for table rendering */}
                        {processedAttendance.length > 0 ? (
                            processedAttendance.map((record, index) => (
                                <tr
                                    key={record.date + '-' + index} // Use a more unique key
                                    className="border-b border-gray-200 hover:bg-gray-50 transition duration-150"
                                >
                                    <td className="px-6 py-4">{formatDate(record.date)}</td>
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