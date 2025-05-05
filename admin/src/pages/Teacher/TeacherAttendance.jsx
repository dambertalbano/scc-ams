import ExcelJS from 'exceljs';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaFileExcel, FaSearch, FaTimes } from 'react-icons/fa';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherAttendance = () => {
    const { dToken, backendUrl } = useContext(TeacherContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [teachingAssignments, setTeachingAssignments] = useState([]);
    const [templateFile, setTemplateFile] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

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
                setTeacherId(data.profileData._id);
                setTeacherInfo(data.profileData);
                setTeachingAssignments(data.profileData.teachingAssignments || []);
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
        if (!selectedAssignment) {
            console.log("Missing assignmentId:", { selectedAssignment });
            return;
        }

        const fetchStudents = async () => {
            const formattedDate = currentDate.toISOString().split("T")[0];
            console.log("Fetching students for date:", formattedDate);

            const response = await fetch(
                `${backendUrl}/api/teacher/students/${selectedAssignment._id}?date=${formattedDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${dToken}`,
                    },
                }
            );

            const data = await response.json();
            console.log("API Response:", data);
            setStudents(data.students || []);
        };

        fetchStudents();
    }, [selectedAssignment, currentDate]);

    useEffect(() => {
        const selectedDate = currentDate.toISOString().split('T')[0];
        console.log("Selected Date:", selectedDate);

        const filtered = students.filter(student => {
            const signInDate = student.signInTime
                ? new Date(student.signInTime).toISOString().split('T')[0]
                : null;
            const signOutDate = student.signOutTime
                ? new Date(student.signOutTime).toISOString().split('T')[0]
                : null;

            console.log("Student:", student);
            console.log("Sign-In Date:", signInDate, "Sign-Out Date:", signOutDate);

            return signInDate === selectedDate || signOutDate === selectedDate;
        });

        console.log("Filtered Students:", filtered);
        setFilteredStudents(filtered);
    }, [students, currentDate]);

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
        if (!selectedAssignment) {
            alert("Please select a teaching assignment before generating the report.");
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(e.target.result);

            const worksheet = workbook.getWorksheet(1);

            const month = currentDate.toLocaleString('default', { month: 'long' });
            const gradeLevel = selectedAssignment.gradeYearLevel;
            const section = selectedAssignment.section;

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
                alert("Selected date is not in the header dates.");
                return;
            }

            const sortedStudents = [...students].sort((a, b) => {
                const lastNameA = a.lastName.toLowerCase();
                const lastNameB = b.lastName.toLowerCase();
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
            link.download = "Attendance_Report.xlsx";
            link.click();
        };

        reader.readAsArrayBuffer(templateFile);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Students</h1>
            <div className="relative mb-4">
                <input
                    type="text"
                    className="border rounded px-4 py-2 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by Name, Student Number, Education Level, Grade Year Level, or Section"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                </div>
            </div>
            <div className="flex justify-center items-center mb-4">
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
            <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Select Teaching Shedule:
                </label>
                <select
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedAssignment?._id || ""}
                    onChange={(e) => {
                        e.preventDefault();
                        const assignment = teachingAssignments.find(
                            (ta) => ta._id === e.target.value
                        );
                        console.log("Selected Assignment:", assignment);
                        setSelectedAssignment(assignment);
                    }}
                >
                    <option value="">-- Select Assignment --</option>
                    {teachingAssignments.map((assignment) => (
                        <option key={assignment._id} value={assignment._id}>
                            {`${assignment.educationLevel} - Grade ${assignment.gradeYearLevel} - Section ${assignment.section}`}
                        </option>
                    ))}
                </select>
            </div>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setTemplateFile(e.target.files[0])}
                className="mb-2"
            />
            <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={generateExcel}
            >
                <FaFileExcel className="inline mr-2" /> Generate Excel
            </button>

            {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Student Number</th>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Education Level</th>
                                <th className="px-4 py-2 text-left">Grade Year Level</th>
                                <th className="px-4 py-2 text-left">Section</th>
                                <th className="px-4 py-2 text-left">Sign-in Time</th>
                                <th className="px-4 py-2 text-left">Sign-out Time</th>
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
                <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
                    <p className="text-gray-500">No students found for this date.</p>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;