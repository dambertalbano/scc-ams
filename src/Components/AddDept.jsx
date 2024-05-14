// Frontend: AddDept.js

import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseURL } from '../utils/constant';

const AddDept = () => {
    const [department, setDepartment] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${baseURL}/add_department`, { department })
            .then(result => {
                if (result.data._id) {
                    navigate('/dashboard/department');
                } else {
                    alert(result.data.msg || "Failed to add department");
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="d-flex justify-content-center align-items-center h-75">
            <div className="p-5 rounded w-50 border addDeptTitle">
                <h2>Add Department</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="department">
                            <strong>Department:</strong>
                        </label>
                        <input
                            type="text"
                            name="department"
                            placeholder="Enter Department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="form-control rounded-3 form-control1"
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100">Add Department</button>
                </form>
            </div>
        </div>
    );
};

export default AddDept;
