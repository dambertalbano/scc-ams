import axios from "axios";
import { format, isValid } from 'date-fns'; // Import date-fns for robust date handling
import ExcelJS from "exceljs"; // Ensure ExcelJS is imported
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaPercentage, FaUsers } from "react-icons/fa"; // Added icons
import { ToastContainer, toast } from 'react-toastify';
import {
  EducationalSelections,
  ProfileForm,
  ProfileHeader,
  TeachingAssignmentsList
} from "../../components/TeacherComponents"; // Assuming these are responsive
import { TeacherContext } from "../../context/TeacherContext";
import gradeOptions from "../../utils/gradeOptions";

// Helper component for individual stat cards (can be moved to a separate file)
const StatCard = ({ icon, label, value, colorClass = "text-gray-700" }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
    <div className={`text-3xl ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

// Helper function for formatting dates (can be moved to a utils file)
const formatQueryDate = (date) => {
  if (date && isValid(new Date(date))) { // Check if date is valid
    return format(new Date(date), 'yyyy-MM-dd');
  }
  return undefined; // Return undefined if date is not valid, to prevent sending "undefined" string
};

const formatLocalDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addMonthlyTotals = (worksheet, students, headerDates) => {
  const startRow = 14; // Assuming student data starts at row 14
  const absentColumn = 30; // Column for Absences (e.g., AD)
  const tardyColumn = 31;  // Column for Tardies (e.g., AE)
  const tardyHourThreshold = 8; // Example: Sign-in at 8 AM or later is tardy

  students.forEach((student, index) => {
    const row = worksheet.getRow(startRow + index);

    let totalAbsent = 0;
    let totalTardy = 0;

    const attendanceByLocalDate = {};
    if (student.attendanceInRange && Array.isArray(student.attendanceInRange)) {
      student.attendanceInRange.forEach(record => {
        const recordTimestamp = new Date(record.timestamp);
        const localYear = recordTimestamp.getFullYear();
        const localMonth = String(recordTimestamp.getMonth() + 1).padStart(2, '0');
        const localDay = String(recordTimestamp.getDate()).padStart(2, '0');
        const recordLocalDateStr = `${localYear}-${localMonth}-${localDay}`;

        if (!attendanceByLocalDate[recordLocalDateStr]) {
          attendanceByLocalDate[recordLocalDateStr] = [];
        }
        attendanceByLocalDate[recordLocalDateStr].push(recordTimestamp);
      });
    }

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayDateStr = `${todayYear}-${todayMonth}-${todayDay}`;

    headerDates.forEach((headerDateStr, columnIndex) => {
      if (headerDateStr && columnIndex >= 4 && columnIndex <= 29) {
        const isFutureDate = headerDateStr > todayDateStr;

        if (!isFutureDate) {
          if (!attendanceByLocalDate[headerDateStr]) {
            totalAbsent++;
          } else {
            const recordsForDay = attendanceByLocalDate[headerDateStr];
            recordsForDay.sort((a, b) => a.getTime() - b.getTime());
            const firstSignInTime = recordsForDay[0];

            if (firstSignInTime) {
              if (firstSignInTime.getHours() >= tardyHourThreshold) {
                totalTardy++;
              }
            }
          }
        }
      }
    });

    row.getCell(absentColumn).value = totalAbsent > 0 ? totalAbsent : null;
    row.getCell(tardyColumn).value = totalTardy > 0 ? totalTardy : null;
  });
};

const TeacherProfile = () => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true); // General page loading
  const [error, setError] = useState(null);

  const {
    dToken,
    backendUrl,
    updateTeacherByProfile,
    updateTeacherTeachingAssignments,
  } = useContext(TeacherContext);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    number: "",
    address: "",
    code: "",
  });

  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [educationLevel, setEducationLevel] = useState("");
  const [gradeYearLevel, setGradeYearLevel] = useState("");
  const [section, setSection] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const educationLevels = useMemo(() => Object.keys(gradeOptions), []);

  // For Excel Report Generation
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [startDate, setStartDate] = useState(null); // Initial state is null
  const [endDate, setEndDate] = useState(null); // Initial state is null
  const [templateFile, setTemplateFile] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false); // Specific loading for report

  // For Assignment Attendance Statistics
  const [assignmentStudentsForStats, setAssignmentStudentsForStats] = useState([]);
  const [assignmentAttendanceStats, setAssignmentAttendanceStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchTeacherProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/teacher/profile`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      if (response.data.success) {
        const profileData = response.data.profileData;
        setTeacherInfo(profileData);
        setFormData({
          firstName: profileData.firstName || "",
          middleName: profileData.middleName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          number: profileData.number || "",
          address: profileData.address || "",
          code: profileData.code || "",
        });
        setTeachingAssignments(profileData.teachingAssignments || []);
      } else {
        setError(response.data.message);
        toast.error(response.data.message || "Failed to fetch profile data.");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "An error occurred while fetching the profile.");
    } finally {
      setLoading(false);
    }
  }, [dToken, backendUrl]);

  useEffect(() => {
    fetchTeacherProfile();
  }, [fetchTeacherProfile]);

  useEffect(() => {
    if (educationLevels.length > 0 && !educationLevel) {
      setEducationLevel(educationLevels[0]);
    }
  }, [educationLevels, educationLevel]);

  useEffect(() => {
    if (educationLevel && gradeOptions[educationLevel]) {
        const grades = Object.keys(gradeOptions[educationLevel]);
        if (grades.length > 0 && !gradeYearLevel) {
            // setGradeYearLevel(grades[0]); // Optionally set default grade
        }
    }
    const newAvailableSections = gradeOptions[educationLevel]?.[gradeYearLevel] || [];
    setAvailableSections(newAvailableSections);

    if (!newAvailableSections.includes(section)) {
        setSection(""); // Reset section if not in new available sections
    }
  }, [educationLevel, gradeYearLevel, section]);

  const calculateClassAttendanceStats = useCallback((students, periodStartDate, periodEndDate) => {
    if (!students || students.length === 0 || !periodStartDate || !periodEndDate) {
      return {
        totalStudents: 0,
        overallAttendancePercentage: 0,
        totalPresentInstances: 0,
        totalAbsentInstances: 0,
        studentsWithPerfectAttendance: 0,
        studentsWithHighAbsences: 0, // e.g., 3+ absences
      };
    }

    let grandTotalPossibleDays = 0;
    let grandTotalPresentDays = 0;
    let studentsPerfect = 0;
    let studentsHighAbs = 0;

    const pStartDate = new Date(periodStartDate);
    pStartDate.setHours(0,0,0,0);
    const pEndDate = new Date(periodEndDate);
    pEndDate.setHours(23,59,59,999);

    students.forEach(student => {
      const presentDatesForStudent = new Set();
      if (student.attendanceInRange && Array.isArray(student.attendanceInRange)) {
        student.attendanceInRange.forEach(record => {
          if (record.eventType === 'sign-in') { // Consider only sign-ins for presence
            const recordDate = new Date(record.timestamp);
            presentDatesForStudent.add(recordDate.toISOString().split('T')[0]);
          }
        });
      }

      let studentPossibleDays = 0;
      let studentPresentDays = 0;
      let currentDate = new Date(pStartDate);
      const today = new Date();
      today.setHours(23,59,59,999);

      while (currentDate <= pEndDate && currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0) { // Exclude Sundays
          studentPossibleDays++;
          const dateStr = currentDate.toISOString().split('T')[0];
          if (presentDatesForStudent.has(dateStr)) {
            studentPresentDays++;
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      grandTotalPossibleDays += studentPossibleDays;
      grandTotalPresentDays += studentPresentDays;

      if (studentPossibleDays > 0 && studentPresentDays === studentPossibleDays) {
        studentsPerfect++;
      }
      if (studentPossibleDays > 0 && (studentPossibleDays - studentPresentDays) >= 3) {
        studentsHighAbs++;
      }
    });

    return {
      totalStudents: students.length,
      overallAttendancePercentage: grandTotalPossibleDays > 0 ? Math.round((grandTotalPresentDays / grandTotalPossibleDays) * 100) : 0,
      totalPresentInstances: grandTotalPresentDays, // This is total student-present-days
      totalAbsentInstances: grandTotalPossibleDays - grandTotalPresentDays, // Total student-absent-days
      studentsWithPerfectAttendance: studentsPerfect,
      studentsWithHighAbsences: studentsHighAbs,
    };
  }, []);

  useEffect(() => {
    const fetchStudentsForStats = async () => {
      const formattedStartDate = formatQueryDate(startDate);
      const formattedEndDate = formatQueryDate(endDate);

      if (!selectedAssignment || !formattedStartDate || !formattedEndDate) { // Check for formatted dates
        setAssignmentAttendanceStats(null);
        setAssignmentStudentsForStats([]);
        return;
      }

      setLoadingStats(true);
      try {
        const response = await axios.get(
          `${backendUrl}/api/teacher/students/${selectedAssignment._id}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
          { headers: { Authorization: `Bearer ${dToken}` } }
        );

        if (response.data.success) {
          setAssignmentStudentsForStats(response.data.students || []);
          const stats = calculateClassAttendanceStats(response.data.students || [], startDate, endDate);
          setAssignmentAttendanceStats(stats);
        } else {
          toast.error(response.data.message || "Failed to fetch student data for statistics.");
          setAssignmentStudentsForStats([]);
          setAssignmentAttendanceStats(null);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Error fetching student data for stats.");
        setAssignmentStudentsForStats([]);
        setAssignmentAttendanceStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStudentsForStats();
  }, [selectedAssignment, startDate, endDate, dToken, backendUrl, calculateClassAttendanceStats]);

  const handleAddTeachingAssignment = useCallback(async () => {
    if (!educationLevel || !gradeYearLevel || !section) {
      return toast.warn("Please select all fields: Education Level, Grade/Year Level, and Section");
    }
    if (teachingAssignments.some(a => a.educationLevel === educationLevel && a.gradeYearLevel === gradeYearLevel && a.section === section)) {
      return toast.warn("This teaching assignment is already added.");
    }
    try {
      const newAssignment = { educationLevel, gradeYearLevel, section };
      const success = await updateTeacherTeachingAssignments([...teachingAssignments, newAssignment]);
      if (success) {
        toast.success("Teaching assignment added successfully!");
        fetchTeacherProfile();
        setEducationLevel("");
        setGradeYearLevel("");
        setSection("");
      } else {
        toast.error("Failed to update teaching assignments on the server.");
      }
    } catch (error) {
      console.error("Error adding teaching assignment:", error);
      toast.error(error.response?.data?.message || error.message || "Error adding assignment.");
    }
  }, [educationLevel, gradeYearLevel, section, teachingAssignments, updateTeacherTeachingAssignments, fetchTeacherProfile]);

  const handleRemoveTeachingAssignment = useCallback(
    async (assignmentToRemove) => {
      try {
        const updatedAssignments = teachingAssignments.filter(
          (assignment) => assignment._id !== assignmentToRemove._id
        );

        const success = await updateTeacherTeachingAssignments(updatedAssignments);
        if (success) {
          toast.success("Teaching assignment removed.");
          fetchTeacherProfile();
        } else {
          toast.error("Failed to update teaching assignments on the server.");
        }
      } catch (error) {
        console.error("Error removing teaching assignment:", error);
        toast.error(error.response?.data?.message || error.message || "Error removing assignment.");
      }
    },
    [teachingAssignments, updateTeacherTeachingAssignments, fetchTeacherProfile]
  );

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const success = await updateTeacherByProfile(formData);
      if (success) {
        toast.success("Profile updated successfully!");
        fetchTeacherProfile();
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || error.message || "Error updating profile.");
    }
  };

  const generateExcel = async () => {
    if (!templateFile) {
      toast.warn("Please upload the SF2 Excel template first.");
      return;
    }
    if (!selectedAssignment) {
      toast.warn("Please select a teaching assignment before generating the report.");
      return;
    }
    const formattedStartDate = formatQueryDate ? formatQueryDate(startDate) : formatLocalDate(startDate);
    const formattedEndDate = formatQueryDate ? formatQueryDate(endDate) : formatLocalDate(endDate);

    if (!formattedStartDate || !formattedEndDate) {
      toast.warn("Please fill in both Start Date and End Date with valid dates.");
      return;
    }

    setLoading(true);
    setError(null);
    toast.info("Generating Excel report...", { autoClose: 2000 });

    try {
      const response = await fetch(
        `${backendUrl}/api/teacher/students/${selectedAssignment._id}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        const errorMsg = data.message || `Failed to fetch attendance data. Status: ${response.status}`;
        throw new Error(errorMsg);
      }

      const students = data.students.sort((a, b) =>
        a.lastName.localeCompare(b.lastName)
      );

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(e.target.result);

          const worksheet = workbook.getWorksheet(1);
          if (!worksheet) {
            throw new Error("Could not find the worksheet in the template.");
          }

          const month = new Date(startDate).toLocaleString("default", { month: "long" });
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
            return `${lastName}, ${firstName} ${middleInitial}`.trim();
          };

          const teacherName = teacherInfo ? formatTeacherName(teacherInfo) : "N/A";
          worksheet.getCell("AF86").value = teacherName;
          worksheet.getCell("AB6").value = `${month}`;
          worksheet.getCell("X8").value = `${gradeLevel}`;
          worksheet.getCell("AE8").value = `${section}`;

          const headerDates = [];
          const reportStartYear = new Date(startDate).getFullYear();
          const reportStartMonth = new Date(startDate).getMonth();

          const compareStartDate = new Date(startDate);
          compareStartDate.setHours(0, 0, 0, 0);
          const compareEndDate = new Date(endDate);
          compareEndDate.setHours(23, 59, 59, 999);

          worksheet.getRow(11).eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber >= 4 && colNumber <= 29) {
              let rawCellValue = cell.value;
              if (typeof rawCellValue === "object" && rawCellValue !== null) {
                if (rawCellValue.richText) {
                  rawCellValue = rawCellValue.richText.map((rt) => rt.text).join("");
                } else if (rawCellValue.hasOwnProperty('result')) {
                  rawCellValue = rawCellValue.result;
                } else {
                  rawCellValue = null;
                }
              }
              const dayOfMonth = rawCellValue !== null ? parseInt(String(rawCellValue).trim(), 10) : NaN;

              if (!isNaN(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31) {
                const checkDate = new Date(reportStartYear, reportStartMonth, dayOfMonth, 12, 0, 0);

                if (checkDate >= compareStartDate && checkDate <= compareEndDate) {
                  const monthString = String(checkDate.getMonth() + 1).padStart(2, '0');
                  const dayString = String(checkDate.getDate()).padStart(2, '0');
                  headerDates[colNumber] = `${checkDate.getFullYear()}-${monthString}-${dayString}`;
                } else {
                  headerDates[colNumber] = undefined;
                }
              } else {
                headerDates[colNumber] = undefined;
              }
            }
          });

          const startDataRow = 14;
          const dailyTotals = Array(26).fill(0);

          students.forEach((student, index) => {
            const row = worksheet.getRow(startDataRow + index);
            row.getCell(2).value = `${student.lastName}, ${student.firstName} ${student.middleName || ""}`.trim();

            const localAttendanceDates = new Set();
            if (student.attendanceInRange && Array.isArray(student.attendanceInRange)) {
              student.attendanceInRange.forEach(record => {
                const recordTimestamp = new Date(record.timestamp);
                const localYear = recordTimestamp.getFullYear();
                const localMonth = String(recordTimestamp.getMonth() + 1).padStart(2, '0');
                const localDay = String(recordTimestamp.getDate()).padStart(2, '0');
                const recordLocalDateStr = `${localYear}-${localMonth}-${localDay}`;
                localAttendanceDates.add(recordLocalDateStr);
              });
            }

            headerDates.forEach((headerDateStr, columnIndex) => {
              if (headerDateStr && columnIndex >= 4 && columnIndex <= 29) {
                const cell = row.getCell(columnIndex);

                const today = new Date();
                const todayYear = today.getFullYear();
                const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                const todayDay = String(today.getDate()).padStart(2, '0');
                const todayDateStr = `${todayYear}-${todayMonth}-${todayDay}`;
                const isFutureDate = headerDateStr > todayDateStr;

                if (isFutureDate) {
                  cell.value = null;
                } else {
                  if (localAttendanceDates.has(headerDateStr)) {
                    cell.value = "P";
                    dailyTotals[columnIndex - 4]++;
                  } else {
                    cell.value = "A";
                  }
                }
              } else if (columnIndex >= 4 && columnIndex <= 29) {
                const cell = row.getCell(columnIndex);
                cell.value = null;
              }
            });
          });

          const totalRow = worksheet.getRow(62);
          dailyTotals.forEach((total, index) => {
            const colIndex = index + 4;
            if (headerDates[colIndex]) {
              totalRow.getCell(colIndex).value = total > 0 ? total : null;
            } else {
              totalRow.getCell(colIndex).value = null;
            }
          });

          addMonthlyTotals(worksheet, students, headerDates);

          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `SF2_${selectedAssignment.gradeYearLevel}-${selectedAssignment.section}_${month}_${new Date(startDate).getFullYear()}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);

          toast.success("Excel report generated successfully!");
        } catch (loadErr) {
          console.error("Error processing Excel template:", loadErr);
          toast.error(loadErr.message || "Failed to process the Excel template.");
          setError(loadErr.message || "Failed to process the Excel template.");
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = (err) => {
        console.error("Error reading template file:", err);
        toast.error("Failed to read the template file.");
        setError("Failed to read the template file.");
        setLoading(false);
      };

      reader.readAsArrayBuffer(templateFile);
    } catch (err) {
      console.error("Error generating Excel file:", err);
      toast.error(err.message || "Failed to generate Excel file.");
      setError(err.message || "Failed to generate Excel file.");
      setLoading(false);
    }
  };

  if (loading && !teacherInfo) return <div className="min-h-screen flex items-center justify-center text-lg bg-gray-50">Loading profile...</div>;
  if (error && !teacherInfo) return <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50 p-4 text-center">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {teacherInfo && <ProfileHeader teacherInfo={teacherInfo} />}

      {teacherInfo && <ProfileForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateProfile}
      />}

      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
          Manage Teaching Assignments
        </h3>
        <EducationalSelections
          educationLevel={educationLevel}
          setEducationLevel={setEducationLevel}
          gradeYearLevel={gradeYearLevel}
          setGradeYearLevel={setGradeYearLevel}
          section={section}
          setSection={setSection}
          availableSections={availableSections}
          educationLevels={educationLevels}
          onSubmit={handleAddTeachingAssignment}
          teachingAssignments={teachingAssignments}
        />
        <TeachingAssignmentsList
          assignments={teachingAssignments}
          onRemove={handleRemoveTeachingAssignment}
        />
      </div>

      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
          Attendance Report & Statistics
        </h3>
        <div className="mb-4 sm:mb-6">
          <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
            Select Teaching Assignment:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAssignment?._id || ""}
            onChange={(e) => {
              const assignment = teachingAssignments.find((ta) => ta._id === e.target.value);
              setSelectedAssignment(assignment);
            }}
            disabled={teachingAssignments.length === 0}
          >
            <option value="">-- Select Assignment --</option>
            {teachingAssignments.map((assignment) => (
              <option key={assignment._id} value={assignment._id}>
                {`${assignment.educationLevel} - Grade ${assignment.gradeYearLevel} - Section ${assignment.section}`}
              </option>
            ))}
          </select>
          {teachingAssignments.length === 0 && <p className="text-xs sm:text-sm text-red-500 mt-1">No teaching assignments available. Please add one above.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
              Start Date:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="MM/dd/yyyy"
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
              End Date:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="MM/dd/yyyy"
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select end date"
            />
          </div>
        </div>

        {selectedAssignment && startDate && endDate && (
          <div className="my-6 sm:my-8">
            <h4 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">Class Attendance Statistics</h4>
            {loadingStats && <p className="text-gray-600">Loading statistics...</p>}
            {!loadingStats && assignmentAttendanceStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <StatCard icon={<FaUsers />} label="Total Students" value={assignmentAttendanceStats.totalStudents} />
                <StatCard icon={<FaPercentage />} label="Overall Attendance" value={`${assignmentAttendanceStats.overallAttendancePercentage}%`} colorClass="text-blue-500" />
                <StatCard icon={<FaCheckCircle />} label="Total Present (Student-Days)" value={assignmentAttendanceStats.totalPresentInstances} colorClass="text-green-500" />
                <StatCard icon={<FaExclamationTriangle />} label="Total Absences (Student-Days)" value={assignmentAttendanceStats.totalAbsentInstances} colorClass="text-red-500" />
                <StatCard icon={<FaCalendarAlt />} label="Perfect Attendance" value={assignmentAttendanceStats.studentsWithPerfectAttendance} colorClass="text-yellow-500" />
                <StatCard icon={<FaExclamationTriangle />} label="Students with 3+ Absences" value={assignmentAttendanceStats.studentsWithHighAbsences} colorClass="text-orange-500" />
              </div>
            )}
            {!loadingStats && !assignmentAttendanceStats && <p className="text-gray-500">No statistics to display for the selected criteria, or data could not be loaded.</p>}
          </div>
        )}

        <div className="mb-4 sm:mb-6">
          <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
            Upload SF2 Excel Template:
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setTemplateFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {templateFile && <p className="text-xs sm:text-sm text-gray-600 mt-1">Selected: {templateFile.name}</p>}
        </div>

        <button
          className={`bg-customRed hover:text-navbar text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg w-full md:w-auto transition duration-150 ease-in-out ${generatingReport ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            generateExcel();
          }}
          disabled={generatingReport}
        >
          {generatingReport ? "Generating..." : "Generate Excel Report (SF2)"}
        </button>
      </div>
    </div>
  );
};

export default TeacherProfile;