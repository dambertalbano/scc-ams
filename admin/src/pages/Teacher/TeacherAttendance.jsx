import ExcelJS from 'exceljs';
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
        setLoading(true);
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
            } else {
                setError(data.message || 'Failed to fetch teacher profile.');
            }
        } catch (err) {
            console.error('Error fetching teacher profile:', err);
            setError(err.message || 'Failed to fetch teacher profile.');
        } finally {
            setLoading(false);
        }
    }, [dToken, backendUrl]);

    useEffect(() => {
        fetchTeacherInfo();
    }, [fetchTeacherInfo]);

    useEffect(() => {
        if (!selectedSchedule) {
            setStudents([]);
            setFilteredStudents([]);
            setCurrentScheduleDetails(null);
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
    }, [setCurrentDate]);

    const toggleCalendar = useCallback(() => {
        setIsCalendarOpen(prev => !prev);
    }, [setIsCalendarOpen]);

    const formatTime = useCallback((dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const getSignInTime = (student) => {
        return student.signInTime
            ? formatTime(student.signInTime)
            : "N/A";
    };

    const getSignOutTime = (student) => {
        return student.signOutTime
            ? formatTime(student.signOutTime)
            : "N/A";
    };

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
            const gradeLevel = currentScheduleDetails.gradeYearLevel;
            const section = currentScheduleDetails.section;
            const subjectName = currentScheduleDetails.subjectId?.name || 'N/A';

            const formatTeacherName = (teacher) => {
                if (!teacher) return "N/A";
                const lastName = teacher.lastName
                    ? teacher.lastName.charAt(0).toUpperCase() + teacher.lastName.slice(1).toLowerCase()
                    : "";
                const firstName = teacher.firstName
                    ? teacher.firstName.charAt(0).toUpperCase() + teacher.firstName.slice(1).toLowerCase()
                    : "";
                const middleInitial = teacher.middleName
                    ? `${teacher.middleName.charAt(0).toUpperCase()}.`
                    : "";
                return `${lastName}, ${firstName} ${middleInitial}`;
            };

            const teacherName = teacherInfo ? formatTeacherName(teacherInfo) : "N/A";

            worksheet.getCell("AE86").value = teacherName;
            worksheet.getCell("AA6").value = `${month}`;
            worksheet.getCell("W8").value = `${gradeLevel}`;
            worksheet.getCell("AD8").value = `${section}`;

            const dateToColumnMap = {};
            worksheet.getRow(11).eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber >= 4 && colNumber <= 29) {
                    let raw = cell.value;
                    if (typeof raw === "object" && raw !== null) {
                        if (raw.richText) {
                            raw = raw.richText.map((rt) => rt.text).join("");
                        } else if (raw.result) {
                            raw = raw.result;
                        } else {
                            raw = null;
                        }
                    }
                    const parsed = raw !== null ? parseInt(String(raw).trim(), 10) : NaN;
                    if (!isNaN(parsed)) {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), parsed);
                        const isoDate = date.toISOString().split("T")[0];
                        dateToColumnMap[isoDate] = colNumber;
                    }
                }
            });

            const selectedDate = currentDate.toISOString().split("T")[0];
            const selectedColumn = dateToColumnMap[selectedDate];

            if (!selectedColumn) {
                alert("Selected date is not found in the SF2 template's header. Please check the template or selected date.");
                return;
            }

            const sortedStudents = [...students].sort((a, b) => {
                const lastNameA = (a.lastName || "").toLowerCase();
                const lastNameB = (b.lastName || "").toLowerCase();
                return lastNameA.localeCompare(lastNameB);
            });

            const startRow = 14;
            let totalPresent = 0;

            sortedStudents.forEach((student, index) => {
                const row = worksheet.getRow(startRow + index);
                row.getCell(2).value = `${student.lastName}, ${student.firstName} ${student.middleName || ""}`;

                const signInDate = student.signInTime
                    ? new Date(student.signInTime).toISOString().split("T")[0]
                    : null;
                const signOutDate = student.signOutTime
                    ? new Date(student.signOutTime).toISOString().split("T")[0]
                    : null;

                if (selectedDate === signInDate || selectedDate === signOutDate) {
                    row.getCell(selectedColumn).value = "P";
                    totalPresent++;
                } else {
                    row.getCell(selectedColumn).value = "A";
                }

                row.commit();
            });

            const totalRow = 62;
            worksheet.getCell(totalRow, selectedColumn).value = totalPresent;

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `SF2_${gradeLevel}_${section}_${subjectName.replace(/\s+/g, '_')}_${month}_${currentDate.getFullYear()}.xlsx`;
            link.click();
        };

        reader.readAsArrayBuffer(templateFile);
    };

    if (loading && !students.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (error && !selectedSchedule) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Student Attendance</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Schedule:
                    </label>
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedSchedule?._id || ""}
                        onChange={(e) => {
                            const schedule = schedules.find(
                                (s) => s._id === e.target.value
                            );
                            setSelectedSchedule(schedule);
                        }}
                    >
                        <option value="">-- Select Schedule --</option>
                        {schedules.map((schedule) => (
                            <option key={schedule._id} value={schedule._id}>
                                {`${schedule.subjectId?.name || 'N/A'} (${schedule.subjectId?.code || 'N/A'}) - ${schedule.section} - ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date:
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <input
                            type="text"
                            className="px-4 py-2 w-full focus:outline-none rounded-l-lg"
                            value={currentDate.toLocaleDateString()}
                            readOnly
                            onClick={toggleCalendar}
                        />
                        <button
                            className="bg-gray-200 hover:bg-gray-300 rounded-r-lg p-3"
                            onClick={toggleCalendar}
                        >
                            <FaCalendarAlt />
                        </button>
                    </div>
                    {isCalendarOpen && (
                        <div className="absolute top-full mt-1 left-0 md:left-auto md:right-0 bg-white rounded-lg shadow-lg p-2 z-50">
                            <div className="flex justify-end">
                                <button
                                    className="text-gray-500 hover:text-gray-700 p-1"
                                    onClick={toggleCalendar}
                                >
                                    <FaTimes size={12} />
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
            </div>

            <div className="relative mb-4">
                <input
                    type="text"
                    className="border rounded px-4 py-2 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by Name, Student Number, etc."
                    value={searchTerm}
                    onChange={handleSearch}
                    disabled={!selectedSchedule}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
                <div>
                    <label htmlFor="template-upload" className="block text-sm font-medium text-gray-700 mb-1">Upload SF2 Template:</label>
                    <input
                        id="template-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => setTemplateFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <button
                    className="self-end bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    onClick={generateExcel}
                    disabled={!templateFile || !selectedSchedule || loading}
                >
                    <FaFileExcel className="inline mr-2" /> Generate Excel
                </button>
            </div>
            {error && selectedSchedule && <div className="text-red-500 mb-4">Error fetching students: {error}</div>}

            {loading && <div className="text-center py-4">Loading student data...</div>}

            {!loading && selectedSchedule && filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Student Number</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Education Level</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Grade Year Level</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Section</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sign-in Time</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sign-out Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2">{student.studentNumber}</td>
                                    <td className="border px-4 py-2">{`${student.firstName} ${student.lastName}`}</td>
                                    <td className="border px-4 py-2">{student.educationLevel}</td>
                                    <td className="border px-4 py-2">{student.gradeYearLevel}</td>
                                    <td className="border px-4 py-2">{student.section}</td>
                                    <td className="border px-4 py-2">{getSignInTime(student)}</td>
                                    <td className="border px-4 py-2">{getSignOutTime(student)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && selectedSchedule && (
                    <div className="flex flex-col items-center justify-center min-h-[200px] w-full bg-gray-50 p-6 rounded-lg border">
                        <p className="text-gray-500">
                            {searchTerm ? "No students match your search criteria for this schedule and date." : "No attendance data found for this schedule and date, or no students assigned."}
                        </p>
                    </div>
                )
            )}
            {!selectedSchedule && !loading && (
                <div className="flex flex-col items-center justify-center min-h-[200px] w-full bg-gray-50 p-6 rounded-lg border">
                    <p className="text-gray-500">Please select a schedule to view attendance.</p>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;