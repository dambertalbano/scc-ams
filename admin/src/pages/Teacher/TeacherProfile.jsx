import axios from "axios";
import { endOfMonth, format, isValid, startOfMonth } from 'date-fns';
import ExcelJS from "exceljs";
import React, { useCallback, useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaPercentage, FaUsers } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import {
  ProfileForm,
  ProfileHeader,
  SchedulesList
} from "../../components/TeacherComponents";
import { TeacherContext } from "../../context/TeacherContext";

const StatCard = ({ icon, label, value, colorClass = "text-gray-700" }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
    <div className={`text-3xl ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const formatQueryDate = (date) => {
  if (date && isValid(new Date(date))) {
    return format(new Date(date), 'yyyy-MM-dd');
  }
  return undefined;
};

const formatLocalDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addMonthlyTotals = (worksheet, students, headerDates, scheduleStartTime) => {
  const startRow = 14;
  const absentColumn = 30;
  const tardyColumn = 31;

  let tardyThresholdHours = null;
  let tardyThresholdMinutes = null;

  if (scheduleStartTime) {
    const [startHours, startMinutes] = scheduleStartTime.split(':').map(Number);
    const tempDate = new Date();
    tempDate.setHours(startHours, startMinutes + 15, 0, 0);
    tardyThresholdHours = tempDate.getHours();
    tardyThresholdMinutes = tempDate.getMinutes();
  } else {
    console.warn("Schedule start time not provided for tardy calculation in addMonthlyTotals. Tardy count might be inaccurate.");
  }

  students.forEach((student, index) => {
    const row = worksheet.getRow(startRow + index);
    let totalAbsent = 0;
    let totalTardy = 0;
    const attendanceByLocalDate = {};

    if (student.attendanceInRange && Array.isArray(student.attendanceInRange)) {
      student.attendanceInRange.forEach(record => {
        const recordTimestamp = new Date(record.timestamp);
        const recordLocalDateStr = formatLocalDate(recordTimestamp);
        if (!attendanceByLocalDate[recordLocalDateStr]) {
          attendanceByLocalDate[recordLocalDateStr] = [];
        }
        attendanceByLocalDate[recordLocalDateStr].push(recordTimestamp);
      });
    }

    const todayDateStr = formatLocalDate(new Date());

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

            if (firstSignInTime && tardyThresholdHours !== null && tardyThresholdMinutes !== null) {
              const signInHour = firstSignInTime.getHours();
              const signInMinute = firstSignInTime.getMinutes();

              if (signInHour > tardyThresholdHours || (signInHour === tardyThresholdHours && signInMinute > tardyThresholdMinutes)) {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    dToken,
    backendUrl,
    updateTeacherByProfile,
    fetchStudentsBySchedule,
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

  const [schedules, setSchedules] = useState([]);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMonthForPicker, setSelectedMonthForPicker] = useState(new Date());

  const [templateFile, setTemplateFile] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

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
        setSchedules(profileData.schedules || []);
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

  const calculateClassAttendanceStats = useCallback((students, periodStartDate, periodEndDate) => {
    if (!students || students.length === 0 || !periodStartDate || !periodEndDate) {
      return {
        totalStudents: 0,
        overallAttendancePercentage: 0,
        totalPresentInstances: 0,
        totalAbsentInstances: 0,
        studentsWithPerfectAttendance: 0,
        studentsWithHighAbsences: 0,
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
          if (record.eventType === 'sign-in') {
            const recordDate = new Date(record.timestamp);
            presentDatesForStudent.add(recordDate.toISOString().split('T')[0]);
          }
        });
      }

      let studentPossibleDays = 0;
      let studentPresentDays = 0;
      let currentDateIter = new Date(pStartDate);
      const today = new Date();
      today.setHours(23,59,59,999);

      while (currentDateIter <= pEndDate && currentDateIter <= today) {
        const dayOfWeek = currentDateIter.getDay();
        if (dayOfWeek !== 0) {
          studentPossibleDays++;
          const dateStr = currentDateIter.toISOString().split('T')[0];
          if (presentDatesForStudent.has(dateStr)) {
            studentPresentDays++;
          }
        }
        currentDateIter.setDate(currentDateIter.getDate() + 1);
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
      totalPresentInstances: grandTotalPresentDays,
      totalAbsentInstances: grandTotalPossibleDays - grandTotalPresentDays,
      studentsWithPerfectAttendance: studentsPerfect,
      studentsWithHighAbsences: studentsHighAbs,
    };
  }, []);

  useEffect(() => {
    const fetchStudentsAndCalculateStats = async () => {
      const formattedStartDate = formatQueryDate(startDate);
      const formattedEndDate = formatQueryDate(endDate);

      if (!selectedSchedule || !formattedStartDate || !formattedEndDate) {
        setAssignmentAttendanceStats(null);
        setAssignmentStudentsForStats([]);
        return;
      }

      setLoadingStats(true);
      try {
        const data = await fetchStudentsBySchedule(selectedSchedule._id, null, formattedStartDate, formattedEndDate);

        if (data && data.success) {
          setAssignmentStudentsForStats(data.students || []);
          const stats = calculateClassAttendanceStats(data.students || [], startDate, endDate);
          setAssignmentAttendanceStats(stats);
        } else {
          toast.error(data?.message || "Failed to fetch student data for statistics.");
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

    fetchStudentsAndCalculateStats();
  }, [selectedSchedule, startDate, endDate, fetchStudentsBySchedule, calculateClassAttendanceStats]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
        const success = await updateTeacherByProfile(formData);
        if (success) {
            fetchTeacherProfile(); // Refresh the profile data
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
};

  const handleMonthChange = (date) => {
    if (date && isValid(date)) {
      setSelectedMonthForPicker(date);
      setStartDate(startOfMonth(date));
      setEndDate(endOfMonth(date));
    } else {
      setSelectedMonthForPicker(null);
      setStartDate(null);
      setEndDate(null);
    }
  };

  const generateExcel = async () => {
    if (!templateFile) {
      toast.warn("Please upload the SF2 Excel template first.");
      return;
    }
    if (!selectedSchedule) {
      toast.warn("Please select a schedule before generating the report.");
      return;
    }
    if (!startDate || !endDate) {
      toast.warn("Please select a month for the report.");
      return;
    }
    const formattedStartDate = formatQueryDate(startDate);
    const formattedEndDate = formatQueryDate(endDate);

    setGeneratingReport(true);
    setError(null);
    toast.info("Generating Excel report...", { autoClose: 2000 });

    try {
      const data = await fetchStudentsBySchedule(selectedSchedule._id, null, formattedStartDate, formattedEndDate);

      if (!data || !data.success) {
        const errorMsg = data?.message || `Failed to fetch attendance data.`;
        throw new Error(errorMsg);
      }

      const students = (data.students || []).sort((a, b) =>
        (a.lastName || "").localeCompare(b.lastName || "")
      );

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(e.target.result);
          const worksheet = workbook.getWorksheet(1);
          if (!worksheet) throw new Error("Could not find the worksheet in the template.");

          const monthForReport = new Date(startDate).toLocaleString("default", { month: "long" });
          const gradeLevel = selectedSchedule.gradeYearLevel;
          const section = selectedSchedule.section;
          const subjectName = selectedSchedule.subjectId?.name || 'N/A';
          const scheduleStartTimeForExcel = selectedSchedule.startTime;

          const formatTeacherName = (teacher) => {
            if (!teacher) return "N/A";
            const lastName = teacher.lastName ? teacher.lastName.charAt(0).toUpperCase() + teacher.lastName.slice(1).toLowerCase() : "";
            const firstName = teacher.firstName ? teacher.firstName.charAt(0).toUpperCase() + teacher.firstName.slice(1).toLowerCase() : "";
            const middleInitial = teacher.middleName ? `${teacher.middleName.charAt(0).toUpperCase()}.` : "";
            return `${lastName}, ${firstName} ${middleInitial}`.trim();
          };

          const teacherName = teacherInfo ? formatTeacherName(teacherInfo) : "N/A";
          worksheet.getCell("AF86").value = teacherName;
          worksheet.getCell("AB6").value = `${monthForReport}`;
          worksheet.getCell("X8").value = `${gradeLevel}`;
          worksheet.getCell("AE8").value = `${section}`;

          const headerDates = [];
          const reportStartYear = new Date(startDate).getFullYear();
          const reportStartMonth = new Date(startDate).getMonth();
          const compareStartDate = new Date(startDate); compareStartDate.setHours(0, 0, 0, 0);
          const compareEndDate = new Date(endDate); compareEndDate.setHours(23, 59, 59, 999);

          worksheet.getRow(11).eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber >= 4 && colNumber <= 29) {
              let rawCellValue = cell.value;
              if (typeof rawCellValue === "object" && rawCellValue !== null) {
                if (rawCellValue.richText) rawCellValue = rawCellValue.richText.map(rt => rt.text).join("");
                else if (rawCellValue.hasOwnProperty('result')) rawCellValue = rawCellValue.result;
                else rawCellValue = null;
              }
              const dayOfMonth = rawCellValue !== null ? parseInt(String(rawCellValue).trim(), 10) : NaN;
              if (!isNaN(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31) {
                const checkDate = new Date(reportStartYear, reportStartMonth, dayOfMonth, 12, 0, 0);
                if (checkDate >= compareStartDate && checkDate <= compareEndDate) {
                  headerDates[colNumber] = formatLocalDate(checkDate);
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
                localAttendanceDates.add(formatLocalDate(new Date(record.timestamp)));
              });
            }
            headerDates.forEach((headerDateStr, columnIndex) => {
              if (headerDateStr && columnIndex >= 4 && columnIndex <= 29) {
                const cell = row.getCell(columnIndex);
                const todayDateStr = formatLocalDate(new Date());
                const isFutureDate = headerDateStr > todayDateStr;
                if (isFutureDate) cell.value = null;
                else if (localAttendanceDates.has(headerDateStr)) {
                  cell.value = "P";
                  dailyTotals[columnIndex - 4]++;
                } else cell.value = "/";
              } else if (columnIndex >= 4 && columnIndex <= 29) {
                row.getCell(columnIndex).value = null;
              }
            });
          });

          const totalRow = worksheet.getRow(62);
          dailyTotals.forEach((total, index) => {
            const colIndex = index + 4;
            if (headerDates[colIndex]) totalRow.getCell(colIndex).value = total > 0 ? total : null;
            else totalRow.getCell(colIndex).value = null;
          });

          addMonthlyTotals(worksheet, students, headerDates, scheduleStartTimeForExcel);

          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `SF2_${gradeLevel}-${section}_${subjectName.replace(/\s+/g, '_')}_${monthForReport}_${new Date(startDate).getFullYear()}.xlsx`;
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
          setGeneratingReport(false);
        }
      };
      reader.onerror = (err) => {
        console.error("Error reading template file:", err);
        toast.error("Failed to read the template file.");
        setError("Failed to read the template file.");
        setGeneratingReport(false);
      };
      reader.readAsArrayBuffer(templateFile);
    } catch (err) {
      console.error("Error generating Excel file:", err);
      toast.error(err.message || "Failed to generate Excel file.");
      setError(err.message || "Failed to generate Excel file.");
      setGeneratingReport(false);
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
          My Assigned Schedules
        </h3>
        {schedules.length > 0 ? (
          <SchedulesList schedules={schedules} />
        ) : (
          <p className="text-gray-600">You currently have no schedules assigned.</p>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
          Attendance Report & Statistics
        </h3>
        <div className="mb-4 sm:mb-6">
          <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
            Select Schedule:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSchedule?._id || ""}
            onChange={(e) => {
              const schedule = schedules.find((s) => s._id === e.target.value);
              setSelectedSchedule(schedule);
            }}
            disabled={schedules.length === 0}
          >
            <option value="">-- Select Schedule --</option>
            {schedules.map((schedule) => (
              <option key={schedule._id} value={schedule._id}>
                {`${schedule.subjectId?.name || 'N/A'} (${schedule.subjectId?.code || 'N/A'}) - ${schedule.section} - ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`}
              </option>
            ))}
          </select>
          {schedules.length === 0 && <p className="text-xs sm:text-sm text-red-500 mt-1">No schedules available. Schedules are assigned by an administrator.</p>}
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
            Select Month for Report:
          </label>
          <DatePicker
            selected={selectedMonthForPicker}
            onChange={handleMonthChange}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select month and year"
          />
        </div>

        {selectedSchedule && startDate && endDate && (
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
          disabled={generatingReport || !selectedSchedule || !startDate}
        >
          {generatingReport ? "Generating..." : "Generate Excel Report (SF2)"}
        </button>
      </div>
    </div>
  );
};

export default TeacherProfile;