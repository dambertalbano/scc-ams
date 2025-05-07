import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext(undefined); // Or provide a default shape if preferred

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
            localStorage.setItem('aToken', token);
        } else {
            localStorage.removeItem('aToken');
        }
    }, [setAToken]);

    const handleApiError = useCallback((error, message = "An error occurred") => {
        console.error(message + ":", error);
        const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
        toast.error(`${message}: ${errorMessage}`);
    }, []);

    const getUserByCode = useCallback(async (code) => {
        try {
            console.log(`Attempting to fetch user with code: ${code}`);

            const response = await axios.get(`${backendUrl}/api/admin/user/code/${code}`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });

            if (response.data && response.data.success && response.data.user) {
                return { ...response.data, type: response.data.userType || 'unknown' }; // Ensure userType is handled
            }

            toast.error(response.data.message || 'User not found');
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
            for (const key in updates) {
                formData.append(key, updates[key]);
            }
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await axios.put(url, formData, {
                headers: {
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success("Teacher updated successfully");
                getAllTeachers();
                return true;
            } else {
                toast.error(response.data.message || "Failed to update teacher");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error updating teacher');
            return false;
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
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error deleting teacher');
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);
    
    const updateStudent = useCallback(async (studentId, updates, imageFile) => { // Added imageFile
        const url = `${backendUrl}/api/admin/students/${studentId}`;
        try {
            const formData = new FormData();
            for (const key in updates) {
                formData.append(key, updates[key]);
            }
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await axios.put(url, formData, {
                headers: { 
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success("Student updated successfully");
                getAllStudents();
                return true;
            } else {
                toast.error(response.data.message || "Failed to update student");
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error updating student');
            return false;
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
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error deleting student');
            return false;
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

    const fetchAttendanceRecords = useCallback(async (date, userType) => {
        try {
            const isoDate = new Date(date).toISOString();
            console.log("Fetching attendance records for date:", isoDate, "and userType:", userType);

            const queryParams = new URLSearchParams({ date: isoDate });
            if (userType) {
                queryParams.append('userType', userType);
            }

            const response = await axios.get(`${backendUrl}/api/admin/attendance?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                return response.data.attendanceRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            } else {
                toast.error(response.data.message || "Failed to fetch attendance records");
                return [];
            }
        } catch (error) {
            console.error("Error fetching attendance records:", error);
            // It's better to throw the error or return a consistent error object
            // so the calling component can handle it (e.g., show a specific message or state)
            handleApiError(error, "Error fetching attendance records");
            return []; // Or throw error;
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

    // Subject APIs
    const getAllSubjects = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/subjects`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data.subjects;
            } else {
                toast.error(data.message || "Failed to fetch subjects");
                return [];
            }
        } catch (error) {
            handleApiError(error, "Error fetching subjects");
            return [];
        }
    }, [aToken, backendUrl, handleApiError]);

    const createSubject = useCallback(async (subjectData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/subjects`, subjectData, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                toast.success("Subject created successfully");
                return data.subject;
            } else {
                toast.error(data.message || "Failed to create subject");
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error creating subject");
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const updateSubject = useCallback(async (subjectId, updates) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/subjects/${subjectId}`, updates, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                toast.success("Subject updated successfully");
                return data.subject;
            } else {
                toast.error(data.message || "Failed to update subject");
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error updating subject");
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const deleteSubject = useCallback(async (subjectId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/subjects/${subjectId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                toast.success("Subject deleted successfully");
                return true;
            } else {
                toast.error(data.message || "Failed to delete subject");
                return false;
            }
        } catch (error) {
            handleApiError(error, "Error deleting subject");
            return false;
        }
    }, [aToken, backendUrl, handleApiError]);

    // Schedule APIs
    const getAllSchedules = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/schedules`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data.schedules;
            } else {
                toast.error(data.message || "Failed to fetch schedules");
                return [];
            }
        } catch (error) {
            handleApiError(error, "Error fetching schedules");
            return [];
        }
    }, [aToken, backendUrl, handleApiError]);

    const createSchedule = useCallback(async (scheduleData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/schedules`, scheduleData, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                toast.success("Schedule created successfully");
                return data.schedule;
            } else {
                toast.error(data.message || "Failed to create schedule");
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error creating schedule");
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const updateSchedule = useCallback(async (scheduleId, updates) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/schedules/${scheduleId}`, updates, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                toast.success("Schedule updated successfully");
                return data.schedule;
            } else {
                toast.error(data.message || "Failed to update schedule");
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error updating schedule");
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const deleteSchedule = useCallback(async (scheduleId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/schedules/${scheduleId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                toast.success("Schedule deleted successfully");
                return true;
            } else {
                toast.error(data.message || "Failed to delete schedule");
                return false;
            }
        } catch (error) {
            handleApiError(error, "Error deleting schedule");
            return false;
        }
    }, [aToken, backendUrl, handleApiError]);

    // --- Analytics API Functions ---
    const fetchAnalyticsSummary = useCallback(async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const { data } = await axios.get(`${backendUrl}/api/admin/analytics/summary?${queryParams}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data.summary;
            } else {
                toast.error(data.message || "Failed to fetch analytics summary");
                return null; // Or a default summary object
            }
        } catch (error) {
            handleApiError(error, "Error fetching analytics summary");
            return null; // Or a default summary object
        }
    }, [aToken, backendUrl, handleApiError]);

    const fetchUserGrowthStats = useCallback(async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const { data } = await axios.get(`${backendUrl}/api/admin/analytics/user-growth?${queryParams}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data; 
            } else {
                toast.error(data.message || "Failed to fetch user growth statistics");
                return { userGrowth: [], granularity: 'daily', period: {} }; 
            }
        } catch (error) {
            handleApiError(error, "Error fetching user growth statistics");
            return { userGrowth: [], granularity: 'daily', period: {} };
        }
    }, [aToken, backendUrl, handleApiError]);

    // Remove fetchAttendanceStatsByEducationLevel if no longer needed
    // const fetchAttendanceStatsByEducationLevel = useCallback(async (params = {}) => { ... });

    const fetchDailySignInStats = useCallback(async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const { data } = await axios.get(`${backendUrl}/api/admin/analytics/daily-sign-ins?${queryParams}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data; // Return the whole data object { dailySignIns: [], period: {}, granularity: 'daily' }
            } else {
                toast.error(data.message || "Failed to fetch daily sign-in statistics");
                return { dailySignIns: [], granularity: 'daily', period: {} }; // Default structure
            }
        } catch (error) {
            handleApiError(error, "Error fetching daily sign-in statistics");
            return { dailySignIns: [], granularity: 'daily', period: {} }; // Default structure
        }
    }, [aToken, backendUrl, handleApiError]);


    const contextValue = {
        aToken,
        setAToken: updateAToken,
        backendUrl,
        students,
        teachers,
        dashData,
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
        // Subject API Functions
        getAllSubjects,
        createSubject,
        updateSubject,
        deleteSubject, // Renamed from deleteSubjectAdmin for consistency
        // Schedule API Functions
        getAllSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule, // Renamed from deleteScheduleAdmin for consistency
        // Analytics API Functions
        fetchAnalyticsSummary,
        fetchUserGrowthStats,
        // fetchAttendanceStatsByEducationLevel, // Removed
        fetchDailySignInStats, // Added
    };

    return <AdminContext.Provider value={contextValue}>{props.children}</AdminContext.Provider>;
};

export const useAdminContext = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdminContext must be used within an AdminContextProvider. Make sure your component is a descendant of AdminContextProvider and that you are importing AdminContext correctly.');
    }
    return context;
};

export default AdminContextProvider;