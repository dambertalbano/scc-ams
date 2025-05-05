import axios from "axios";
import ExcelJS from "exceljs";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  EducationalSelections,
  ProfileForm,
  ProfileHeader,
  TeachingAssignmentsList
} from "../../components/TeacherComponents";
import { TeacherContext } from "../../context/TeacherContext";
import gradeOptions from "../../utils/gradeOptions";

const TeacherProfile = () => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const [classSchedule, setClassSchedule] = useState([]);
  const [newClassSchedule, setNewClassSchedule] = useState("");
  const [editingClassScheduleId, setEditingClassScheduleId] = useState(null);
  const [editedClassSchedule, setEditedClassSchedule] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [newSubjects, setNewSubjects] = useState("");
  const [editingSubjectsId, setEditingSubjectsId] = useState(null);
  const [editedSubjects, setEditedSubjects] = useState("");

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);

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
    if (educationLevels.length > 0) {
      setEducationLevel(educationLevels[0]);
    }
  }, [educationLevels]);

  useEffect(() => {
    setAvailableSections(gradeOptions[educationLevel]?.[gradeYearLevel] || []);
  }, [educationLevel, gradeYearLevel]);

  const handleAddTeachingAssignment = useCallback(async () => {
    if (!educationLevel || !gradeYearLevel || !section) {
      return toast.warn("Please select all fields: Education Level, Grade/Year Level, and Section");
    }

    if (
      teachingAssignments.some(
        (assignment) =>
          assignment.educationLevel === educationLevel &&
          assignment.gradeYearLevel === gradeYearLevel &&
          assignment.section === section
      )
    ) {
      return toast.warn("This teaching assignment is already added.");
    }

    try {
      const newAssignment = { educationLevel, gradeYearLevel, section };
      const updatedAssignments = [...teachingAssignments, newAssignment];
      setTeachingAssignments(updatedAssignments);

      const success = await updateTeacherTeachingAssignments(updatedAssignments);
      if (success) {
        setEducationLevel("");
        setGradeYearLevel("");
        setSection("");
        toast.success("Teaching assignment added successfully!");
      } else {
        toast.error("Failed to update teaching assignments.");
      }
    } catch (error) {
      console.error("Error adding teaching assignment:", error);
      toast.error(error.response?.data?.message || error.message || "Error adding assignment.");
    }
  }, [educationLevel, gradeYearLevel, section, teachingAssignments, updateTeacherTeachingAssignments]);

  const handleRemoveTeachingAssignment = useCallback(
    async (assignmentToRemove) => {
      try {
        const updatedAssignments = teachingAssignments.filter(
          (assignment) =>
            !(
              assignment.educationLevel === assignmentToRemove.educationLevel &&
              assignment.gradeYearLevel === assignmentToRemove.gradeYearLevel &&
              assignment.section === assignmentToRemove.section
            )
        );
        setTeachingAssignments(updatedAssignments);

        const success = await updateTeacherTeachingAssignments(updatedAssignments);
        if (success) {
          toast.success("Teaching assignment removed.");
        } else {
          toast.error("Failed to update teaching assignments.");
        }
      } catch (error) {
        console.error("Error removing teaching assignment:", error);
        toast.error(error.response?.data?.message || error.message || "Error removing assignment.");
      }
    },
    [teachingAssignments, updateTeacherTeachingAssignments]
  );

  const addTeacherClassSchedule = () => {
    if (newClassSchedule.trim() === "") {
      toast.warn("Class schedule cannot be empty.");
      return;
    }
    setClassSchedule([...classSchedule, newClassSchedule]);
    setNewClassSchedule("");
  };

  const removeTeacherClassSchedule = (index) => {
    const updatedSchedule = classSchedule.filter((_, i) => i !== index);
    setClassSchedule(updatedSchedule);
  };

  const editTeacherClassSchedule = (index) => {
    const updatedSchedule = [...classSchedule];
    updatedSchedule[index] = newClassSchedule;
    setClassSchedule(updatedSchedule);
    setNewClassSchedule("");
  };

  const addTeacherSubjects = () => {
    if (newSubjects.trim() === "") {
      toast.warn("Subject cannot be empty.");
      return;
    }
    setSubjects([...subjects, newSubjects]);
    setNewSubjects("");
  };

  const removeTeacherSubjects = (index) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
  };

  const editTeacherSubjects = (index) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = newSubjects;
    setSubjects(updatedSubjects);
    setNewSubjects("");
  };

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

  const addMonthlyTotals = (worksheet, students, headerDates) => {
    const startRow = 14;
    const absentColumn = 30;
    const tardyColumn = 31;
    const tardyHourThreshold = 8;

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
        if (headerDateStr) {
          const isFutureDate = headerDateStr > todayDateStr;

          if (!isFutureDate) {
            if (!attendanceByLocalDate[headerDateStr]) {
              totalAbsent++;
            } else {
              const recordsForDay = attendanceByLocalDate[headerDateStr];
              recordsForDay.sort((a, b) => a - b);
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

  const generateExcel = async () => {
    if (!templateFile) {
      toast.warn("Please upload the SF2 Excel template first.");
      return;
    }
    if (!selectedAssignment) {
      toast.warn("Please select a teaching assignment before generating the report.");
      return;
    }
    if (!startDate || !endDate) {
      toast.warn("Please fill in both Start Date and End Date.");
      return;
    }

    setLoading(true);
    setError(null);
    toast.info("Generating Excel report...", { autoClose: 2000 });

    try {
      const formatLocalDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const formattedStartDate = formatLocalDate(startDate);
      const formattedEndDate = formatLocalDate(endDate);

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

          const month = startDate.toLocaleString("default", { month: "long" });
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
          worksheet.getCell("AF86").value = teacherName;
          worksheet.getCell("AB6").value = `${month}`;
          worksheet.getCell("X8").value = `${gradeLevel}`;
          worksheet.getCell("AE8").value = `${section}`;

          const headerDates = [];
          const reportStartYear = startDate.getFullYear();
          const reportStartMonth = startDate.getMonth();

          const compareStartDate = new Date(startDate);
          compareStartDate.setHours(0, 0, 0, 0);
          const compareEndDate = new Date(endDate);
          compareEndDate.setHours(23, 59, 59, 999);

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
                const day = parsed;
                const checkDate = new Date(reportStartYear, reportStartMonth, day, 12, 0, 0);

                if (checkDate >= compareStartDate && checkDate <= compareEndDate) {
                  const monthString = String(checkDate.getMonth() + 1).padStart(2, '0');
                  const dayString = String(checkDate.getDate()).padStart(2, '0');
                  headerDates[colNumber] = `${checkDate.getFullYear()}-${monthString}-${dayString}`;
                }
              }
            }
          });

          const startRow = 14;
          const dailyTotals = Array(26).fill(0);

          students.forEach((student, index) => {
            const row = worksheet.getRow(startRow + index);
            row.getCell(2).value = `${student.lastName}, ${student.firstName} ${student.middleName || ""}`;

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
          link.download = `SF2_${selectedAssignment.gradeYearLevel}-${selectedAssignment.section}_${month}_${startDate.getFullYear()}.xlsx`;
          link.click();
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

  if (loading && !teacherInfo) return <div className="h-screen flex items-center justify-center text-lg">Loading profile...</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {teacherInfo && <ProfileHeader teacherInfo={teacherInfo} />}

      {teacherInfo && <ProfileForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateProfile}
      />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
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
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">
          Generate Attendance Report (SF2)
        </h3>
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Select Teaching Assignment for Report:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAssignment?._id || ""}
            onChange={(e) => {
              const assignment = teachingAssignments.find(
                (ta) => ta._id === e.target.value
              );
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
          {teachingAssignments.length === 0 && <p className="text-sm text-red-500 mt-1">No teaching assignments available. Please add one above.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Report Start Date:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="MM/dd/yyyy"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Report End Date:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="MM/dd/yyyy"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select end date"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Upload SF2 Excel Template:
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setTemplateFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {templateFile && <p className="text-sm text-gray-600 mt-1">Selected: {templateFile.name}</p>}
        </div>

        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full md:w-auto transition duration-150 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            generateExcel();
          }}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Excel Report"}
        </button>
      </div>
    </div>
  );
};

export default TeacherProfile;