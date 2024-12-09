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
              // Make a GET request to the backend to fetch all students
              const { data } = await axios.get(backendUrl + '/api/admin/all-students', {
                headers: { aToken } // Include the authorization token in the headers
              });
              
              // Check if the request was successful
              if (data.success) {
                setStudents(data.students); // Update the state with the students data
              } else {
                toast.error(data.message); // Show error message if something went wrong
              }
            } catch (error) {
              toast.error(error.message); // Handle any network or other errors
            }
          };

          const getUserByCode = async (code) => {
            try {
              const token = localStorage.getItem('adminToken');
              const response = await axios.get(`/api/user/code/${code}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
        
              if (response.data.success) {
                setUserData(response.data.user);
              } else {
                console.error('User not found');
              }
            } catch (error) {
              console.error('Error fetching user by code:', error);
            }
          };

        const getStudentByCode = async (code) => {
            try {
                // Log for debugging
                console.log('Fetching student with code:', code);
        
                // Use template literals for cleaner string interpolation
                const { data } = await axios.get(`${backendUrl}/api/rfid-scan/${code}`, {
                    headers: { aToken }, // Include authentication token
                });
        
                // Log the response data for debugging
                console.log('API Response:', data);
        
                if (data.success) {
                    return data.student; // Return the student object if successful
                } else {
                    toast.error(data.message); // Show error message if student is not found
                    return null;
                }
            } catch (error) {
                // Log any errors for debugging
                console.error('Error fetching student:', error);
                toast.error(error.message);
                return null;
            }
        };
        
        

        // Getting all Administrators data from Database using API
        const getAllAdministrators = async () => {
            try {
              // Make a GET request to the backend to fetch all administrators
              const { data } = await axios.get(backendUrl + '/api/admin/all-administrators', {
                headers: { aToken } // Include the authorization token in the headers
              });
              
              // Check if the request was successful
              if (data.success) {
                setAdministrators(data.administrators); // Update the state with the administrators data
              } else {
                toast.error(data.message); // Show error message if something went wrong
              }
            } catch (error) {
              toast.error(error.message); // Handle any network or other errors
            }
          };



        const getAllTeachers = async () => {
            try {
              // Make a GET request to the backend to fetch all teachers
              const { data } = await axios.get(backendUrl + '/api/admin/all-teachers', {
                headers: { aToken } // Include the authorization token in the headers
              });
              
              // Check if the request was successful
              if (data.success) {
                setTeachers(data.teachers); // Update the state with the teachers data
              } else {
                toast.error(data.message); // Show error message if something went wrong
              }
            } catch (error) {
              toast.error(error.message); // Handle any network or other errors
            }
          };
          

        // In your AdminContext.js or wherever deleteTeacher is defined
const deleteTeacher = async (teacherId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}`, {
        headers: { aToken },
      });
  
      if (response.data.success) {
        toast.success("Teacher deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete teacher");
      }
    } catch (error) {
      toast.error("Error deleting teacher: " + error.message);
    }
  };
  
  const deleteStudent = async (studentId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/students/${studentId}`, {
        headers: { aToken },
      });
  
      if (response.data.success) {
        toast.success("Student deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete student");
      }
    } catch (error) {
      toast.error("Error deleting student: " + error.message);
    }
  };

  const deleteAdministrator = async (administratorId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/administrators/${administratorId}`, {
        headers: { aToken },
      });
  
      if (response.data.success) {
        toast.success("Administrator deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete administrator");
      }
    } catch (error) {
      toast.error("Error deleting administrator: " + error.message);
    }
  };


  const deleteUtility = async (utilityId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/utilitys/${utilityId}`, {
        headers: { aToken },
      });
  
      if (response.data.success) {
        toast.success("Utility deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete utility");
      }
    } catch (error) {
      toast.error("Error deleting utility: " + error.message);
    }
  };




          
  const getAllUtilitys = async () => {
    try {
      // Make a GET request to the backend to fetch all utilitys
      const { data } = await axios.get(backendUrl + '/api/admin/all-utilitys', {
        headers: { aToken } // Include the authorization token in the headers
      });
      
      // Check if the request was successful
      if (data.success) {
        setUtilitys(data.utilitys); // Update the state with the utilitys data
      } else {
        toast.error(data.message); // Show error message if something went wrong
      }
    } catch (error) {
      toast.error(error.message); // Handle any network or other errors
    }
  };


        

        // Update Administrator data
        const updateAdministrator = async (administrator) => {
            try {
              const response = await axios.put(`${backendUrl}/api/admin/administrators/${administrator._id}`, administrator, {
                headers: { aToken },
              });
          
              if (response.data.success) {
                toast.success("Administrator updated successfully");
                getAllAdministrators(); // Refresh the list of administrators
              } else {
                toast.error(response.data.message || "Failed to update administrator");
              }
            } catch (error) {
              toast.error("Error updating administrator: " + error.message);
            }
          };





        const updateTeacher = async (teacher) => {
            try {
              const response = await axios.put(`${backendUrl}/api/admin/teachers/${teacher._id}`, teacher, {
                headers: { aToken },
              });
          
              if (response.data.success) {
                toast.success("Teacher updated successfully");
                getAllTeachers(); // Refresh the list of teachers
              } else {
                toast.error(response.data.message || "Failed to update teacher");
              }
            } catch (error) {
              toast.error("Error updating teacher: " + error.message);
            }
          };


          const updateStudent = async (student) => {
            try {
              const response = await axios.put(`${backendUrl}/api/admin/students/${student._id}`, student, {
                headers: { aToken },
              });
          
              if (response.data.success) {
                toast.success("Student updated successfully");
                getAllStudents(); // Refresh the list of students
              } else {
                toast.error(response.data.message || "Failed to update student");
              }
            } catch (error) {
              toast.error("Error updating student: " + error.message);
            }
          };

        const updateUtility = async (utility) => {
            try {
              const response = await axios.put(`${backendUrl}/api/admin/utilitys/${utility._id}`, utility, {
                headers: { aToken },
              });
          
              if (response.data.success) {
                toast.success("Utility updated successfully");
                getAllUtilitys(); // Refresh the list of utilitys
              } else {
                toast.error(response.data.message || "Failed to update utility");
              }
            } catch (error) {
              toast.error("Error updating utility: " + error.message);
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
            getStudentByCode,
            getUserByCode,
            deleteTeacher,
            updateStudent,
            deleteStudent,
            deleteAdministrator,
            deleteUtility,

        };

        return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
    };

    export default AdminContextProvider;
