import axios from 'axios';
import { createContext, useCallback, useState } from 'react';
import { toast } from 'react-toastify';

export const TeacherContext = createContext({
    dToken: null,
    setDToken: () => { },
    backendUrl: '',
    dashData: null,
    setDashData: () => { },
    loginTeacher: () => Promise.resolve(false),
    logoutTeacher: () => Promise.resolve(false),
    updateTeacherByProfile: () => Promise.resolve(false),
    addTeacherClassSchedule: () => Promise.resolve(false),
    removeTeacherClassSchedule: () => Promise.resolve(false),
    editTeacherClassSchedule: () => Promise.resolve(false),
    addTeacherEducationLevel: () => Promise.resolve(false),
    removeTeacherEducationLevel: () => Promise.resolve(false),
    editTeacherEducationLevel: () => Promise.resolve(false),
    addTeacherGradeYearLevel: () => Promise.resolve(false),
    removeTeacherGradeYearLevel: () => Promise.resolve(false),
    editTeacherGradeYearLevel: () => Promise.resolve(false),
    addTeacherSection: () => Promise.resolve(false),
    removeTeacherSection: () => Promise.resolve(false),
    addTeacherSubjects: () => Promise.resolve(false),
    removeTeacherSubjects: () => Promise.resolve(false),
    editTeacherSubjects: () => Promise.resolve(false),
    updateTeacherTeachingAssignments: () => Promise.resolve(false),
    fetchAttendanceRecords: () => Promise.resolve(null),
    fetchStudentsByTeachingAssignment: () => Promise.resolve(null), // Changed to null
});

const TeacherContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dToken, setDToken] = useState(() => localStorage.getItem('dToken') || null);
    const [dashData, setDashData] = useState(null);

    const updateDToken = useCallback((token) => {
        setDToken(token);
        try {
            if (token) {
                localStorage.setItem('dToken', token);
            } else {
                localStorage.removeItem('dToken');
            }
        } catch (error) {
            console.error('Error updating dToken in localStorage:', error);
            toast.error('Failed to update authentication token.');
        }
    }, [setDToken]);

    const handleApiError = useCallback((error, message = "An error occurred") => {
        console.error(message + ":", error);
        toast.error(message + ": " + error.message);
    }, []);

    const loginTeacher = useCallback(async (email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/login`, { email, password });
            if (data.success) {
                updateDToken(data.token);
                toast.success('Login successful!');
                return true; // Indicate successful login
            } else {
                toast.error(data.message);
                return false; // Indicate failed login
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Failed to login.');
            return false; // Indicate failed login
        }
    }, [backendUrl, updateDToken]);

    const logoutTeacher = useCallback(async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                updateDToken(null); // Clear the token on logout
                setDashData(null); // Clear dashData on logout
                toast.success('Logout successful!');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(error.response?.data?.message || 'Failed to logout.');
            return false;
        }
    }, [backendUrl, dToken, updateDToken, setDashData]);

    const updateTeacherByProfile = useCallback(async (updates) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/teacher/profile`, updates, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Teacher profile updated successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to update teacher profile.');
                return false;
            }
        } catch (error) {
            console.error('Error updating teacher profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update teacher profile.');
            return false;
        }
    }, [backendUrl, dToken]);

    // Class Schedule
    const addTeacherClassSchedule = useCallback(async (classSchedule) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/profile/class-schedule`, { classSchedule }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Class schedule added successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to add class schedule.');
                return false;
            }
        } catch (error) {
            console.error('Error adding class schedule:', error);
            toast.error(error.response?.data?.message || 'Failed to add class schedule.');
            return false;
        }
    }, [backendUrl, dToken]);

    const removeTeacherClassSchedule = useCallback(async (classScheduleId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/teacher/profile/class-schedule/${classScheduleId}`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Class schedule removed successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to remove class schedule.');
                return false;
            }
        } catch (error) {
            console.error('Error removing class schedule:', error);
            toast.error(error.response?.data?.message || 'Failed to remove class schedule.');
            return false;
        }
    }, [backendUrl, dToken]);

    const editTeacherClassSchedule = useCallback(async (classScheduleId, updatedClassSchedule) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/teacher/profile/class-schedule/${classScheduleId}`, { updatedClassSchedule }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Class schedule updated successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to update class schedule.');
                return false;
            }
        } catch (error) {
            console.error('Error editing class schedule:', error);
            toast.error(error.response?.data?.message || 'Failed to update class schedule.');
            return false;
        }
    }, [backendUrl, dToken]);

    // Education Level
    const addTeacherEducationLevel = useCallback(async (educationLevel) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/profile/education-level`, { educationLevel }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Education level added successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to add education level.');
                return false;
            }
        } catch (error) {
            console.error('Error adding education level:', error);
            toast.error(error.response?.data?.message || 'Failed to add education level.');
            return false;
        }
    }, [backendUrl, dToken]);

    const removeTeacherEducationLevel = useCallback(async (educationLevelId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/teacher/profile/education-level/${educationLevelId}`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Education level removed successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to remove education level.');
                return false;
            }
        } catch (error) {
            console.error('Error removing education level:', error);
            toast.error(error.response?.data?.message || 'Failed to remove education level.');
            return false;
        }
    }, [backendUrl, dToken]);

    const editTeacherEducationLevel = useCallback(async (educationLevelId, updatedEducationLevel) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/teacher/profile/education-level/${educationLevelId}`, { updatedEducationLevel }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Education level updated successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to update education level.');
                return false;
            }
        } catch (error) {
            console.error('Error editing education level:', error);
            toast.error(error.response?.data?.message || 'Failed to update education level.');
            return false;
        }
    }, [backendUrl, dToken]);

    // Grade/Year Level
    const addTeacherGradeYearLevel = useCallback(async (gradeYearLevel) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/profile/grade-year-level`, { gradeYearLevel }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Grade/year level added successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to add grade/year level.');
                return false;
            }
        } catch (error) {
            console.error('Error adding grade/year level:', error);
            toast.error(error.response?.data?.message || 'Failed to add grade/year level.');
            return false;
        }
    }, [backendUrl, dToken]);

    const removeTeacherGradeYearLevel = useCallback(async (gradeYearLevelId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/teacher/profile/grade-year-level/${gradeYearLevelId}`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Grade/year level removed successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to remove grade/year level.');
                return false;
            }
        } catch (error) {
            console.error('Error removing grade/year level:', error);
            toast.error(error.response?.data?.message || 'Failed to remove grade/year level.');
            return false;
        }
    }, [backendUrl, dToken]);

    const editTeacherGradeYearLevel = useCallback(async (gradeYearLevelId, updatedGradeYearLevel) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/teacher/profile/grade-year-level/${gradeYearLevelId}`, { updatedGradeYearLevel }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Grade/year level updated successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to update grade/year level.');
                return false;
            }
        } catch (error) {
            console.error('Error editing grade/year level:', error);
            toast.error(error.response?.data?.message || 'Failed to update grade/year level.');
            return false;
        }
    }, [backendUrl, dToken]);

    // Section
    const addTeacherSection = useCallback(async (section) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/profile/section`, { section }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Section added successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to add section.');
                return false;
            }
        } catch (error) {
            console.error('Error adding section:', error);
            toast.error(error.response?.data?.message || 'Failed to add section.');
            return false;
        }
    }, [backendUrl, dToken]);

    const removeTeacherSection = useCallback(async (sectionId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/teacher/profile/section/${sectionId}`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Section removed successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to remove section.');
                return false;
            }
        } catch (error) {
            console.error('Error removing section:', error);
            toast.error(error.response?.data?.message || 'Failed to remove section.');
            return false;
        }
    }, [backendUrl, dToken]);

    // Subjects
    const addTeacherSubjects = useCallback(async (subjects) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/profile/subjects`, { subjects }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Subjects added successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to add subjects.');
                return false;
            }
        } catch (error) {
            console.error('Error adding subjects:', error);
            toast.error(error.response?.data?.message || 'Failed to add subjects.');
            return false;
        }
    }, [backendUrl, dToken]);

    const removeTeacherSubjects = useCallback(async (subjectsId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/teacher/profile/subjects/${subjectsId}`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Subjects removed successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to remove subjects.');
                return false;
            }
        } catch (error) {
            console.error('Error removing subjects:', error);
            toast.error(error.response?.data?.message || 'Failed to remove subjects.');
            return false;
        }
    }, [backendUrl, dToken]);

    const editTeacherSubjects = useCallback(async (subjectsId, updatedSubjects) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/teacher/profile/subjects/${subjectsId}`, { updatedSubjects }, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Subjects updated successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to update subjects.');
                return false;
            }
        } catch (error) {
            console.error('Error editing subjects:', error);
            toast.error(error.response?.data?.message || 'Failed to update subjects.');
            return false;
        }
    }, [backendUrl, dToken]);

    const fetchAttendanceRecords = useCallback(async (date, userType = 'Teacher') => {
        try {
            let isoDate;
            if (date instanceof Date) {
                isoDate = date.toISOString();
            } else if (typeof date === 'string') {
                isoDate = date; // Use the date string directly
            } else {
                console.error("Invalid date provided:", date);
                return null;
            }
            const response = await axios.get(`${backendUrl}/api/teacher/attendance?date=${isoDate}&userType=${userType}`, {
                headers: { Authorization: `Bearer ${dToken}` },
            });

            if (response.data.success) {
                return response.data.attendanceRecords;
            } else {
                toast.error(response.data.message || "Failed to fetch attendance records");
                return null; // Indicate failure
            }
        } catch (error) {
            handleApiError(error, 'Error fetching attendance records');
            return null; // Indicate failure
        }
    }, [dToken, backendUrl, handleApiError]);

    const updateTeacherTeachingAssignments = useCallback(async (teachingAssignments) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/teacher/profile/teaching-assignments`,
                { teachingAssignments },
                {
                    headers: {
                        Authorization: `Bearer ${dToken}`,
                    },
                }
            );
            if (response.data.success) {
                toast.success("Teaching assignments updated successfully!");
                return true;
            } else {
                toast.error("Failed to update teaching assignments.");
                return false;
            }
        } catch (error) {
            console.error(
                "Error updating teacher teaching assignments:",
                error.response ? error.response.data : error.message
            );
            toast.error(error.response?.data?.message || "Failed to update teaching assignments.");
            return false;
        }
    }, [backendUrl, dToken]);

    const fetchStudentsByTeachingAssignment = useCallback(async (teacherId, date = null) => {
        try {
            const params = date ? { date } : {}; // Include date in query params if provided
            const response = await axios.get(`${backendUrl}/api/teacher/students/${teacherId}`, {
                params,
                headers: { Authorization: `Bearer ${dToken}` },
            });

            if (response.data.success) {
                return response.data.students; // Return the list of students
            } else {
                toast.error(response.data.message || "Failed to fetch students.");
                return []; // Return an empty array on failure
            }
        } catch (error) {
            console.error("Error fetching students by teaching assignment:", error);
            toast.error(error.response?.data?.message || "Failed to fetch students.");
            return []; // Return an empty array on failure
        }
    }, [backendUrl, dToken]);

    const value = {
        dToken,
        setDToken: updateDToken,
        backendUrl,
        dashData, // Add the new function here
        fetchAttendanceRecords,
        setDashData,
        loginTeacher,
        logoutTeacher,
        updateTeacherByProfile,
        addTeacherClassSchedule,
        removeTeacherClassSchedule,
        editTeacherClassSchedule,
        addTeacherEducationLevel,
        removeTeacherEducationLevel,
        editTeacherEducationLevel,
        addTeacherGradeYearLevel,
        removeTeacherGradeYearLevel,
        editTeacherGradeYearLevel,
        addTeacherSection,
        removeTeacherSection,
        addTeacherSubjects,
        removeTeacherSubjects,
        editTeacherSubjects,
        updateTeacherTeachingAssignments,
        fetchStudentsByTeachingAssignment,
    };

    return (
        <TeacherContext.Provider value={value}>
            {props.children}
        </TeacherContext.Provider>
    );
};

export default TeacherContextProvider;