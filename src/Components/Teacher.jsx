import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { baseURL } from "../utils/constant";

const Teacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersResult, departmentsResult] = await Promise.all([
          axios.get(`${baseURL}/teacher/teacher`),
          axios.get(`${baseURL}/department`)
        ]);
        setTeachers(teachersResult.data);
        setDepartments(departmentsResult.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseURL}/teacher/${id}`);
      setTeachers(teachers.filter((teacher) => teacher._id !== id));
    } catch (error) {
      console.error("Failed to delete teacher:", error);
      alert("Failed to delete teacher");
    }
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find((dep) => dep._id === departmentId);
    return department ? department.department : "Unknown";
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>Teacher List</h3>
      </div>
      <Link to="/dashboard/add_teacher" className="btn btn-success">
        Add Teacher
      </Link>
      <div className="mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
                <td>{getDepartmentName(teacher.department_id)}</td>
                <td>
                  <Link
                    to={`/dashboard/edit_teacher/${teacher._id}`}
                    className="btn btn-info btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleDelete(teacher._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teacher;

