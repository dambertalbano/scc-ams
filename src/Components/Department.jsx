import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { baseURL } from '../utils/constant';

const Department = ({ updateUI }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, [updateUI]);

  const fetchDepartments = () => {
    setLoading(true);
    axios.get(`${baseURL}/department`)
      .then((res) => {
        setDepartments(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        setError("Failed to fetch departments. Please try again later.");
        setLoading(false);
      });
  };

  const deleteDepartment = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this department?");
    if (!confirmDelete) return;

    axios.delete(`${baseURL}/delete/${id}`)
      .then((res) => {
        console.log(res);
        fetchDepartments(); // Re-fetch departments after successful deletion
      })
      .catch((error) => {
        console.error("Error deleting department:", error);
        setError("Failed to delete department. Please try again later.");
      });
  };

  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>Department List</h3>
      </div>
      <Link to="/dashboard/add_department" className="btn btn-custom3">
        Add Department
      </Link>
      <div className="mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>Departments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="2">{error}</td>
              </tr>
            ) : (
              departments.map((department) => (
                <tr key={department._id}>
                  <td>{department.department}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => deleteDepartment(department._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default Department;
