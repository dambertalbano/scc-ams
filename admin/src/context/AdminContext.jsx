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
    const [feedbackStats, setFeedbackStats] = useState({ // New state for feedback stats
        totalFeedback: 0,
        newFeedbackCount: 0,
        viewedFeedbackCount: 0,
        archivedFeedbackCount: 0,
    });

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

    const handleApiError = useCallback((error, message = "An error occurred", options = { showToast: true }) => {
        console.error(message + ":", error);
        const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
        if (options.showToast) {
            toast.error(`${message}: ${errorMessage}`);
        }
    }, []);

    const getUserByCode = useCallback(async (code, tokenOverride = null, options = { showToast: true }) => {
        const currentToken = tokenOverride !== null ? tokenOverride : aToken;
        try {
            console.log(`Attempting to fetch user with code: ${code}`);
            const headers = {};
            if (currentToken) {
                headers.Authorization = `Bearer ${currentToken}`;
            }

            const response = await axios.get(`${backendUrl}/api/admin/user/code/${code}`, { headers });

            if (response.data && response.data.success && response.data.user) {
                return { ...response.data, type: response.data.userType || 'unknown' };
            }
            if (options.showToast) {
                toast.error(response.data.message || 'User not found');
            }
            return null;
        } catch (error) {
            handleApiError(error, 'Error fetching user by code', options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const getStudentByCode = useCallback(async (code, options = { showToast: true }) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/student/code/${code}`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (data.success && data.student) {
                return data.student;
            } else {
                if (options.showToast) {
                    toast.error(data.message || 'Student not found');
                }
                return null;
            }
        } catch (error) {
            handleApiError(error, 'Error fetching student by code', options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const getAllStudents = useCallback(async (options = { showToast: true }) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-students`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (data.success) {
                setStudents(data.students);
            } else {
                if (options.showToast) {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            handleApiError(error, 'Error fetching all students', options);
        }
    }, [aToken, backendUrl, handleApiError]);

    const getAllTeachers = useCallback(async (options = { showToast: true }) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-teachers`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (data.success) {
                setTeachers(data.teachers);
            } else {
                if (options.showToast) {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            handleApiError(error, 'Error fetching all teachers', options);
        }
    }, [aToken, backendUrl, handleApiError]);

    const updateTeacher = useCallback(async (teacherId, updates, imageFile, options = { showToast: true }) => {
        const url = `${backendUrl}/api/admin/teachers/${teacherId}`;
        try {
            const formData = new FormData();
            for (const key in updates) {
                formData.append(key, updates[key]);
            }
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Log FormData contents
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await axios.put(url, formData, {
                headers: { 
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                if (options.showToast) {
                    toast.success("Teacher updated successfully");
                }
                getAllTeachers();
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to update teacher");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error updating teacher', options);
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const deleteTeacher = useCallback(async (teacherId, options = { showToast: true }) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                if (options.showToast) {
                    toast.success("Teacher deleted successfully");
                }
                getAllTeachers();
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to delete teacher");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error deleting teacher', options);
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);
    
    const updateStudent = useCallback(async (studentId, updates, imageFile, options = { showToast: true }) => { // Added imageFile
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
                if (options.showToast) {
                    toast.success("Student updated successfully");
                }
                getAllStudents();
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to update student");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error updating student', options);
            return false;
        }
    }, [aToken, backendUrl, getAllStudents, handleApiError]);

    const deleteStudent = useCallback(async (studentId, options = { showToast: true }) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/students/${studentId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });

            if (response.data.success) {
                if (options.showToast) {
                    toast.success("Student deleted successfully");
                }
                getAllStudents();
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to delete student");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error deleting student', options);
            return false;
        }
    }, [aToken, backendUrl, getAllStudents, handleApiError]);

    const addStudent = useCallback(async (studentData, options = { showToast: true }) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/add-student`, studentData, {
                headers: {
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            if (response.data.success) {
                if (options.showToast) {
                    toast.success("Student added successfully");
                }
                getAllStudents();
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to add student");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding student', options);
            return false;
        }
    }, [aToken, backendUrl, getAllStudents, handleApiError]);

    const addTeacher = useCallback(async (teacherData, options = { showToast: true }) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/add-teacher`, teacherData, {
                headers: {
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            if (response.data.success) {
                if (options.showToast) {
                    toast.success("Teacher added successfully");
                }
                getAllTeachers();
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to add teacher");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Error adding teacher', options);
            return false;
        }
    }, [aToken, backendUrl, getAllTeachers, handleApiError]);

    const loginAdmin = useCallback(async (email, password, options = { showToast: true }) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/login`, { email, password });

            if (response.data.success) {
                updateAToken(response.data.token);
                if (options.showToast) {
                    toast.success("Login successful");
                }
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Login failed");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Login error', options);
            return false;
        }
    }, [backendUrl, handleApiError, updateAToken]);

    const adminSignIn = useCallback(async (code, tokenOverride = null, options = { showToast: true }) => {
        const currentToken = tokenOverride !== null ? tokenOverride : aToken;
        try {
            const headers = {};
            if (currentToken) {
                headers.Authorization = `Bearer ${currentToken}`;
            }
            const response = await axios.put(`${backendUrl}/api/admin/sign-in/${code}`, {}, { headers });

            if (response.data.success) {
                if (options.showToast) {
                    toast.success("Sign in successful");
                }
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Sign in failed");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Sign in error', options);
            return false;
        }
    }, [aToken, backendUrl, handleApiError]);

    const adminSignOut = useCallback(async (code, tokenOverride = null, options = { showToast: true }) => {
        const currentToken = tokenOverride !== null ? tokenOverride : aToken;
        try {
            const headers = {};
            if (currentToken) {
                headers.Authorization = `Bearer ${currentToken}`;
            }
            const response = await axios.put(`${backendUrl}/api/admin/sign-out/${code}`, {}, { headers });

            if (response.data.success) {
                if (options.showToast) {
                    toast.success("Sign out successful");
                }
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Sign out failed");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Sign out error', options);
            return false;
        }
    }, [aToken, backendUrl, handleApiError]);

    const fetchAttendanceRecords = useCallback(async (date, userType, options = { showToast: true }) => {
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
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to fetch attendance records");
                }
                return [];
            }
        } catch (error) {
            console.error("Error fetching attendance records:", error);
            handleApiError(error, "Error fetching attendance records", options);
            return [];
        }
    }, [aToken, backendUrl, handleApiError]);

    const getDashData = useCallback(async (options = { showToast: true }) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (data.success) {
                setDashData(data.dashData);
            } else {
                if (options.showToast) {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            handleApiError(error, 'Error fetching dashboard data', options);
        }
    }, [aToken, backendUrl, handleApiError]);

    // Subject APIs
    const getAllSubjects = useCallback(async (options = { showToast: true }) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/subjects`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data.subjects;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to fetch subjects");
                }
                return [];
            }
        } catch (error) {
            handleApiError(error, "Error fetching subjects", options);
            return [];
        }
    }, [aToken, backendUrl, handleApiError]);

    const createSubject = useCallback(async (subjectData, options = { showToast: true }) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/subjects`, subjectData, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                if (options.showToast) {
                    toast.success("Subject created successfully");
                }
                return data.subject;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to create subject");
                }
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error creating subject", options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const updateSubject = useCallback(async (subjectId, updates, options = { showToast: true }) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/subjects/${subjectId}`, updates, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                if (options.showToast) {
                    toast.success("Subject updated successfully");
                }
                return data.subject;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to update subject");
                }
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error updating subject", options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const deleteSubject = useCallback(async (subjectId, options = { showToast: true }) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/subjects/${subjectId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                if (options.showToast) {
                    toast.success("Subject deleted successfully");
                }
                return true;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to delete subject");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, "Error deleting subject", options);
            return false;
        }
    }, [aToken, backendUrl, handleApiError]);

    // Schedule APIs
    const getAllSchedules = useCallback(async (options = { showToast: true }) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/schedules`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data.schedules;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to fetch schedules");
                }
                return [];
            }
        } catch (error) {
            handleApiError(error, "Error fetching schedules", options);
            return [];
        }
    }, [aToken, backendUrl, handleApiError]);

    const createSchedule = useCallback(async (scheduleData, options = { showToast: true }) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/schedules`, scheduleData, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                if (options.showToast) {
                    toast.success("Schedule created successfully");
                }
                return data.schedule;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to create schedule");
                }
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error creating schedule", options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const updateSchedule = useCallback(async (scheduleId, updates, options = { showToast: true }) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/schedules/${scheduleId}`, updates, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                if (options.showToast) {
                    toast.success("Schedule updated successfully");
                }
                return data.schedule;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to update schedule");
                }
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error updating schedule", options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const deleteSchedule = useCallback(async (scheduleId, options = { showToast: true }) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/schedules/${scheduleId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                if (options.showToast) {
                    toast.success("Schedule deleted successfully");
                }
                return true;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to delete schedule");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, "Error deleting schedule", options);
            return false;
        }
    }, [aToken, backendUrl, handleApiError]);

    // --- Analytics API Functions ---
    const fetchAnalyticsSummary = useCallback(async (params = {}, options = { showToast: true }) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const { data } = await axios.get(`${backendUrl}/api/admin/analytics/summary?${queryParams}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data.summary;
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to fetch analytics summary");
                }
                return null; // Or a default summary object
            }
        } catch (error) {
            handleApiError(error, "Error fetching analytics summary", options);
            return null; // Or a default summary object
        }
    }, [aToken, backendUrl, handleApiError]);

    const fetchUserGrowthStats = useCallback(async (params = {}, options = { showToast: true }) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const { data } = await axios.get(`${backendUrl}/api/admin/analytics/user-growth?${queryParams}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data; 
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to fetch user growth statistics");
                }
                return { userGrowth: [], granularity: 'daily', period: {} }; 
            }
        } catch (error) {
            handleApiError(error, "Error fetching user growth statistics", options);
            return { userGrowth: [], granularity: 'daily', period: {} };
        }
    }, [aToken, backendUrl, handleApiError]);

    const fetchDailySignInStats = useCallback(async (params = {}, options = { showToast: true }) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const { data } = await axios.get(`${backendUrl}/api/admin/analytics/daily-sign-ins?${queryParams}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data.success) {
                return data; // Return the whole data object { dailySignIns: [], period: {}, granularity: 'daily' }
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to fetch daily sign-in statistics");
                }
                return { dailySignIns: [], granularity: 'daily', period: {} }; // Default structure
            }
        } catch (error) {
            handleApiError(error, "Error fetching daily sign-in statistics", options);
            return { dailySignIns: [], granularity: 'daily', period: {} }; // Default structure
        }
    }, [aToken, backendUrl, handleApiError]);

    // --- Feedback API Functions ---
    const getFeedbackStats = useCallback(async (options = { showToast: false }) => {
        if (!aToken) return null;
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/feedback/stats`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (data) { // Assuming the stats endpoint directly returns the stats object
                setFeedbackStats(data); // Update context state
                return data;
            } else {
                if (options.showToast) {
                    toast.error("Failed to fetch feedback stats");
                }
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error fetching feedback stats", options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const getAllFeedback = useCallback(async (page = 1, limit = 10, options = { showToast: true }) => {
        if (!aToken) return null;
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/feedback?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            // The backend returns { feedbackItems, currentPage, totalPages, totalFeedback }
            if (data && data.feedbackItems) {
                return data; // Return the whole pagination object
            } else {
                if (options.showToast) {
                    toast.error(data.message || "Failed to fetch feedback items");
                }
                return { feedbackItems: [], currentPage: 1, totalPages: 1, totalFeedback: 0 }; // Default structure
            }
        } catch (error) {
            handleApiError(error, "Error fetching feedback items", options);
            return { feedbackItems: [], currentPage: 1, totalPages: 1, totalFeedback: 0 };
        }
    }, [aToken, backendUrl, handleApiError]);

    const getFeedbackById = useCallback(async (feedbackId, options = { showToast: true }) => {
        if (!aToken) return null;
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/feedback/${feedbackId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            // Backend returns the feedback item directly or within a wrapper
            if (data) { // Assuming it returns the feedback item directly
                return data;
            } else {
                if (options.showToast) {
                    toast.error("Failed to fetch feedback details");
                }
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error fetching feedback details", options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError]);

    const updateFeedbackStatus = useCallback(async (feedbackId, status, options = { showToast: true }) => {
        if (!aToken) return false;
        try {
            const response = await axios.patch(`${backendUrl}/api/admin/feedback/${feedbackId}/status`, { status }, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (response.data && response.data.feedbackItem) { // Assuming backend returns { message, feedbackItem }
                if (options.showToast) {
                    toast.success(response.data.message || "Feedback status updated");
                }
                getFeedbackStats({ showToast: false }); // Refresh stats silently
                return response.data.feedbackItem;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to update feedback status");
                }
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error updating feedback status", options);
            return null;
        }
    }, [aToken, backendUrl, handleApiError, getFeedbackStats]);

    const deleteFeedbackItem = useCallback(async (feedbackId, options = { showToast: true }) => {
        if (!aToken) return false;
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/feedback/${feedbackId}`, {
                headers: { Authorization: `Bearer ${aToken}` },
            });
            if (response.data && response.data.message) { // Assuming backend returns { message } on success
                if (options.showToast) {
                    toast.success(response.data.message || "Feedback deleted successfully");
                }
                getFeedbackStats({ showToast: false }); // Refresh stats silently
                return true;
            } else {
                if (options.showToast) {
                    toast.error(response.data.message || "Failed to delete feedback");
                }
                return false;
            }
        } catch (error) {
            handleApiError(error, "Error deleting feedback", options);
            return false;
        }
    }, [aToken, backendUrl, handleApiError, getFeedbackStats]);

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
        fetchDailySignInStats, // Added
        // Feedback API Functions
        feedbackStats, // Expose stats state
        getFeedbackStats,
        getAllFeedback,
        getFeedbackById,
        updateFeedbackStatus,
        deleteFeedbackItem,
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