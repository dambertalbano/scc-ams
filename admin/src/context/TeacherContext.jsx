import axios from 'axios';
import { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const TeacherContext = createContext();

const TeacherContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Ensure dToken initializes properly from localStorage
    const [dToken, setDToken] = useState(() => localStorage.getItem('dToken') || null);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [profileData, setProfileData] = useState(null);

    // Function to update the token and sync it with local storage
    const updateDToken = (token) => {
        setDToken(token);
        if (token) {
            localStorage.setItem('dToken', token); // Save token to local storage
        } else {
            localStorage.removeItem('dToken'); // Remove token from local storage
        }
    };

    // Handle session expiration or unauthorized access
    const handleUnauthorized = () => {
        toast.error('Session expired. Please log in again.');
        updateDToken(null); // Clear token when unauthorized
    };

    // Fetch appointments for the teacher
    const getAppointments = async () => {
        if (!dToken) return handleUnauthorized();
        try {
            const { data } = await axios.get(`${backendUrl}/api/teacher/appointments`, {
                headers: { Authorization: `Bearer ${dToken}` }, // Use Authorization header
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
    };

    // Fetch teacher profile data
    const getProfileData = async () => {
        if (!dToken) return handleUnauthorized();
        try {
            const { data } = await axios.get(`${backendUrl}/api/teacher/profile`, {
                headers: { Authorization: `Bearer ${dToken}` }, // Use Authorization header
            });
            setProfileData(data.profileData);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error fetching profile data.');
        }
    };

    const value = {
        dToken,
        setDToken: updateDToken,
        backendUrl,
        appointments,
        getAppointments,
        dashData,
        setDashData,
        profileData,
        setProfileData,
        getProfileData,
    };

    return (
        <TeacherContext.Provider value={value}>
            {props.children}
        </TeacherContext.Provider>
    );
};

export default TeacherContextProvider;
