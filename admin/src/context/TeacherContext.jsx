import axios from 'axios';
import { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const TeacherContext = createContext();

const TeacherContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(() => localStorage.getItem('dToken') || null);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);

  const updateDToken = (token) => {
    setDToken(token);
    if (token) {
      localStorage.setItem('dToken', token);
    } else {
      localStorage.removeItem('dToken');
    }
  };

  const handleUnauthorized = () => {
    toast.error('Session expired. Please log in again.');
    updateDToken(null);
  };

  const getAppointments = async () => {
    if (!dToken) return handleUnauthorized();
    try {
      const { data } = await axios.get(`${backendUrl}/api/teacher/appointments`, {
        headers: { Authorization: `Bearer ${dToken}` },
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

  return (
    <TeacherContext.Provider
      value={{
        dToken,
        setDToken: updateDToken,
        backendUrl,
        appointments,
        getAppointments,
        dashData,
        setDashData,
      }}
    >
      {props.children}
    </TeacherContext.Provider>
  );
};

export default TeacherContextProvider;