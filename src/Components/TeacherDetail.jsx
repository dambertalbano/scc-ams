import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { baseURL } from '../utils/constant';

const TeacherDetail = () => {
  const [teacher, setTeacher] = useState({});
  const [department, setDepartment] = useState({});
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ID:", id); // Log the id value
    const fetchTeacherData = async () => {
      try {
        if (id) {
          // Fetch teacher details using the correct endpoint
          const teacherResponse = await axios.get(`${baseURL}/teacher/teacher_detail/${id}`);
          console.log('teacherResponse:', teacherResponse.data); // Log teacher response data
          setTeacher(teacherResponse.data);

          // Fetch department details using the correct endpoint
          const departmentResponse = await axios.get(`${baseURL}/department/${teacherResponse.data.department_id}`);
          console.log('Department Response:', departmentResponse.data); // Log department data
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
    fetchTeacherData();
  }, [id]);

  const fetchStudentsByDepartment = async (departmentId) => {
    try {
      // Fetch students with the same department_id
      const studentsResponse = await axios.get(`${baseURL}/teacher/students?department_id=${departmentId}`);
      console.log('Students Response:', studentsResponse.data); // Log students data
      setStudents(studentsResponse.data);
      setShowModal(true); // Show the modal after fetching students
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleLogout = () => {
    // Remove the "valid" item from localStorage
    localStorage.removeItem("valid");

    // Navigate to the home page ("/")
    navigate('/');
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
              <span className="bold-label">Name: </span> {teacher.name}
            </h3>
            <h3>
              <span className="bold-label">Email:</span> {teacher.email}
            </h3>
            <h3>
              <span className="bold-label">Department:</span>{" "}
              {department.department}
            </h3>
            <button className="btn btn-dark mt-xl-2" onClick={() => fetchStudentsByDepartment(teacher.department_id)}>
              Students
            </button>
            <button className="btn btn-dark mt-xl-2" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Modal for displaying students */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {students.length > 0 ? (
            <ul>
              {students.map((student) => (
                <li key={student._id}>{student.name} ({student.email})</li>
              ))}
            </ul>
          ) : (
            <p>No students found for this department.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeacherDetail;
