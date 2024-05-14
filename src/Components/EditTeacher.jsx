import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { baseURL } from "../utils/constant";

const EditTeacher = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState({
    name: "",
    email: "",
    department_id: "",
  });
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ID:", id); // Log the id value
    const fetchTeacherData = async () => {
      try {
        if (id) {
          // Fetch teacher details using the correct endpoint
          const teacherResponse = await axios.get(
            `${baseURL}/teacher/teacher_detail/${id}`
          );
          setTeacher(teacherResponse.data);

          // Fetch departments using the correct endpoint
          const departmentsResponse = await axios.get(
            `${baseURL}/department`
          );
          console.log("Departments Response:", departmentsResponse.data); // Log department data
          setDepartments(departmentsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchTeacherData();
  }, [id]); // Add id to the dependency array

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${baseURL}/teacher/edit_teacher/${id}`, teacher);
      if (response.data.Status) {
        navigate("/dashboard/teacher");
      } else {
        alert(response.data.Error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeacher({ ...teacher, [name]: value });
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border">
        <h3 className="text-center">Edit Teacher</h3>
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="inputName" className="form-label-stud">
              Name
            </label>
            <input
              type="text"
              className="form-control rounded-3"
              id="inputName"
              placeholder="Enter Name"
              value={teacher.name}
              onChange={(e) => setTeacher({ ...teacher, name: e.target.value })}
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
              placeholder="Enter Email"
              autoComplete="off"
              value={teacher.email}
              onChange={(e) =>
                setTeacher({ ...teacher, email: e.target.value })
              }
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
            <button type="submit" className="btn btn-primary w-100">
              Edit Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeacher;


