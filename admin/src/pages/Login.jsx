import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';
import { StudentContext } from '../context/StudentContext';

const Login = () => {
  const [state, setState] = useState('Admin'); // Options: 'Admin', 'Administrator', 'Student'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { setDToken } = useContext(StudentContext);
  const { setAToken } = useContext(AdminContext);
  const navigate = useNavigate(); // Initialize navigate function

  // Role configuration
  const roleConfig = {
    Admin: {
      endpoint: '/api/admin/login',
      tokenSetter: setAToken,
      localStorageKey: 'aToken',
      redirectTo: '/admin-dashboard', // Add redirect path for Admin
    },
    Student: {
      endpoint: '/api/student/login',
      tokenSetter: setDToken,
      localStorageKey: 'dToken',
      redirectTo: '/student-dashboard', // Add redirect path for Student
    },
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const { endpoint, tokenSetter, localStorageKey, redirectTo } = roleConfig[state];
      const { data } = await axios.post(backendUrl + endpoint, { email, password });

      if (data.success) {
        tokenSetter(data.token);
        localStorage.setItem(localStorageKey, data.token);
        toast.success(`${state} logged in successfully!`);
        navigate(redirectTo); // Navigate to the appropriate page after successful login
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
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
            aria-label={`${state} Email`}
          />
        </div>
        <div className="w-full">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            required
            aria-label={`${state} Password`}
          />
        </div>
        <button
          className={`bg-primary text-white w-full py-2 rounded-md text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
          aria-label="Login Button"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="w-full text-center mt-3">
          {state === 'Admin' ? (
            <p>
              Student Login?{' '}
              <span
                onClick={() => setState('Student')}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>{' '}
            </p>
          ) : (
            <p>
              Admin Login?{' '}
              <span
                onClick={() => setState('Admin')}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>{' '}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default Login;
