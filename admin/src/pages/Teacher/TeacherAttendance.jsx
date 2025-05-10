import ExcelJS from 'exceljs';
import { motion } from "framer-motion"; // Import motion
import React, { useCallback, useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaFileExcel, FaSearch, FaTimes } from 'react-icons/fa';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherAttendance = () => {
    const { dToken, backendUrl, fetchStudentsBySchedule } = useContext(TeacherContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [templateFile, setTemplateFile] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [currentScheduleDetails, setCurrentScheduleDetails] = useState(null);

    const fetchTeacherInfo = useCallback(async () => {
        // setLoading(true); // Keep loading true until all initial data is potentially fetched
        setError(null);
        try {
            const response = await fetch(`${backendUrl}/api/teacher/profile`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setTeacherInfo(data.profileData);
                setSchedules(data.profileData.schedules || []);
                // If no schedule is selected yet, and there are schedules, select the first one by default
                // Or, if you want to wait for user selection, remove this block
                if (!selectedSchedule && data.profileData.schedules && data.profileData.schedules.length > 0) {
                    // setSelectedSchedule(data.profileData.schedules[0]); // Optionally auto-select first schedule
                }
            } else {
                setError(data.message || 'Failed to fetch teacher profile.');
            }
        } catch (err) {
            console.error('Error fetching teacher profile:', err);
            setError(err.message || 'Failed to fetch teacher profile.');
        } finally {
            // setLoading(false); // Moved loading(false) to the end of student fetching
        }
    }, [dToken, backendUrl, selectedSchedule]);

    useEffect(() => {
        fetchTeacherInfo();
    }, [fetchTeacherInfo]); // Removed empty dependency array to allow re-fetch if context changes, though dToken/backendUrl are stable

    useEffect(() => {
        if (!selectedSchedule) {
            setStudents([]);
            setFilteredStudents([]);
            setCurrentScheduleDetails(null);
            setLoading(false); // Set loading to false if no schedule is selected
            return;
        }

        const formatLocalDate = (date) => {
            if (!date) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const loadStudents = async () => {
            setLoading(true);
            const formattedDate = formatLocalDate(currentDate);
            const data = await fetchStudentsBySchedule(selectedSchedule._id, formattedDate);

            if (data && data.success) {
                setStudents(data.students || []);
                setCurrentScheduleDetails(data.scheduleDetails || null);
                setError(null);
            } else {
                setError(data?.message || "Failed to fetch student data.");
                setStudents([]);
                setCurrentScheduleDetails(null);
            }
            setLoading(false);
        };

        loadStudents();
    }, [selectedSchedule, currentDate, fetchStudentsBySchedule]);

    useEffect(() => {
        const presentStudents = students.filter(student => student.signInTime || student.signOutTime);
        let filtered = presentStudents;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = presentStudents.filter(student =>
                (student.firstName?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (student.lastName?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (student.studentNumber?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (student.educationLevel?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (student.gradeYearLevel?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (student.section?.toLowerCase() || '').includes(lowerCaseSearchTerm)
            );
        }
        setFilteredStudents(filtered);
    }, [students, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDateChange = useCallback((date) => {
        setCurrentDate(date);
        setIsCalendarOpen(false);
    }, []); // Removed setCurrentDate from deps as it's stable

    const toggleCalendar = useCallback(() => {
        setIsCalendarOpen(prev => !prev);
    }, []); // Removed setIsCalendarOpen from deps

    const formatTime = useCallback((dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const getScheduleDayNumbers = (dayString) => {
        if (!dayString || typeof dayString !== 'string') return [];
        const dayMap = {
            'SUN': 0, 'SUNDAY': 0, 'M': 1, 'MON': 1, 'MONDAY': 1,
            'T': 2, 'TUE': 2, 'TUES': 2, 'TUESDAY': 2, 'W': 3, 'WED': 3, 'WEDNESDAY': 3,
            'TH': 4, 'THUR': 4, 'THURSDAY': 4, 'F': 5, 'FRI': 5, 'FRIDAY': 5,
            'SAT': 6, 'SATURDAY': 6,
        };
        const dayTokens = dayString.toUpperCase().split(/[\s,]+/).map(token => token.trim()).filter(Boolean);
        const dayNumbers = dayTokens.reduce((acc, token) => {
            if (dayMap.hasOwnProperty(token) && !acc.includes(dayMap[token])) {
                acc.push(dayMap[token]);
            }
            return acc;
        }, []);
        return dayNumbers.sort((a, b) => a - b);
    };

    const filterDateByScheduleDay = (date) => {
        const currentDayJs = date.getDay();
        if (!selectedSchedule) return true;
        let dayOfWeekString = selectedSchedule.dayOfWeek;
        if (Array.isArray(selectedSchedule.dayOfWeek)) {
            dayOfWeekString = selectedSchedule.dayOfWeek.join(',');
        }
        if (typeof dayOfWeekString !== 'string' || dayOfWeekString.trim() === "") return true;
        const scheduleDayNumbers = getScheduleDayNumbers(dayOfWeekString);
        if (scheduleDayNumbers.length === 0) return true;
        return scheduleDayNumbers.includes(currentDayJs);
    };

    const getSignInTime = (student) => student.signInTime ? formatTime(student.signInTime) : "N/A";
    const getSignOutTime = (student) => student.signOutTime ? formatTime(student.signOutTime) : "N/A";

    const generateExcel = async () => {
        if (!templateFile) {
            alert("Please upload the SF2 Excel template first.");
            return;
        }
        if (!selectedSchedule || !currentScheduleDetails) {
            alert("Please select a schedule before generating the report.");
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(e.target.result);
            const worksheet = workbook.getWorksheet(1);
            const month = currentDate.toLocaleString('default', { month: 'long' });
            const { gradeYearLevel, section, subjectId } = currentScheduleDetails;
            const subjectName = subjectId?.name || 'N/A';
            const formatTeacherName = (teacher) => {
                if (!teacher) return "N/A";
                const lastName = teacher.lastName?.charAt(0).toUpperCase() + teacher.lastName?.slice(1).toLowerCase() || "";
                const firstName = teacher.firstName?.charAt(0).toUpperCase() + teacher.firstName?.slice(1).toLowerCase() || "";
                const middleInitial = teacher.middleName ? `${teacher.middleName.charAt(0).toUpperCase()}.` : "";
                return `${lastName}, ${firstName} ${middleInitial}`;
            };
            const teacherName = teacherInfo ? formatTeacherName(teacherInfo) : "N/A";
            worksheet.getCell("AE86").value = teacherName;
            worksheet.getCell("AA6").value = month;
            worksheet.getCell("W8").value = gradeYearLevel;
            worksheet.getCell("AD8").value = section;
            const dateToColumnMap = {};
            worksheet.getRow(11).eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber >= 4 && colNumber <= 29) {
                    let raw = cell.value;
                    if (typeof raw === "object" && raw !== null) {
                        raw = raw.richText ? raw.richText.map(rt => rt.text).join("") : (raw.result || null);
                    }
                    const parsed = raw !== null ? parseInt(String(raw).trim(), 10) : NaN;
                    if (!isNaN(parsed)) {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), parsed);
                        dateToColumnMap[date.toISOString().split("T")[0]] = colNumber;
                    }
                }
            });
            const selectedDateISO = currentDate.toISOString().split("T")[0];
            const selectedColumn = dateToColumnMap[selectedDateISO];
            if (!selectedColumn) {
                alert("Selected date is not found in the SF2 template's header.");
                return;
            }
            const sortedStudents = [...students].sort((a, b) => (a.lastName || "").toLowerCase().localeCompare((b.lastName || "").toLowerCase()));
            let totalPresent = 0;
            sortedStudents.forEach((student, index) => {
                const row = worksheet.getRow(14 + index);
                row.getCell(2).value = `${student.lastName}, ${student.firstName} ${student.middleName || ""}`;
                const signInDate = student.signInTime ? new Date(student.signInTime).toISOString().split("T")[0] : null;
                const signOutDate = student.signOutTime ? new Date(student.signOutTime).toISOString().split("T")[0] : null;
                if (selectedDateISO === signInDate || selectedDateISO === signOutDate) {
                    row.getCell(selectedColumn).value = "P";
                    totalPresent++;
                } else {
                    row.getCell(selectedColumn).value = "A";
                }
                row.commit();
            });
            worksheet.getCell(62, selectedColumn).value = totalPresent;
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `SF2_${gradeYearLevel}_${section}_${subjectName.replace(/\s+/g, '_')}_${month}_${currentDate.getFullYear()}.xlsx`;
            link.click();
            URL.revokeObjectURL(link.href); // Clean up
        };
        reader.readAsArrayBuffer(templateFile);
    };

    if (loading && !teacherInfo) { // Initial loading for teacher profile
        return (
            <motion.div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-6 text-gray-300">
                <div className="loader text-xl">Loading Teacher Profile...</div> {/* Kiosk style loader text */}
            </motion.div>
        );
    }
    
    // Error fetching teacher profile
    if (error && !teacherInfo) {
        return (
            <motion.div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-6 text-red-400">
                Error: {error}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 sm:p-6 md:p-10 text-gray-300"
        >
            <div className="w-full max-w-7xl"> {/* Container for content */}
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Student Attendance</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Select Schedule:
                        </label>
                        <select
                            className="border border-slate-600 bg-slate-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-300"
                            value={selectedSchedule?._id || ""}
                            onChange={(e) => {
                                const scheduleId = e.target.value;
                                const schedule = schedules.find((s) => s._id === scheduleId);
                                setSelectedSchedule(schedule);
                                if (schedule && schedule.dayOfWeek) {
                                    const scheduleDayNumbers = getScheduleDayNumbers(schedule.dayOfWeek);
                                    if (scheduleDayNumbers.length > 0) {
                                        let newCurrentDate = new Date(currentDate);
                                        if (!scheduleDayNumbers.includes(newCurrentDate.getDay())) {
                                            let tempDate = new Date(currentDate);
                                            let foundValid = false;
                                            for (let i = 0; i < 7; i++) {
                                                if (scheduleDayNumbers.includes(tempDate.getDay())) {
                                                    newCurrentDate = new Date(tempDate);
                                                    foundValid = true;
                                                    break;
                                                }
                                                tempDate.setDate(tempDate.getDate() + 1);
                                            }
                                            if (!foundValid) {
                                                tempDate = new Date(currentDate);
                                                const firstDayInNewSchedule = scheduleDayNumbers[0];
                                                const currentDayInOriginalWeek = tempDate.getDay();
                                                tempDate.setDate(tempDate.getDate() - currentDayInOriginalWeek + firstDayInNewSchedule);
                                                if (tempDate < currentDate && currentDayInOriginalWeek > firstDayInNewSchedule) {
                                                    tempDate.setDate(tempDate.getDate() + 7);
                                                }
                                                if (!scheduleDayNumbers.includes(tempDate.getDay())) {
                                                    tempDate = new Date(currentDate);
                                                    while(!scheduleDayNumbers.includes(tempDate.getDay())) {
                                                        tempDate.setDate(tempDate.getDate() + 1);
                                                    }
                                                }
                                                newCurrentDate = tempDate;
                                            }
                                        }
                                        setCurrentDate(newCurrentDate);
                                    }
                                }
                            }}
                        >
                            <option value="" className="bg-slate-700 text-gray-300">-- Select Schedule --</option>
                            {schedules.map((schedule) => (
                                <option key={schedule._id} value={schedule._id} className="bg-slate-700 text-gray-300">
                                    {`${schedule.subjectId?.name || 'N/A'} (${schedule.subjectId?.code || 'N/A'}) - ${schedule.section} - ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Select Date:
                        </label>
                        <div className="flex items-center border border-slate-600 bg-slate-700 rounded-lg">
                            <input
                                type="text"
                                className="px-4 py-2 w-full focus:outline-none rounded-l-lg bg-slate-700 text-gray-300 cursor-pointer"
                                value={currentDate.toLocaleDateString()}
                                readOnly
                                onClick={toggleCalendar}
                            />
                            <button
                                className="bg-slate-600 hover:bg-slate-500 rounded-r-lg p-3 text-gray-300"
                                onClick={toggleCalendar}
                            >
                                <FaCalendarAlt />
                            </button>
                        </div>
                        {isCalendarOpen && (
                            <div className="absolute top-full mt-1 left-0 md:left-auto md:right-0 bg-slate-700 rounded-lg shadow-lg p-2 z-50 border border-slate-600">
                                <div className="flex justify-end">
                                    <button
                                        className="text-gray-400 hover:text-gray-200 p-1"
                                        onClick={toggleCalendar}
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                                {/* DatePicker needs custom styling for dark mode. This is a basic container. */}
                                {/* You might need to override DatePicker's internal styles or use a dark-theme-compatible one. */}
                                <DatePicker
                                    selected={currentDate}
                                    onChange={handleDateChange}
                                    inline
                                    filterDate={filterDateByScheduleDay}
                                    // Add custom class names if DatePicker supports it for theming
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative mb-6">
                    <input
                        type="text"
                        className="border border-slate-600 bg-slate-700 rounded-lg px-4 py-2 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-300 placeholder-gray-500"
                        placeholder="Search by Name, Student Number, etc."
                        value={searchTerm}
                        onChange={handleSearch}
                        disabled={!selectedSchedule}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-500" />
                    </div>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-800 rounded-lg">
                    <div>
                        <label htmlFor="template-upload" className="block text-sm font-medium text-gray-400 mb-1">Upload SF2 Template:</label>
                        <input
                            id="template-upload"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => setTemplateFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-600 file:text-gray-300 hover:file:bg-slate-500 cursor-pointer"
                        />
                    </div>
                    <button
                        className="self-stretch sm:self-end bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition duration-150 ease-in-out flex items-center justify-center mt-2 sm:mt-0"
                        onClick={generateExcel}
                        disabled={!templateFile || !selectedSchedule || loading}
                    >
                        <FaFileExcel className="inline mr-2" /> Generate Excel
                    </button>
                </div>
                {error && selectedSchedule && <div className="text-red-400 mb-4 text-center">Error fetching students: {error}</div>}

                {loading && selectedSchedule && <div className="text-center py-4 text-gray-400">Loading student data...</div>}

                {!loading && selectedSchedule && filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto bg-slate-800 rounded-lg shadow-md">
                        <table className="min-w-full table-auto text-base text-left text-gray-300">
                            <thead className="bg-slate-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold uppercase text-gray-200">Student Number</th>
                                    <th className="px-4 py-3 font-semibold uppercase text-gray-200">Name</th>
                                    <th className="px-4 py-3 font-semibold uppercase text-gray-200">Education Level</th>
                                    <th className="px-4 py-3 font-semibold uppercase text-gray-200">Grade Year Level</th>
                                    <th className="px-4 py-3 font-semibold uppercase text-gray-200">Section</th>
                                    <th className="px-4 py-3 font-semibold uppercase text-gray-200">Sign-in Time</th>
                                    <th className="px-4 py-3 font-semibold uppercase text-gray-200">Sign-out Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-700 transition duration-150">
                                        <td className="px-4 py-3">{student.studentNumber}</td>
                                        <td className="px-4 py-3">{`${student.firstName} ${student.lastName}`}</td>
                                        <td className="px-4 py-3">{student.educationLevel}</td>
                                        <td className="px-4 py-3">{student.gradeYearLevel}</td>
                                        <td className="px-4 py-3">{student.section}</td>
                                        <td className="px-4 py-3">{getSignInTime(student)}</td>
                                        <td className="px-4 py-3">{getSignOutTime(student)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    !loading && selectedSchedule && (
                        <div className="flex flex-col items-center justify-center min-h-[200px] w-full bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <p className="text-gray-500">
                                {searchTerm ? "No students match your search criteria for this schedule and date." : "No attendance data found for this schedule and date, or no students assigned."}
                            </p>
                        </div>
                    )
                )}
                {!selectedSchedule && !loading && (
                    <div className="flex flex-col items-center justify-center min-h-[200px] w-full bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <p className="text-gray-500">Please select a schedule to view attendance.</p>
                    </div>
                )}
                <footer className="mt-12 text-center">
                    <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} St. Clare College of Caloocan</p>
                </footer>
            </div>
        </motion.div>
    );
};

export default TeacherAttendance;