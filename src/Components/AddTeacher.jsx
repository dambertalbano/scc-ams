import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from '../utils/constant';

const AddTeacher = () => {
  const [teacher, setTeacher] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "", // Assuming department_id is a string
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch departments when the component mounts
    setLoading(true);
    axios.get(`${baseURL}/department`)
      .then((response) => {
        const { data } = response;
        setDepartments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch departments:", error);
        setError("Failed to fetch departments. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Send a POST request to add a teacher
    axios.post(`${baseURL}/teacher`, teacher)// Use the '/teacher' endpoint defined in code1
      .then((response) => {
        const { data } = response;
        setLoading(false);
        if (data) {
          navigate("/dashboard/teacher");
        } else {
          setError("Failed to add teacher. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Failed to add teacher:", error);
        setError("Failed to add teacher. Please try again later.");
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeacher({ ...teacher, [name]: value });
  };

  return (
    <div className="d-flex justify-content-center align-items-center teacherForm">
      <div className="p-3 rounded w-50 border">
        <h3 className="text-center addTeachertitle">Add Teacher</h3>
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
              value={teacher.name}
              onChange={handleInputChange}
              required // Add validation
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
              value={teacher.email}
              onChange={handleInputChange}
              required // Add validation
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
              value={teacher.password}
              onChange={handleInputChange}
              required // Add validation
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
              value={teacher.department_id}
              onChange={handleInputChange}
              required // Add validation
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.department}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-dark w-100" disabled={loading}>
              {loading ? "Adding Teacher..." : "Add Teacher"}
            </button>
          </div>
          {error && <div className="text-danger">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddTeacher;
