import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../utils/constant";

const TeacherRegister = () => {
  const [teacher, setTeacher] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "", // Assuming department_id is a string
  });
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch departments when the component mounts
    axios
      .get(`${baseURL}/department`)
      .then((response) => {
        const { data } = response;
        if (data) {
          setDepartments(data);
        } else {
          alert("Failed to fetch departments");
        }
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send a POST request to add a teacher
    axios
      .post(`${baseURL}/teacher`, teacher) // Assuming '/teacher' is the endpoint for adding a teacher
      .then((response) => {
        const { data } = response;
        if (data) {
          navigate("/teacher_login");
        } else {
          alert("Failed to add teacher");
        }
      })
      .catch((error) => console.log(error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeacher({ ...teacher, [name]: value });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="loginForm">
        <h3 className="title">Register As Teacher</h3>
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="inputName" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control rounded-3"
              id="inputName"
              name="name"
              placeholder="Enter Name"
              value={teacher.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputEmail4" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control rounded-3"
              id="inputEmail4"
              name="email"
              placeholder="Enter Email"
              autoComplete="off"
              value={teacher.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputPassword4" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control rounded-3"
              id="inputPassword4"
              name="password"
              placeholder="Enter Password"
              value={teacher.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12">
            <label htmlFor="department" className="form-label">
              Department
            </label>
            <select
              name="department_id"
              id="department"
              className="form-select"
              value={teacher.department_id}
              onChange={handleInputChange}>
              <option value="">Select Department</option>
              {departments.map(
                (
                  department
                ) => (
                  <option key={department._id} value={department._id}>
                    {department.department}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-custom1">
              Add Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherRegister;


