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
    addTeacherSubjects: () => Promise.resolve(false),
    removeTeacherSubjects: () => Promise.resolve(false),
    fetchAttendanceRecords: () => Promise.resolve(null),
    fetchStudentsBySchedule: () => Promise.resolve(null),
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
        console.error(message + ":", error.response?.data || error.message);
        toast.error(error.response?.data?.message || message + ": " + error.message);
    }, []);

    const loginTeacher = useCallback(async (email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/login`, { email, password });
            if (data.success) {
                updateDToken(data.token);
                toast.success('Login successful!');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Failed to login.');
            return false;
        }
    }, [backendUrl, updateDToken, handleApiError]);

    const logoutTeacher = useCallback(async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                updateDToken(null);
                setDashData(null);
                toast.success('Logout successful!');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Failed to logout.');
            return false;
        }
    }, [backendUrl, dToken, updateDToken, setDashData, handleApiError]);

    const updateTeacherByProfile = useCallback(async (updates) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/teacher/profile`, updates, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Profile updated successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to update teacher profile.');
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Failed to update teacher profile.');
            return false;
        }
    }, [backendUrl, dToken, handleApiError]);

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
            handleApiError(error, 'Failed to add subjects.');
            return false;
        }
    }, [backendUrl, dToken, handleApiError]);

    const removeTeacherSubjects = useCallback(async (subjectToRemove) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/teacher/profile/subjects`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
                data: { subjectToRemove }
            });
            if (data.success) {
                toast.success(data.message || 'Subject removed successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to remove subject.');
                return false;
            }
        } catch (error) {
            handleApiError(error, 'Failed to remove subject.');
            return false;
        }
    }, [backendUrl, dToken, handleApiError]);

    const fetchAttendanceRecords = useCallback(async (startDate, endDate, userType = 'Teacher') => {
        try {
            const startIsoDate = new Date(startDate).toISOString().split('T')[0];
            const endIsoDate = new Date(endDate).toISOString().split('T')[0];

            const response = await axios.get(`${backendUrl}/api/teacher/attendance-all`, {
                params: {
                    startDate: startIsoDate,
                    endDate: endIsoDate,
                    userType,
                },
                headers: { Authorization: `Bearer ${dToken}` },
            });

            if (response.data.success) {
                return response.data.attendance;
            } else {
                toast.error(response.data.message || "Failed to fetch attendance records");
                return [];
            }
        } catch (error) {
            handleApiError(error, 'Error fetching attendance records');
            return [];
        }
    }, [dToken, backendUrl, handleApiError]);

    const fetchStudentsBySchedule = useCallback(async (scheduleId, date = null, startDate = null, endDate = null) => {
        try {
            const params = {};
            if (date) params.date = date;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await axios.get(`${backendUrl}/api/teacher/students/schedule/${scheduleId}`, {
                params,
                headers: { Authorization: `Bearer ${dToken}` },
            });

            if (response.data.success) {
                return response.data;
            } else {
                toast.error(response.data.message || "Failed to fetch students for schedule.");
                return null;
            }
        } catch (error) {
            handleApiError(error, "Error fetching students for schedule.");
            return null;
        }
    }, [backendUrl, dToken, handleApiError]);

    const value = {
        dToken,
        setDToken: updateDToken,
        backendUrl,
        dashData,
        setDashData,
        loginTeacher,
        logoutTeacher,
        updateTeacherByProfile,
        addTeacherSubjects,
        removeTeacherSubjects,
        fetchAttendanceRecords,
        fetchStudentsBySchedule,
    };

    return (
        <TeacherContext.Provider value={value}>
            {props.children}
        </TeacherContext.Provider>
    );
};

export default TeacherContextProvider;