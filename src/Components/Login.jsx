    import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseURL } from "../utils/constant";
import './style.css';

    const AdminLogin = () => {
    const [values, setValues] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
        const result = await axios.post(`${baseURL}/admin/adminlogin`, values);
        if (result.data.loginStatus) {
            localStorage.setItem('valid', true);
            navigate('/dashboard');
        } else {
            setError(result.data.error);
        }
        } catch (err) {
        console.error(err);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
        <div className="loginForm">
            <div className="text-warning">{error && error}</div>
            <h2 className="loginpage">Log In</h2>
            <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="email">
                <strong>Email</strong>
                </label>
                <input
                type="email"
                name="email"
                autoComplete="off"
                placeholder="Enter Email"
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                className="form-control rounded-3"
                />
            </div>
            <div className="mb-3">
                <label htmlFor="password">
                <strong>Password</strong>
                </label>
                <input
                type="password"
                name="password"
                placeholder="Enter Password"
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                className="form-control rounded-3"
                />
            </div>
            <button type="submit" className="btn btn-custom">
                Log in
            </button>
            </form>
        </div>
        </div>
    );
    };

    export default AdminLogin;
