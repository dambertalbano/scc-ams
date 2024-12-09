import axios from 'axios';
import { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const AdministratorContext = createContext();

const AdministratorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Ensure bToken initializes properly from localStorage
    const [bToken, setBToken] = useState(() => localStorage.getItem('bToken') || null);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [profileData, setProfileData] = useState(null);

    // Function to update the token and sync it with local storage
    const updateBToken = (token) => {
        setBToken(token);
        if (token) {
            localStorage.setItem('bToken', token); // Save token to local storage
        } else {
            localStorage.removeItem('bToken'); // Remove token from local storage
        }
    };

    // Handle session expiration or unauthorized access
    const handleUnauthorized = () => {
        toast.error('Session expired. Please log in again.');
        updateBToken(null); // Clear token when unauthorized
    };

    // Fetch appointments for the administrator
    const getAppointments = async () => {
        if (!bToken) return handleUnauthorized();
        try {
            const { data } = await axios.get(`${backendUrl}/api/administrator/appointments`, {
                headers: { Authorization: `Bearer ${bToken}` }, // Use Authorization header
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

    // Fetch administrator profile data
    const getProfileData = async () => {
        if (!bToken) return handleUnauthorized();
        try {
            const { data } = await axios.get(`${backendUrl}/api/administrator/profile`, {
                headers: { Authorization: `Bearer ${bToken}` }, // Use Authorization header
            });
            setProfileData(data.profileData);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error fetching profile data.');
        }
    };

    const value = {
        bToken,
        setBToken: updateBToken,
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
        <AdministratorContext.Provider value={value}>
            {props.children}
        </AdministratorContext.Provider>
    );
};

export default AdministratorContextProvider;
