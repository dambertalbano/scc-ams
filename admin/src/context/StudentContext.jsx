import axios from 'axios';
import { createContext, useCallback, useState } from "react";
import { toast } from 'react-toastify';

export const StudentContext = createContext();

const StudentContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [sToken, setSToken] = useState(() => localStorage.getItem('sToken') || null);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]); // Add attendanceRecords state

    // Helper function to check for token and display error
    const checkToken = () => {
        if (!sToken) {
            toast.error('Not authenticated. Please log in.');
            return true;
        }
        return false;
    };

    // Update token in local storage
    const setToken = useCallback((token) => {
        setSToken(token);
        console.log('Setting token in context:', token); // Add this line
        if (token) {
            localStorage.setItem('sToken', token);
        } else {
            localStorage.removeItem('sToken');
        }
    }, [setSToken]);

    // Getting Student dashboard data using API
    const getDashData = useCallback(async () => {
        if (checkToken()) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/student/dashboard`, {
                headers: { Authorization: `Bearer ${sToken}` }
            });

            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error fetching dashboard data.');
        }
    }, [backendUrl, sToken, setDashData, checkToken]);

    // Getting Student appointment data from Database using API
    const getAppointments = useCallback(async () => {
        if (checkToken()) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/student/appointments`, {
                headers: { Authorization: `Bearer ${sToken}` }
            });

            if (data.success) {
                setAppointments(data.appointments.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error fetching appointments.');
        }
    }, [backendUrl, sToken, setAppointments, checkToken]);

    // Getting Student profile data from Database using API
    const getProfileData = useCallback(async () => {
        if (checkToken()) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/student/profile`, {
                headers: { Authorization: `Bearer ${sToken}` }
            });
            setProfileData(data.profileData);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error fetching profile data.');
        }
    }, [backendUrl, sToken, setProfileData, checkToken]);

    // Function to cancel student appointment using API
    const cancelAppointment = useCallback(async (appointmentId) => {
        if (checkToken()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/student/cancel-appointment`, { appointmentId }, {
                headers: { Authorization: `Bearer ${sToken}` }
            });

            if (data.success) {
                toast.success(data.message);
                getAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error cancelling appointment.');
        }
    }, [backendUrl, sToken, getAppointments, getDashData, checkToken]);

    // Function to Mark appointment completed using API
    const completeAppointment = useCallback(async (appointmentId) => {
        if (checkToken()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/student/complete-appointment`, { appointmentId }, {
                headers: { Authorization: `Bearer ${sToken}` }
            });

            if (data.success) {
                toast.success(data.message);
                getAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error completing appointment.');
        }
    }, [backendUrl, sToken, getAppointments, getDashData, checkToken]);

    const loginStudent = useCallback(async (email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/student/login`, { email, password });
            if (data.success) {
                setToken(data.token);
                toast.success('Login successful!');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Failed to login.');
            return false;
        }
    }, [backendUrl, setToken]);

    const updateStudentProfile = useCallback(async (profileData) => {
        if (checkToken()) return;
        try {
            const { data } = await axios.put(`${backendUrl}/api/student/update-profile`, profileData, {
                headers: { Authorization: `Bearer ${sToken}` }
            });
            if (data.success) {
                toast.success(data.message);
                getProfileData();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile.');
            return false;
        }
    }, [backendUrl, sToken, getProfileData, checkToken]);

    const getStudentsByStudent = useCallback(async (studentId) => {
        if (checkToken()) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/student/related-students/${studentId}`, {
                headers: { Authorization: `Bearer ${sToken}` }
            });
            if (data.success) {
                setStudents(data.students);
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error('Error getting students by student:', error);
            toast.error(error.response?.data?.message || 'Failed to get students.');
            return false;
        }
    }, [backendUrl, sToken, setStudents, checkToken]);

    // New function to get student attendance records
    const getStudentAttendance = useCallback(async () => {
        if (checkToken()) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/student/attendance`, {
                headers: { Authorization: `Bearer ${sToken}` }
            });
            if (data.success) {
                setAttendanceRecords(data.attendance);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error getting student attendance:', error);
            toast.error(error.response?.data?.message || 'Failed to get attendance.');
        }
    }, [backendUrl, sToken, checkToken]);

    const value = {
        sToken,
        setSToken: setToken,
        backendUrl,
        appointments,
        getAppointments,
        cancelAppointment,
        completeAppointment,
        dashData,
        getDashData,
        profileData,
        getProfileData,
        loginStudent,
        updateStudentProfile,
        students,
        getStudentsByStudent,
        attendanceRecords, // Add attendanceRecords to the context value
        getStudentAttendance, // Add getStudentAttendance to the context value
    };

    return (
        <StudentContext.Provider value={value}>
            {props.children}
        </StudentContext.Provider>
    );
};

export default StudentContextProvider;