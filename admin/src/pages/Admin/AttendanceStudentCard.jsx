import { motion } from 'framer-motion'; // Import motion
import { useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaFileExcel, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { useAdminContext } from '../../context/AdminContext';

const AttendanceStudentCard = () => {
    const { fetchAttendanceRecords } = useAdminContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [filteredAttendanceRecords, setFilteredAttendanceRecords] = useState([]);

    useEffect(() => {
        document.title = 'Student Attendance - SCC AMS';
    }, []);

    const formatDate = useCallback((date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    }, []);

    const formatTime = useCallback((date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }, []);

    const capitalize = (str) => {
        if (!str) return '';
        return str
            .split(' ')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    };

    const formatFullName = (user) => {
        if (!user) return 'N/A';
        const lastName = capitalize(user.lastName);
        const firstName = capitalize(user.firstName);
        const middleInitial = user.middleName ? `${capitalize(user.middleName).charAt(0)}.` : '';
        return `${lastName}, ${firstName} ${middleInitial}`;
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const records = await fetchAttendanceRecords(currentDate);
            if (!records || !Array.isArray(records)) {
                console.error("fetchAttendanceRecords did not return an array:", records);
                setAttendanceRecords([]);
                setFilteredAttendanceRecords([]);
                return;
            }

            const studentRecords = records.filter(record => record.userType === 'Student' && record.user);
            setAttendanceRecords(studentRecords);
        } catch (err) {
            console.error('Error fetching attendance records:', err);
            if (err.response && err.response.status === 500) {
                setError("No attendance records found for the selected date.");
            } else {
                setError(err.message || 'Failed to fetch attendance records');
            }
            setAttendanceRecords([]);
            setFilteredAttendanceRecords([]);
        } finally {
            setLoading(false);
        }
    }, [fetchAttendanceRecords, currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowerSearchTerm) {
            setFilteredAttendanceRecords(attendanceRecords);
            return;
        }

        const filtered = attendanceRecords.filter(record => {
            if (!record.user) {
                console.warn(`User data missing for record: ${record._id} during filter`);
                return false;
            }

            const studentNumber = record.user.studentNumber?.toLowerCase() || '';
            const fullName = formatFullName(record.user).toLowerCase();
            const gradeYearLevel = record.user.gradeYearLevel?.toLowerCase() || '';
            const section = record.user.section?.toLowerCase() || '';
            const eventType = (record.eventType === 'sign-in' ? 'sign-in' : 'sign-out').toLowerCase();
            const recordDate = formatDate(record.timestamp).toLowerCase();
            const recordTime = formatTime(record.timestamp).toLowerCase();

            return (
                studentNumber.includes(lowerSearchTerm) ||
                fullName.includes(lowerSearchTerm) ||
                gradeYearLevel.includes(lowerSearchTerm) ||
                section.includes(lowerSearchTerm) ||
                eventType.includes(lowerSearchTerm) ||
                recordDate.includes(lowerSearchTerm) ||
                recordTime.includes(lowerSearchTerm)
            );
        });

        setFilteredAttendanceRecords(filtered);
    }, [attendanceRecords, searchTerm, formatDate, formatTime, formatFullName]);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleDateChange = useCallback((date) => {
        setCurrentDate(date);
        setIsCalendarOpen(false);
    }, []);

    const toggleCalendar = useCallback(() => {
        setIsCalendarOpen(prev => !prev);
    }, []);

    const generateExcel = useCallback(() => {
        if (filteredAttendanceRecords.length === 0) {
            toast.error("No attendance records to export.");
            return;
        }

        const data = filteredAttendanceRecords.map(record => ({
            "Student Number": record.user.studentNumber,
            "Name": formatFullName(record.user),
            "Grade/Year Level": record.user.gradeYearLevel || 'N/A',
            "Section": record.user.section || 'N/A',
            "Event Type": record.eventType === 'sign-in' ? 'Sign-In' : 'Sign-Out',
            "Date": formatDate(record.timestamp),
            "Time": formatTime(record.timestamp),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        const columnWidths = [
            { wch: 15 }, // Student Number
            { wch: 25 }, // Name
            { wch: 20 }, // Grade/Year Level
            { wch: 15 }, // Section
            { wch: 15 }, // Event Type
            { wch: 15 }, // Date
            { wch: 15 }, // Time
        ];
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        const fileName = `Student_Attendance_${currentDate.toLocaleDateString().replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        toast.success("Excel file generated successfully!");
    }, [filteredAttendanceRecords, currentDate, formatDate, formatFullName, formatTime]);

    const mergedRows = useMemo(() => {
        return filteredAttendanceRecords.map((record) => {
            if (!record.user) {
                console.error(`User data missing for record: ${record._id} during render`);
                return null;
            }

            return (
                <tr key={record._id} className="border-b hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{record.user.studentNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatFullName(record.user)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{record.user.gradeYearLevel || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{record.user.section || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{record.eventType === 'sign-in' ? 'Sign-In' : 'Sign-Out'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(record.timestamp)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatTime(record.timestamp)}</td>
                </tr>
            );
        }).filter(row => row !== null);
    }, [filteredAttendanceRecords, formatDate, formatTime, formatFullName]);

    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    const contentVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
    };

    if (loading) {
        return (
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
            >
                <p className="text-xl text-gray-200">Loading student attendance...</p>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
            >
                <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-start min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
        >
            <motion.div 
                variants={contentVariants}
                initial="initial"
                animate="animate"
                className="p-4 sm:p-6 md:p-10 bg-white w-full max-w-7xl rounded-lg shadow-xl"
            >
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            className="border rounded px-4 py-2 w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-customRed"
                            placeholder="Search (Name, ID, Grade, Section...)"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <FaSearch className="absolute top-3 right-3 text-gray-400" />
                    </div>
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md flex items-center transition-colors duration-150"
                        onClick={generateExcel}
                        disabled={filteredAttendanceRecords.length === 0}
                    >
                        <FaFileExcel className="mr-2" /> Export to Excel
                    </button>
                </div>

                {/* Date Navigation */}
                <div className="flex justify-center items-center mb-6 relative">
                    <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-3 shadow transition-colors duration-150"
                        onClick={toggleCalendar}
                        aria-label="Toggle Calendar"
                    >
                        <FaCalendarAlt size={18} />
                    </button>
                    <span className="font-semibold mx-4 text-xl text-gray-700">{currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {isCalendarOpen && (
                        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl p-4 z-20 border border-gray-200">
                            <div className="flex justify-end mb-2">
                                <button
                                    className="text-gray-500 hover:text-red-500 transition-colors duration-150"
                                    onClick={toggleCalendar}
                                    aria-label="Close Calendar"
                                >
                                    <FaTimes size={18} />
                                </button>
                            </div>
                            <DatePicker
                                selected={currentDate}
                                onChange={handleDateChange}
                                inline
                            />
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Student Number</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Grade/Year</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Section</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Event Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mergedRows.length > 0 ? mergedRows : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500">
                                        {searchTerm ? "No records match your search criteria." : "No attendance records found for the selected date."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AttendanceStudentCard;