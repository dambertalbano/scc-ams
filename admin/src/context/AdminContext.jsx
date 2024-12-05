import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

    export const AdminContext = createContext();

    const AdminContextProvider = (props) => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const initialAToken = localStorage.getItem('aToken') || '';
        const [aToken, setAToken] = useState(initialAToken);
        const [appointments, setAppointments] = useState([]);
        const [students, setStudents] = useState([]);
        const [administrators, setAdministrators] = useState([]);
        const [teachers, setTeachers] = useState([]);
        const [utilitys, setUtilitys] = useState([]);
        const [dashData, setDashData] = useState(false);

        // Getting all Students data from Database using API
        const getAllStudents = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/admin/all-students', { headers: { aToken } });
                if (data.success) {
                    setStudents(data.students);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        // Getting all Administrators data from Database using API
        const getAllAdministrators = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/admin/all-administrators', { headers: { aToken } });
                if (data.success) {
                    setAdministrators(data.administrators);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        const getAllTeachers = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/admin/all-teachers', { headers: { aToken } });
                if (data.success) {
                    setTeachers(data.teachers);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        const getAllUtilitys = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/admin/all-utilitys`, { headers: { aToken } });
                if (data.success) {
                    setUtilitys(data.utilitys);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };
        

        // Update Administrator data
        const updateAdministrator = async (adminData) => {
            try {
                const { data } = await axios.put(backendUrl + `/api/admin/update-administrator/${adminData.id}`, adminData, {
                    headers: { aToken },
                });
                if (data.success) {
                    toast.success(data.message);
                    getAllAdministrators(); // Refresh the list of administrators after the update
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        const updateTeacher = async (teacherData) => {
            try {
                // Validate teacherData and token
                if (!teacherData.id) {
                    return toast.error("Teacher ID is missing!");
                }
                if (!aToken) {
                    return toast.error("Authorization token is missing!");
                }
        
                // Make the API call
                const { data } = await axios.put(
                    `${backendUrl}/api/admin/update-teacher/${teacherData.id}`,
                    teacherData,
                    {
                        headers: { Authorization: `Bearer ${aToken}` },
                    }
                );
        
                // Handle API response
                if (data.success) {
                    toast.success(data.message || "Teacher updated successfully.");
                    getAllTeachers(); // Refresh the teachers list
                } else {
                    toast.error(data.message || "Failed to update teacher.");
                }
            } catch (error) {
                // Handle Axios errors
                const errorMessage = error.response?.data?.message || error.message || "An error occurred.";
                toast.error(errorMessage);
            }
        };
        

        const updateUtility = async (utilityData) => {
            try {
                const { data } = await axios.put(`${backendUrl}/api/admin/update-utility/${utilityData.id}`, utilityData, {
                    headers: { aToken },
                });
                if (data.success) {
                    toast.success(data.message);
                    getAllUtilitys();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        // Function to change student availability using API
        const changeAvailability = async (docId) => {
            try {
                const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } });
                if (data.success) {
                    toast.success(data.message);
                    getAllStudents();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        };

        // Getting all appointment data from Database using API
        const getAllAppointments = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } });
                if (data.success) {
                    setAppointments(data.appointments.reverse());
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
                console.log(error);
            }
        };

        // Function to cancel appointment using API
        const cancelAppointment = async (appointmentId) => {
            try {
                const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } });
                if (data.success) {
                    toast.success(data.message);
                    getAllAppointments();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
                console.log(error);
            }
        };

        // Getting Admin Dashboard data from Database using API
        const getDashData = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } });
                console.log(data);  // Log the full response to verify the structure
                if (data.success) {
                    setDashData(data.dashData);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        };
        

        const value = {
            aToken,
            setAToken,
            students,
            administrators,
            teachers,
            utilitys,
            getAllUtilitys,
            updateUtility,
            getAllStudents,
            changeAvailability,
            appointments,
            getAllAppointments,
            getDashData,
            cancelAppointment,
            dashData,
            getAllAdministrators,
            updateAdministrator,
            updateTeacher,
            getAllTeachers,

        };

        return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
    };

    export default AdminContextProvider;
