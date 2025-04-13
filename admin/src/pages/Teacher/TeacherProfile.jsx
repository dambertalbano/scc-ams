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
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const success = await updateTeacherByProfile(formData); // Call the function with the updated form data
      if (success) {
        alert("Profile updated successfully!");
        fetchTeacherProfile(); // Refresh the profile data after a successful update
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || error.message);
    }
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
    if (!startDate || !endDate) {
        alert("Please fill in both Start Date and End Date.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
        const response = await fetch(
            `${backendUrl}/api/teacher/students/${selectedAssignment._id}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
            {
                headers: { Authorization: `Bearer ${dToken}` },
            }
        );
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || "Failed to fetch attendance data.");
        }

        // Sort students alphabetically by last name
        const students = data.students.sort((a, b) => {
            const lastNameA = a.lastName.toLowerCase();
            const lastNameB = b.lastName.toLowerCase();
            if (lastNameA < lastNameB) return -1;
            if (lastNameA > lastNameB) return 1;
            return 0;
        });

        const reader = new FileReader();
        reader.onload = async (e) => {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(e.target.result);

            const worksheet = workbook.getWorksheet(1); // Assuming the first sheet

            const month = startDate.toLocaleString("default", { month: "long" });
            const gradeLevel = selectedAssignment.gradeYearLevel;
            const section = selectedAssignment.section;

            // Update report data
            worksheet.getCell("AA6").value = `${month}`;
            worksheet.getCell("W8").value = `${gradeLevel}`;
            worksheet.getCell("AD8").value = `${section}`;

            // Extract header dates from row 11
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

                        // Only include dates within the selected range
                        if (date >= startDate && date <= endDate) {
                            headerDates[colNumber] = formattedDate;
                        }
                    }
                }
            });

            // Add student data starting at row 14
            const startRow = 14;
            students.forEach((student, index) => {
                const row = worksheet.getRow(startRow + index);
                row.getCell(2).value = `${student.lastName}, ${student.firstName} ${student.middleName || ""}`;

                // Mark attendance only for dates within the selected range
                headerDates.forEach((headerDate, columnIndex) => {
                    if (columnIndex >= 4) {
                        const signInDate = student.signInTime
                            ? new Date(student.signInTime).toISOString().split("T")[0]
                            : null;
                        const signOutDate = student.signOutTime
                            ? new Date(student.signOutTime).toISOString().split("T")[0]
                            : null;

                        // Mark "P" if the student has a sign-in or sign-out time for the header date
                        if (headerDate === signInDate || headerDate === signOutDate) {
                            row.getCell(columnIndex).value = "P";
                        } else if (headerDate) {
                            row.getCell(columnIndex).value = "A";
                        }
                    }
                });

                row.commit();
            });

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
            Select Teaching Assignments
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
            Select Teaching Assignment:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAssignment?._id || ""}
            onChange={(e) => {
              const assignment = teachingAssignments.find(
                (ta) => ta._id === e.target.value
              );
              console.log("Selected Assignment:", assignment); // Debugging log
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
            e.preventDefault(); // Prevent the default form submission behavior
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