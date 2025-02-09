import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';
import { TeacherContext } from '../context/TeacherContext';

const Login = () => {
  const [state, setState] = useState('Admin'); // Options: 'Admin', 'Teacher'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { aToken, setAToken } = useContext(AdminContext); 
  const { dToken, setDToken } = useContext(TeacherContext); 

  const navigate = useNavigate();

  const roleConfig = {
    Admin: {
      endpoint: '/api/admin/login',
      tokenSetter: setAToken,
      localStorageKey: 'aToken',
      redirectTo: '/admin-dashboard',
    },
    Teacher: {
      endpoint: '/api/teacher/login',
      tokenSetter: setDToken,
      localStorageKey: 'dToken',
      redirectTo: '/teacher-dashboard',
    },
  };

  // Redirect if already logged in
  useEffect(() => {
    if (aToken) {
      navigate('/admin-dashboard');
    } else if (dToken) {
      navigate('/teacher-dashboard');
    }
  }, [aToken, dToken, navigate]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const { endpoint, tokenSetter, localStorageKey, redirectTo } = roleConfig[state];
      const { data } = await axios.post(backendUrl + endpoint, { email, password });

      if (data.success) {
        tokenSetter(data.token); // Set the token in the appropriate context
        localStorage.setItem(localStorageKey, data.token);
        toast.success(`${state} logged in successfully!`);
        navigate(redirectTo); // Navigate to the correct dashboard
      } else {
        toast.error(data.message || 'Invalid credentials.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-customRed">{state}</span> Log In
        </p>
        <div className="w-full">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            aria-label="Select Role"
          >
            <option value="Admin">Admin</option>
            <option value="Teacher">Teacher</option>
          </select>
        </div>
        <div className="w-full">
          <input
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            placeholder="Email"
            required
            aria-label={`${state} Email`}
          />
        </div>
        <div className="w-full">
          <input
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            placeholder="Password"
            required
            aria-label={`${state} Password`}
          />
        </div>
        <button
          className={`bg-customRed text-white w-full py-2 rounded-md text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
          aria-label="Login Button"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  );
};

export default Login;