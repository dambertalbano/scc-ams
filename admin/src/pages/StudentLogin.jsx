import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgSolid from '../assets/bg-solid.png';
import { StudentContext } from '../context/StudentContext';

const StudentLogin = () => {
    useEffect(() => {
        document.title = 'Student Login - SCC AMS';
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const { setSToken } = useContext(StudentContext);

    const navigate = useNavigate();

    const roleConfig = {
        Student: {
            endpoint: '/api/student/login',
            tokenSetter: setSToken,
            localStorageKey: 'sToken',
            redirectTo: '/student-dashboard',
        },
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { endpoint, tokenSetter, localStorageKey, redirectTo } = roleConfig["Student"];

            const url = backendUrl.endsWith('/')
                ? `${backendUrl}${endpoint.substring(1)}`
                : `${backendUrl}${endpoint}`;

            const { data } = await axios.post(url, { email, password });

            if (data.success) {
                tokenSetter(data.token);
                localStorage.setItem(localStorageKey, data.token);
                navigate(redirectTo);
            } else {
                setError("Invalid email or password.");
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setError("Invalid email or password. Please try again.");
            } else if (error.response?.status === 404) {
                setError("User not found. Please check your email.");
            } else {
                setError("Login failed. Please try again later.");
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${bgSolid})` }}>
            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                onSubmit={onSubmitHandler}
                className="w-full max-w-2xl p-14 bg-white rounded-2xl shadow-2xl"
            >
                <div className="flex flex-col gap-6">
                    <p className="text-4xl font-bold m-auto text-gray-800">
                        Welcome <span className="text-customRed">Student</span>!
                    </p>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="w-full">
                        <label htmlFor="email" className="block text-md font-medium text-gray-700">E-mail</label>
                        <input
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:ring-customRed focus:border-customRed text-gray-800 focus:ring-2 focus:ring-customRed"
                            type="email"
                            placeholder="Enter your email"
                            required
                            aria-label="Student Email"
                        />
                    </div>
                    <div className="w-full relative">
                        <label htmlFor="password" className="block text-md font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:ring-customRed focus:border-customRed text-gray-800 focus:ring-2 focus:ring-customRed"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                required
                                aria-label="Student Password"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        className={`bg-customRed hover:text-navbar hover:bg-red-800 text-white w-full py-3 rounded-md text-base transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-2px] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                        aria-label="Login Button"
                    >
                        {loading ? 'Sign In' : 'Login'}
                    </button>
                </div>
            </motion.form>
        </div>
    );
};

export default StudentLogin;