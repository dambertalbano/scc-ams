import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { baseURL } from '../utils/constant';

const StudentDetail = () => {
  const [student, setStudent] = useState({});
  const [department, setDepartment] = useState({});
  const { id } = useParams(); // Correctly extract id from URL params
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ID:", id); // Log the id value
    const fetchStudentData = async () => {
      try {
        if (id) {
          // Fetch student details using the correct endpoint
          const studentResponse = await axios.get(`${baseURL}/student/student_detail/${id}`);
          setStudent(studentResponse.data);
  
          // Fetch department details using the correct endpoint
          const departmentResponse = await axios.get(`${baseURL}/department/${studentResponse.data.department_id}`);
          console.log("Department Response:", departmentResponse.data); // Log department data
          if (departmentResponse.data) {
            setDepartment(departmentResponse.data);
          } else {
            alert("Failed to fetch department");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchStudentData();
  }, [id]); // Add id to the dependency array
  

  const handleLogout = () => {
    // Remove the "valid" item from localStorage
    localStorage.removeItem("valid");

    // Navigate to the home page ("/")
    navigate('/');
  };


  return (
    <div className="vh-100 vw-100 loginPage">
      <div className="p-3 d-flex justify-content-center shadow bg-light p-2 text-black bg-opacity-75">
        <h4 className="deetzTitle">SCC Attendance Management System</h4>
      </div>
      <div className="d-flex justify-content-center align-items-center h-10 mt-xl-1">
        <div className="p-1 pb-1 rounded w-50 h-25 border bg-light p-2 text-black bg-opacity-75 detail">
          <div className="d-flex align-items-flex-center flex-column mt-2">
            <h3>
              <span className="bold-label">Name: </span> {student.name}
            </h3>
            <h3>
              <span className="bold-label">Email:</span> {student.email}
            </h3>
            <h3>
              <span className="bold-label">Department:</span>{" "}
              {department.department}
            </h3>
            <button className="btn btn-dark mt-xl-5" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
