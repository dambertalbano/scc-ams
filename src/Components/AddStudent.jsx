import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from '../utils/constant';

const AddStudent = () => {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "", // Assuming department_id is a string
  });
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch departments when the component mounts
    axios.get(`${baseURL}/department`)
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
    // Send a POST request to add a student
    axios.post(`${baseURL}/student`, student) // Assuming '/student' is the endpoint for adding a student
      .then((response) => {
        const { data } = response;
        if (data) {
          navigate("/dashboard/student");
        } else {
          alert("Failed to add student");
        }
      })
      .catch((error) => console.log(error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  return (
    <div className="d-flex justify-content-center align-items-center studentForm">
      <div className="p-3 rounded w-50 border">
        <h3 className="text-center addStudenttitle">Add Student</h3>
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="inputName" className="form-label-stud">
              Name
            </label>
            <input
              type="text"
              className="form-control rounded-3"
              id="inputName"
              name="name"
              placeholder="Enter Name"
              value={student.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputEmail4" className="form-label-stud">
              Email
            </label>
            <input
              type="email"
              className="form-control rounded-3"
              id="inputEmail4"
              name="email"
              placeholder="Enter Email"
              autoComplete="off"
              value={student.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputPassword4" className="form-label-stud">
              Password
            </label>
            <input
              type="password"
              className="form-control rounded-3"
              id="inputPassword4"
              name="password"
              placeholder="Enter Password"
              value={student.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12">
            <label htmlFor="department" className="form-label-stud">
              Department
            </label>
            <select
              name="department_id"
              id="department"
              className="form-select"
              value={student.department_id}
              onChange={handleInputChange}
            >
              <option value="">Select Department</option>
              {departments.map((deparment) => (
                <option key={deparment._id} value={deparment._id}>
                  {deparment.department}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-dark w-100">
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;



