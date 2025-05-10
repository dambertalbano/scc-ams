import axios from "axios";
import { endOfMonth, format, isValid, startOfMonth } from 'date-fns';
import ExcelJS from "exceljs";
import { motion } from "framer-motion";
import { useCallback, useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaPercentage, FaUsers } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ProfileForm,
  ProfileHeader,
  SchedulesList
} from "../../components/TeacherComponents";
import { TeacherContext } from "../../context/TeacherContext";

const StatCard = ({ icon, label, value, colorClass = "text-gray-300", explanation }) => (
  <div
    className="bg-slate-700 p-4 rounded-lg shadow-md flex items-center space-x-3"
    title={explanation}
  >
    <div className={`text-3xl ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-200">{value}</p>
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

const addMonthlyTotals = (worksheet, students, headerDates, scheduleStartTime, scheduledJsDays) => {
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
        const currentHeaderDate = new Date(headerDateStr + "T00:00:00");
        const currentHeaderJsDay = currentHeaderDate.getDay();

        if (!isFutureDate && scheduledJsDays.includes(currentHeaderJsDay)) {
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

  const calculateClassAttendanceStats = useCallback((students, periodStartDate, periodEndDate, scheduleDays) => {
    if (!students || students.length === 0 || !periodStartDate || !periodEndDate) {
      return {
        totalStudents: 0, overallAttendancePercentage: 0, totalPresentInstances: 0,
        totalAbsentInstances: 0, studentsWithPerfectAttendance: 0, studentsWithHighAbsences: 0,
      };
    }
    const dayNameToNumber = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
    const scheduledJsDays = Array.isArray(scheduleDays) ? scheduleDays.map(day => dayNameToNumber[day]).filter(num => num !== undefined) : [];
    if (scheduledJsDays.length === 0) {
      console.warn("No valid schedule days provided for stats calculation.");
      return { totalStudents: 0, overallAttendancePercentage: 0, totalPresentInstances: 0, totalAbsentInstances: 0, studentsWithPerfectAttendance: 0, studentsWithHighAbsences: 0 };
    }
    let grandTotalPossibleDays = 0;
    let grandTotalPresentDays = 0;
    let studentsPerfect = 0;
    let studentsHighAbs = 0;
    const pStartDate = new Date(periodStartDate); pStartDate.setHours(0, 0, 0, 0);
    const pEndDate = new Date(periodEndDate); pEndDate.setHours(23, 59, 59, 999);

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
      const today = new Date(); today.setHours(23, 59, 59, 999);
      while (currentDateIter <= pEndDate && currentDateIter <= today) {
        const currentJsDay = currentDateIter.getDay();
        if (scheduledJsDays.includes(currentJsDay)) {
          studentPossibleDays++;
          const dateStr = currentDateIter.toISOString().split('T')[0];
          if (presentDatesForStudent.has(dateStr)) { studentPresentDays++; }
        }
        currentDateIter.setDate(currentDateIter.getDate() + 1);
      }
      grandTotalPossibleDays += studentPossibleDays;
      grandTotalPresentDays += studentPresentDays;
      if (studentPossibleDays > 0 && studentPresentDays === studentPossibleDays) { studentsPerfect++; }
      if (studentPossibleDays > 0 && (studentPossibleDays - studentPresentDays) >= 3) { studentsHighAbs++; }
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
      if (!selectedSchedule || !formattedStartDate || !formattedEndDate || !selectedSchedule.dayOfWeek) {
        setAssignmentAttendanceStats(null); setAssignmentStudentsForStats([]); return;
      }
      setLoadingStats(true);
      try {
        const data = await fetchStudentsBySchedule(selectedSchedule._id, null, formattedStartDate, formattedEndDate);
        if (data && data.success) {
          setAssignmentStudentsForStats(data.students || []);
          const stats = calculateClassAttendanceStats(data.students || [], startDate, endDate, selectedSchedule.dayOfWeek);
          setAssignmentAttendanceStats(stats);
        } else {
          toast.error(data?.message || "Failed to fetch student data for statistics.");
          setAssignmentStudentsForStats([]); setAssignmentAttendanceStats(null);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Error fetching student data for stats.");
        setAssignmentStudentsForStats([]); setAssignmentAttendanceStats(null);
      } finally { setLoadingStats(false); }
    };
    fetchStudentsAndCalculateStats();
  }, [selectedSchedule, startDate, endDate, fetchStudentsBySchedule, calculateClassAttendanceStats]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { firstName, middleName, lastName, email, ...dataToUpdate } = formData;
      const success = await updateTeacherByProfile(dataToUpdate);
      if (success) { fetchTeacherProfile(); }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile.");
    }
  };

  const handleMonthChange = (date) => {
    if (date && isValid(date)) {
      setSelectedMonthForPicker(date);
      setStartDate(startOfMonth(date));
      setEndDate(endOfMonth(date));
    } else {
      setSelectedMonthForPicker(null); setStartDate(null); setEndDate(null);
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

          const reportMonthDate = new Date(startDate);
          const monthForReport = reportMonthDate.toLocaleString("default", { month: "long" });
          const reportYear = reportMonthDate.getFullYear();
          const reportMonthIndex = reportMonthDate.getMonth();

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

          const dateHeaderRowNumber = 11;
          const dayInitialHeaderRowNumber = dateHeaderRowNumber + 1;
          const firstDayColumn = 4;
          const maxDayColumnsInTemplate = 26;
          const lastPhysicalDayColumn = firstDayColumn + maxDayColumnsInTemplate - 1;

          const daysInSelectedMonth = new Date(reportYear, reportMonthIndex + 1, 0).getDate();
          const dayInitialsMap = ["S", "M", "T", "W", "TH", "F", "S"];

          const dateHeaderRow = worksheet.getRow(dateHeaderRowNumber);
          const dayInitialHeaderRow = worksheet.getRow(dayInitialHeaderRowNumber);
          
          const newHeaderDates = Array(lastPhysicalDayColumn + 1).fill(undefined);
          let currentHeaderWriteCol = firstDayColumn;

          for (let dayOfMonth = 1; dayOfMonth <= daysInSelectedMonth; dayOfMonth++) {
            if (currentHeaderWriteCol > lastPhysicalDayColumn) break;

            const dateForHeader = new Date(reportYear, reportMonthIndex, dayOfMonth);
            const dayOfWeek = dateForHeader.getDay();

            if (dayOfWeek !== 0) {
              dateHeaderRow.getCell(currentHeaderWriteCol).value = dayOfMonth;
              dayInitialHeaderRow.getCell(currentHeaderWriteCol).value = dayInitialsMap[dayOfWeek];
              newHeaderDates[currentHeaderWriteCol] = formatLocalDate(dateForHeader);
              currentHeaderWriteCol++;
            }
          }
          
          for (let colToClear = currentHeaderWriteCol; colToClear <= lastPhysicalDayColumn; colToClear++) {
            dateHeaderRow.getCell(colToClear).value = null;
            dayInitialHeaderRow.getCell(colToClear).value = null;
            newHeaderDates[colToClear] = undefined; 
          }
          
          const headerDates = newHeaderDates; 

          const dayNameToNumber = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
          let scheduledJsDaysForExcel = [];
          if (Array.isArray(selectedSchedule.dayOfWeek)) {
            scheduledJsDaysForExcel = selectedSchedule.dayOfWeek.map(day => dayNameToNumber[day]).filter(num => num !== undefined);
          } else if (typeof selectedSchedule.dayOfWeek === 'string') {
            const dayArray = selectedSchedule.dayOfWeek.split(',').map(d => d.trim());
            scheduledJsDaysForExcel = dayArray.map(day => dayNameToNumber[day]).filter(num => num !== undefined);
          }

          const startDataRow = 14;
          const dailyTotals = Array(maxDayColumnsInTemplate).fill(0);

          students.forEach((student, index) => {
            const row = worksheet.getRow(startDataRow + index);
            row.getCell(2).value = `${student.lastName}, ${student.firstName} ${student.middleName || ""}`.trim();
            const localAttendanceDates = new Set();
            if (student.attendanceInRange && Array.isArray(student.attendanceInRange)) {
              student.attendanceInRange.forEach(record => {
                localAttendanceDates.add(formatLocalDate(new Date(record.timestamp)));
              });
            }
            for (let columnIndex = firstDayColumn; columnIndex <= lastPhysicalDayColumn; columnIndex++) {
              const headerDateStr = headerDates[columnIndex];
              const cell = row.getCell(columnIndex);

              if (headerDateStr) {
                const todayDateStr = formatLocalDate(new Date());
                const isFutureDate = headerDateStr > todayDateStr;

                const currentHeaderDate = new Date(headerDateStr + "T12:00:00Z");
                const currentHeaderJsDay = currentHeaderDate.getUTCDay();

                if (isFutureDate) {
                    cell.value = null;
                } else if (scheduledJsDaysForExcel.includes(currentHeaderJsDay)) {
                    if (localAttendanceDates.has(headerDateStr)) {
                        cell.value = "P";
                        dailyTotals[columnIndex - firstDayColumn]++;
                    } else {
                        cell.value = "/";
                    }
                } else {
                    cell.value = null;
                }
              } else {
                cell.value = null;
              }
            }
          });

          const totalRow = worksheet.getRow(62);
          dailyTotals.forEach((total, index) => {
            const colIndexInSheet = index + firstDayColumn;
            if (headerDates[colIndexInSheet]) {
                 const headerDateForTotal = new Date(headerDates[colIndexInSheet] + "T12:00:00Z");
                 const headerJsDayForTotal = headerDateForTotal.getUTCDay();
                 if (scheduledJsDaysForExcel.includes(headerJsDayForTotal)) {
                    totalRow.getCell(colIndexInSheet).value = total > 0 ? total : null;
                 } else {
                    totalRow.getCell(colIndexInSheet).value = null;
                 }
            } else {
                totalRow.getCell(colIndexInSheet).value = null;
            }
          });

          addMonthlyTotals(worksheet, students, headerDates, scheduleStartTimeForExcel, scheduledJsDaysForExcel);

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

  if (loading && !teacherInfo) return (
    <motion.div className="flex flex-col justify-center items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 text-gray-300">
        Loading profile...
    </motion.div>
  );
  if (error && !teacherInfo) return (
    <motion.div className="flex flex-col justify-center items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 text-red-400">
        {error}
    </motion.div>
  );

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 sm:p-6 md:p-10 text-gray-300"
    >
      <div className="w-full max-w-6xl">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />

        {teacherInfo && <ProfileHeader teacherInfo={teacherInfo} />}
        {teacherInfo && <ProfileForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateProfile}
        />}

        <div className="bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-200">
            My Assigned Schedules
          </h3>
          {schedules.length > 0 ? (
            <SchedulesList schedules={schedules} />
          ) : (
            <p className="text-gray-400">You currently have no schedules assigned.</p>
          )}
        </div>

        <div className="bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-200">
            Attendance Report & Statistics
          </h3>
          <div className="mb-4 sm:mb-6">
            <label className="block text-base sm:text-lg font-semibold text-gray-400 mb-2">
              Select Schedule:
            </label>
            <select
              className="border border-slate-600 bg-slate-700 rounded-lg px-3 sm:px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-300"
              value={selectedSchedule?._id || ""}
              onChange={(e) => {
                const schedule = schedules.find((s) => s._id === e.target.value);
                setSelectedSchedule(schedule);
              }}
              disabled={schedules.length === 0}
            >
              <option value="" className="bg-slate-700 text-gray-300">-- Select Schedule --</option>
              {schedules.map((schedule) => (
                <option key={schedule._id} value={schedule._id} className="bg-slate-700 text-gray-300">
                  {`${schedule.subjectId?.name || 'N/A'} (${schedule.subjectId?.code || 'N/A'}) - ${schedule.section} - ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`}
                </option>
              ))}
            </select>
            {schedules.length === 0 && <p className="text-xs sm:text-sm text-red-400 mt-1">No schedules available. Schedules are assigned by an administrator.</p>}
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-base sm:text-lg font-semibold text-gray-400 mb-2">
              Select Month for Report:
            </label>
            <DatePicker
              selected={selectedMonthForPicker}
              onChange={handleMonthChange}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              className="border border-slate-600 bg-slate-700 rounded-lg px-3 sm:px-4 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-300 placeholder-gray-500"
              placeholderText="Select month and year"
            />
          </div>

          {selectedSchedule && startDate && endDate && (
            <div className="my-6 sm:my-8">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-200 mb-3 sm:mb-4">Class Attendance Statistics</h4>
              {loadingStats && <p className="text-gray-400">Loading statistics...</p>}
              {!loadingStats && assignmentAttendanceStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard icon={<FaUsers />} label="Total Students" value={assignmentAttendanceStats.totalStudents} explanation="Total number of students enrolled in the selected schedule." colorClass="text-blue-400" />
                  <StatCard icon={<FaPercentage />} label="Overall Attendance" value={`${assignmentAttendanceStats.overallAttendancePercentage}%`} colorClass="text-sky-400" explanation="Percentage of actual student attendance against total possible attendance days for all students in the selected period and schedule." />
                  <StatCard icon={<FaCheckCircle />} label="Total Present (Student-Days)" value={assignmentAttendanceStats.totalPresentInstances} colorClass="text-green-400" explanation="The sum of all days each student was marked present within the selected period for scheduled class days." />
                  <StatCard icon={<FaExclamationTriangle />} label="Total Absences (Student-Days)" value={assignmentAttendanceStats.totalAbsentInstances} colorClass="text-red-400" explanation="The sum of all days each student was marked absent within the selected period for scheduled class days." />
                  <StatCard icon={<FaCalendarAlt />} label="Perfect Attendance" value={assignmentAttendanceStats.studentsWithPerfectAttendance} colorClass="text-yellow-400" explanation="Number of students who were present on every scheduled class day within the selected period." />
                  <StatCard icon={<FaExclamationTriangle />} label="Students with 3+ Absences" value={assignmentAttendanceStats.studentsWithHighAbsences} colorClass="text-orange-400" explanation="Number of students who have accumulated 3 or more absences on scheduled class days within the selected period." />
                </div>
              )}
              {!loadingStats && !assignmentAttendanceStats && <p className="text-gray-500">No statistics to display for the selected criteria, or data could not be loaded.</p>}
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <label className="block text-base sm:text-lg font-semibold text-gray-400 mb-2">
              Upload SF2 Excel Template:
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setTemplateFile(e.target.files[0])}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-600 file:text-gray-300 hover:file:bg-slate-500 border border-slate-600 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {templateFile && <p className="text-xs sm:text-sm text-gray-500 mt-1">Selected: {templateFile.name}</p>}
          </div>

          <button
            className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg w-full md:w-auto transition duration-150 ease-in-out ${generatingReport ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              generateExcel();
            }}
            disabled={generatingReport || !selectedSchedule || !startDate}
          >
            {generatingReport ? "Generating..." : "Generate Excel Report (SF2)"}
          </button>
        </div>
        <footer className="mt-12 text-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} St. Clare College of Caloocan</p>
        </footer>
      </div>
    </motion.div>
  );
};

export default TeacherProfile;