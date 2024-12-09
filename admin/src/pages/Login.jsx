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
          <span className="text-customRed">{state}</span> Log In
        </p>
        <div className="w-full">
          <input
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            placeholder='Email'
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
            placeholder='Password'
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
