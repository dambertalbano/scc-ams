import axios from "axios";
import ExcelJS from "exceljs";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  EducationalSelections,
  ItemListSection,
  ProfileForm,
  ProfileHeader,
  SuccessModal,
  TeachingAssignmentsList,
} from "../../components/TeacherComponents";
import { TeacherContext } from "../../context/TeacherContext";
import gradeOptions from "../../utils/gradeOptions";

const TeacherProfile = () => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

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
      }
    } catch (err) {
      setError(err.message);
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
      return alert("Please select all fields: Education Level, Grade/Year Level, and Section");
    }

    if (
      teachingAssignments.some(
        (assignment) =>
          assignment.educationLevel === educationLevel &&
          assignment.gradeYearLevel === gradeYearLevel &&
          assignment.section === section
      )
    ) {
      return alert("This teaching assignment is already added.");
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
        alert("Teaching assignment added successfully!");
      } else {
        alert("Failed to update teaching assignments.");
      }
    } catch (error) {
      console.error("Error adding teaching assignment:", error);
      alert(error.response?.data?.message || error.message);
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
        if (!success) {
          alert("Failed to update teaching assignments.");
        }
      } catch (error) {
        console.error("Error removing teaching assignment:", error);
        alert(error.response?.data?.message || error.message);
      }
    },
    [teachingAssignments, updateTeacherTeachingAssignments]
  );

  const addTeacherClassSchedule = () => {
    if (newClassSchedule.trim() === "") {
      alert("Class schedule cannot be empty.");
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
      alert("Subject cannot be empty.");
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
        alert("Profile updated successfully!");
        fetchTeacherProfile();
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  // --- Updated addMonthlyTotals Function ---
  const addMonthlyTotals = (worksheet, students, headerDates, reportStartDate, reportEndDate) => {
    const startRow = 14; // Starting row for student names
    const absentColumn = 30; // Column for Total Absences
    const tardyColumn = 31; // Column for Total Tardy
    const tardyHourThreshold = 8; // Example: Tardy if first sign-in is at 8 AM or later

    students.forEach((student, index) => {
        const row = worksheet.getRow(startRow + index);

        let totalAbsent = 0;
        let totalTardy = 0;

        // Group attendance records by date for easier processing
        const attendanceByDate = {};
        if (student.attendanceInRange && Array.isArray(student.attendanceInRange)) {
            student.attendanceInRange.forEach(record => {
                const recordDateStr = new Date(record.timestamp).toISOString().split('T')[0];
                if (!attendanceByDate[recordDateStr]) {
                    attendanceByDate[recordDateStr] = [];
                }
                attendanceByDate[recordDateStr].push(new Date(record.timestamp)); // Store as Date objects
            });
        }

        // Iterate through the dates shown in the template's header
        headerDates.forEach((headerDateStr, columnIndex) => {
            if (headerDateStr) { // Only process columns with a valid date
                const currentDate = new Date();
                const isFutureDate = new Date(headerDateStr) > currentDate;

                if (!isFutureDate) {
                    // Check for Absence
                    if (!attendanceByDate[headerDateStr]) {
                        // No attendance records found for this student on this header date
                        totalAbsent++;
                    } else {
                        // Check for Tardy (only if present)
                        const recordsForDay = attendanceByDate[headerDateStr];
                        recordsForDay.sort((a, b) => a - b); // Sort timestamps chronologically
                        const firstSignInTime = recordsForDay[0]; // Get the earliest record for the day

                        if (firstSignInTime) {
                            // Check local hour against threshold
                            if (firstSignInTime.getHours() >= tardyHourThreshold) {
                                totalTardy++;
                            }
                        }
                    }
                }
            }
        });

        // Write totals to the worksheet
        row.getCell(absentColumn).value = totalAbsent > 0 ? totalAbsent : null;
        row.getCell(tardyColumn).value = totalTardy > 0 ? totalTardy : null;

        row.commit();
    });

    console.log("Monthly Totals Added: Absent and Tardy (Updated Logic)");
  };
  // --- End Updated addMonthlyTotals Function ---

  const generateExcel = async () => {
    if (!templateFile) {
      alert("Please upload the SF2 Excel template first.");
      return;
    }
    if (!selectedAssignment) {
      alert("Please select a teaching assignment before generating the report.");
      return;
    }
    if (!startDate || !endDate) {
      alert("Please fill in both Start Date and End Date.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // --- Format dates before sending ---
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      // --- End formatting ---

      const response = await fetch(
        // --- Use formatted dates in the URL ---
        `${backendUrl}/api/teacher/students/${selectedAssignment._id}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        // --- End URL change ---
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );
      const data = await response.json();
      if (!data.success) {
        // --- Log the specific error from backend if available ---
        console.error("Backend Error:", data.message);
        throw new Error(data.message || "Failed to fetch attendance data.");
        // --- End logging ---
      }

      const students = data.students.sort((a, b) =>
        a.lastName.localeCompare(b.lastName)
      );

      const reader = new FileReader();
      reader.onload = async (e) => {
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
              const date = new Date(startDate);
              date.setDate(parsed);
              const formattedDate = date.toISOString().split("T")[0];

              if (date >= startDate && date <= endDate) {
                headerDates[colNumber] = formattedDate;
              }
            }
          }
        });

        const startRow = 14;
        const dailyTotals = Array(26).fill(0); // Assuming 26 possible attendance days (columns 4 to 29)

        // --- Updated Loop to Process Attendance ---
        students.forEach((student, index) => {
          const row = worksheet.getRow(startRow + index);
          row.getCell(2).value = `${student.lastName}, ${student.firstName} ${student.middleName || ""}`; // Student Name

          // Create a map of attendance dates for quick lookup
          const attendanceDates = new Set();
          if (student.attendanceInRange && Array.isArray(student.attendanceInRange)) {
              student.attendanceInRange.forEach(record => {
                  const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
                  attendanceDates.add(recordDate);
              });
          }

          headerDates.forEach((headerDate, columnIndex) => {
            if (headerDate) { // Check if headerDate is valid for the current month/range
              const cell = row.getCell(columnIndex);
              const currentDate = new Date();
              const isFutureDate = new Date(headerDate) > currentDate;

              if (isFutureDate) {
                cell.value = null; // Clear future dates
              } else {
                // Check if the student has any attendance record for this headerDate
                if (attendanceDates.has(headerDate)) {
                  cell.value = "P"; // Present
                  dailyTotals[columnIndex - 4]++; // Increment daily total for this column (index adjusted)
                } else {
                  cell.value = "A"; // Absent
                }
              }
            }
          });
          row.commit(); // Commit row after processing all dates for the student
        });
        // --- End Updated Loop ---

        // --- Update Daily Totals Row (Row 62) ---
        const totalRow = worksheet.getRow(62); // Assuming totals are on row 62
        dailyTotals.forEach((total, index) => {
            // Only update columns that had valid header dates
            if (headerDates[index + 4]) {
                totalRow.getCell(index + 4).value = total > 0 ? total : null; // Show total if > 0, else clear
            } else {
                totalRow.getCell(index + 4).value = null; // Clear columns with no valid date
            }
        });
        totalRow.commit();
        // --- End Update Daily Totals Row ---

        // --- Call Updated addMonthlyTotals ---
        addMonthlyTotals(worksheet, students, headerDates, startDate, endDate);
        // --- End Call ---

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
    } catch (err) {
      console.error("Error generating Excel file:", err);
      setError(err.message || "Failed to generate Excel file.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-lg">Loading profile...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <ProfileHeader teacherInfo={teacherInfo} />

      {/* Profile Form */}
      <ProfileForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateProfile}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Teaching Assignments Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            Select Teaching Schedule
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

        {/* Class Schedule and Subjects Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <ItemListSection
            title="Class Schedule"
            items={classSchedule}
            newItemValue={newClassSchedule}
            setNewItemValue={setNewClassSchedule}
            handleAddItem={addTeacherClassSchedule}
            handleRemoveItem={removeTeacherClassSchedule}
            handleEditItem={editTeacherClassSchedule}
            editingItemId={editingClassScheduleId}
            setEditingItemId={setEditingClassScheduleId}
            editedItemValue={editedClassSchedule}
            setEditedItemValue={setEditedClassSchedule}
          />
          <ItemListSection
            title="Subjects"
            items={subjects}
            newItemValue={newSubjects}
            setNewItemValue={setNewSubjects}
            handleAddItem={addTeacherSubjects}
            handleRemoveItem={removeTeacherSubjects}
            handleEditItem={editTeacherSubjects}
            editingItemId={editingSubjectsId}
            setEditingItemId={setEditingSubjectsId}
            editedItemValue={editedSubjects}
            setEditedItemValue={setEditedSubjects}
          />
        </div>
      </div>

      {/* Teaching Assignment Selection */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Select Teaching Schedule:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAssignment?._id || ""}
            onChange={(e) => {
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

        {/* Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Start Date:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              End Date:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* File Upload and Generate Button */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Upload SF2 Excel Template:
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setTemplateFile(e.target.files[0])}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg w-full md:w-auto"
          onClick={(e) => {
            e.preventDefault();
            generateExcel();
          }}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Excel"}
        </button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessCard}
        onClose={() => setShowSuccessCard(false)}
      />
    </div>
  );
};

export default TeacherProfile;