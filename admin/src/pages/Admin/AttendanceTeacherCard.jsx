import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaFileExcel, FaSearch, FaTimes } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { useAdminContext } from '../../context/AdminContext';

const AttendanceTeacherCard = () => {
    const { fetchAttendanceRecords } = useAdminContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const capitalize = (str) => {
        if (!str) return '';
        return str
            .split(' ')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    };

    const formatFullName = (user) => {
        const lastName = capitalize(user.lastName);
        const firstName = capitalize(user.firstName);
        const middleInitial = user.middleName ? `${capitalize(user.middleName).charAt(0)}.` : '';
        return `${lastName}, ${firstName} ${middleInitial}`;
    };

    const formatDate = useCallback((date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    }, []);

    const formatTime = useCallback((date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleTimeString();
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const records = await fetchAttendanceRecords(currentDate);
            if (!records || !Array.isArray(records)) {
                console.error("fetchAttendanceRecords did not return an array:", records);
            }

            const teacherRecords = records.filter(record => record.userType === 'Teacher');

            setAttendanceRecords(teacherRecords);
        } catch (err) {
            console.error('Error fetching attendance records:', err);
            setError(err.message || 'Failed to fetch attendance records');
            setAttendanceRecords([]);
        } finally {
            setLoading(false);
        }
    }, [fetchAttendanceRecords, currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const filteredAttendanceRecords = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();

        return attendanceRecords.filter(record => {
            if (!record.user) {
                console.warn(`User data missing for record: ${record._id}`);
                return false;
            }

            const fullName = `${record.user.firstName} ${record.user.middleName || ''} ${record.user.lastName}`.toLowerCase();
            return fullName.includes(lowerSearchTerm);
        });
    }, [attendanceRecords, searchTerm]);

    const handleDateChange = useCallback((date) => {
        setCurrentDate(date);
        setIsCalendarOpen(false);
    }, []);

    const toggleCalendar = useCallback(() => {
        setIsCalendarOpen(prev => !prev);
    }, []);

    const generateExcel = useCallback(() => {
        if (filteredAttendanceRecords.length === 0) {
            alert("No attendance records to export.");
            return;
        }

        const data = filteredAttendanceRecords.map(record => ({
            "Name": formatFullName(record.user),
            "Role": "Teacher",
            "Event Type": record.eventType === 'sign-in' ? 'Sign-In' : 'Sign-Out',
            "Date": formatDate(record.timestamp),
            "Time": formatTime(record.timestamp),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        const columnWidths = [
            { wch: 25 }, // Name
            { wch: 10 }, // Role
            { wch: 15 }, // Event Type
            { wch: 15 }, // Date
            { wch: 10 }, // Time
        ];
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        const fileName = `Teacher_Attendance_${currentDate.toLocaleDateString().replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }, [filteredAttendanceRecords, currentDate, formatDate, formatFullName, formatTime]);

    const mergedRows = useMemo(() => {
        const rows = filteredAttendanceRecords.map((record) => {
            if (!record.user) {
                console.warn(`User data missing for record: ${record._id}`);
                return null;
            }

            return (
                <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{formatFullName(record.user)}</td>
                    <td className="px-4 py-2">Teacher</td>
                    <td className="px-4 py-2">{record.eventType === 'sign-in' ? 'Sign-In' : 'Sign-Out'}</td>
                    <td className="px-4 py-2">{formatDate(record.timestamp)}</td>
                    <td className="px-4 py-2">{formatTime(record.timestamp)}</td>
                </tr>
            );
        }).filter(row => row !== null);

        return rows;
    }, [filteredAttendanceRecords, formatDate, formatTime]);

    if (loading) {
        return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-10 bg-white w-full">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-auto">
                    <input
                        type="text"
                        className="border rounded px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by Name"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <FaSearch className="absolute top-3 right-3 text-gray-400" />
                </div>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                    onClick={generateExcel}
                >
                    <FaFileExcel className="mr-2" /> Export to Excel
                </button>
            </div>

            {/* Date Navigation */}
            <div className="flex justify-center items-center mb-4 relative">
                <button
                    className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                    onClick={toggleCalendar}
                >
                    <FaCalendarAlt />
                </button>
                <span className="font-semibold mx-4">{currentDate.toLocaleDateString()}</span>
                {isCalendarOpen && (
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-10">
                        <div className="flex justify-end">
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={toggleCalendar}
                            >
                                <FaTimes />
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

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse mt-5">
                    <thead>
                        <tr className="border-b bg-gray-100">
                            <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">Name</th>
                            <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">Role</th>
                            <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">Event Type</th>
                            <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">Date</th>
                            <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mergedRows}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceTeacherCard;