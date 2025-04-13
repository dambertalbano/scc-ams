import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const initialAToken = localStorage.getItem('aToken') || '';
    const [aToken, setAToken] = useState(initialAToken);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [dashData, setDashData] = useState(null);

    useEffect(() => {
        const storedAToken = localStorage.getItem('aToken');
        if (storedAToken) {
            setAToken(storedAToken);
        }
    }, [setAToken]);

    const updateAToken = useCallback((token) => {
        setAToken(token);
        if (token) {
            localStorage.setItem('aToken', token); // Synchronous persistence
        } else {
            localStorage.removeItem('aToken'); // Synchronous removal
        }
    }, [setAToken]);

    const handleApiError = useCallback((error, message = "An error occurred") => {
        console.error(message + ":", error);
        toast.error(message + ": " + error.message);
    }, []);

    const getUserByCode = useCallback(async (code) => {
        try {
            console.log(`Attempting to fetch user with code: ${code}`);

            const response = await axios.get(`${backendUrl}/api/admin/user/code/${code}`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });

            if (response.data && response.data.success && response.data.user) {
                return { ...response.data, type: 'student' };
            }

            toast.error('User not found');
            return null;

        } catch (error) {
            handleApiError(error, 'Error fetching user by code');
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const getStudentByCode = useCallback(async (code) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/student/code/${code}`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (data.success && data.student) {
                return data.student;
            } else {
                toast.error(data.message || 'Student not found');
                return null;
            }
        } catch (error) {
            handleApiError(error, 'Error fetching student by code');
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const getAllStudents = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-students`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (data.success) {
                setStudents(data.students);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleApiError(error, 'Error fetching all students');
        }
    }, [aToken, backendUrl, handleApiError]);

    const getAllTeachers = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-teachers`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (data.success) {
                setTeachers(data.teachers);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleApiError(error, 'Error fetching all teachers');
        }
    }, [aToken, backendUrl, handleApiError]);

    const updateTeacher = useCallback(async (teacherId, updates, imageFile) => {
        const url = `${backendUrl}/api/admin/teachers/${teacherId}`;
        console.log("Updating teacher at URL:", url);

        try {
            const formData = new FormData();

            // Append updates to formData
            for (const key in updates) {
                formData.append(key, updates[key]);
            }

            // Append imageFile to formData if it exists
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Inspect the FormData object
            for (var pair of formData.entries()) {
                console.log(pair[0]+ ', ' + pair[1]);
            }

            const response = await axios.put(url, formData, {
                headers: {
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data', // Important!
                },
            });

            if (response.data.success) {
                toast.success("Teacher updated successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to update teacher");
            }
        } catch (error) {
            handleApiError(error, 'Error updating teacher');
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const deleteTeacher = useCallback(async (teacherId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Teacher deleted successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to delete teacher");
            }
        } catch (error) {
            handleApiError(error, 'Error deleting teacher');
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);
    
    const updateStudent = useCallback(async (student) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/students/${student._id}`, student, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Student updated successfully");
                getAllStudents();
                return true;
            } else {
                toast.error(response.data.message || "Failed to update student");
            }
        } catch (error) {
            handleApiError(error, 'Error updating student');
        }
    }, [aToken, backendUrl, getAllStudents, handleApiError]);

    const deleteStudent = useCallback(async (studentId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/students/${studentId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Student deleted successfully");
                getAllStudents();
                return true;
            } else {
                toast.error(response.data.message || "Failed to delete student");
            }
        } catch (error) {
            handleApiError(error, 'Error deleting student');
        }
    }, [aToken, backendUrl, getAllStudents, handleApiError]);

    const addStudent = useCallback(async (studentData) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/add-student`, studentData, {
                headers: {
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            if (response.data.success) {
                toast.success("Student added successfully");
                getAllStudents();
                return true;
            } else {
                toast.error(response.data.message || "Failed to add student");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding student');
            return false;
        }
    }, [aToken, backendUrl, getAllStudents, handleApiError]);

    const addTeacher = useCallback(async (teacherData) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/add-teacher`, teacherData, {
                headers: {
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            if (response.data.success) {
                toast.success("Teacher added successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to add teacher");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding teacher');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const loginAdmin = useCallback(async (email, password) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/login`, { email, password });

            if (response.data.success) {
                updateAToken(response.data.token);
                toast.success("Login successful");
                return true;
            } else {
                toast.error(response.data.message || "Login failed");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Login error');
            return false;
        }
    }, [backendUrl, handleApiError, updateAToken]);

    const adminSignIn = useCallback(async (code) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/sign-in/${code}`, {}, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Sign in successful");
                return true;
            } else {
                toast.error(response.data.message || "Sign in failed");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Sign in error');
            return false;
        }
    }, [aToken, backendUrl, handleApiError]);

    const adminSignOut = useCallback(async (code) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/sign-out/${code}`, {}, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Sign out successful");
                return true;
            } else {
                toast.error(response.data.message || "Sign out failed");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Sign out error');
            return false;
        }
    }, [aToken, backendUrl, handleApiError]);

    const fetchAttendanceRecords = useCallback(async (date, userType = 'Teacher') => {
        try {
            const isoDate = date.toISOString();
            const response = await axios.get(`${backendUrl}/api/admin/attendance?date=${isoDate}&userType=${userType}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                return response.data.attendanceRecords;
            } else {
                toast.error(response.data.message || "Failed to fetch attendance records");
                return [];
            }
        } catch (error) {
            handleApiError(error, 'Error fetching attendance records');
            return [];
        }
    }, [aToken, backendUrl, handleApiError]);

    const getDashData = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleApiError(error, 'Error fetching dashboard data');
        }
    }, [aToken, backendUrl, handleApiError]);

    const addTeacherClassSchedule = useCallback(async (teacherId, classSchedule) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/teachers/${teacherId}/class-schedule`, { classSchedule }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Class schedule added successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to add class schedule");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding class schedule');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const removeTeacherClassSchedule = useCallback(async (teacherId, classSchedule) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}/class-schedule`, {
                headers: { Authorization: `Bearer ${aToken}` },
                data: { classSchedule }
            });

            if (response.data.success) {
                toast.success("Class schedule removed successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to remove class schedule");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error removing class schedule');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const editTeacherClassSchedule = useCallback(async (teacherId, oldClassSchedule, newClassSchedule) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/teachers/${teacherId}/class-schedule`, { oldClassSchedule, newClassSchedule }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Class schedule updated successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to update class schedule");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error editing class schedule');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const addTeacherEducationLevel = useCallback(async (teacherId, educationLevel) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/teachers/${teacherId}/education-level`, { educationLevel }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Education level added successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to add education level");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding education level');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const removeTeacherEducationLevel = useCallback(async (teacherId, educationLevel) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}/education-level`, {
                headers: { Authorization: `Bearer ${aToken}` },
                data: { educationLevel }
            });

            if (response.data.success) {
                toast.success("Education level removed successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to remove education level");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error removing education level');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const editTeacherEducationLevel = useCallback(async (teacherId, oldEducationLevel, newEducationLevel) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/teachers/${teacherId}/education-level`, { oldEducationLevel, newEducationLevel }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Education level updated successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to update education level");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error editing education level');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const addTeacherGradeYearLevel = useCallback(async (teacherId, gradeYearLevel) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/teachers/${teacherId}/grade-year-level`, { gradeYearLevel }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Grade year level added successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to add grade year level");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding grade year level');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const removeTeacherGradeYearLevel = useCallback(async (teacherId, gradeYearLevel) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}/grade-year-level`, {
                headers: { Authorization: `Bearer ${aToken}` },
                data: { gradeYearLevel }
            });

            if (response.data.success) {
                toast.success("Grade year level removed successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to remove grade year level");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error removing grade year level');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const editTeacherGradeYearLevel = useCallback(async (teacherId, oldGradeYearLevel, newGradeYearLevel) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/teachers/${teacherId}/grade-year-level`, { oldGradeYearLevel, newGradeYearLevel }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Grade year level updated successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to update grade year level");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error editing grade year level');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const addTeacherSection = useCallback(async (teacherId, section) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/teachers/${teacherId}/section`, { section }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Section added successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to add section");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding section');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const removeTeacherSection = useCallback(async (teacherId, section) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}/section`, {
                headers: { Authorization: `Bearer ${aToken}` },
                data: { section }
            });

            if (response.data.success) {
                toast.success("Section removed successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to remove section");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error removing section');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const addTeacherSubjects = useCallback(async (teacherId, subjects) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/teachers/${teacherId}/subjects`, { subjects }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Subjects added successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to add subjects");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding subjects');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const removeTeacherSubjects = useCallback(async (teacherId, subjects) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}/subjects`, {
                headers: { Authorization: `Bearer ${aToken}` },
                data: { subjects }
            });

            if (response.data.success) {
                toast.success("Subjects removed successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to remove subjects");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error removing subjects');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const editTeacherSubjects = useCallback(async (teacherId, oldSubjects, newSubjects) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/teachers/${teacherId}/subjects`, { oldSubjects, newSubjects }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                toast.success("Subjects updated successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to update subjects");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error updating subjects');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const value = {
        aToken,
        setAToken: updateAToken,
        students,
        teachers,
        getAllStudents,
        getAllTeachers,
        updateTeacher,
        getUserByCode,
        deleteTeacher,
        updateStudent,
        deleteStudent,
        addStudent,
        addTeacher,
        loginAdmin,
        getStudentByCode,
        adminSignIn,
        adminSignOut,
        fetchAttendanceRecords,
        getDashData,
        dashData,
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
    };

    return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
};

export const useAdminContext = () => useContext(AdminContext);
export default AdminContextProvider;