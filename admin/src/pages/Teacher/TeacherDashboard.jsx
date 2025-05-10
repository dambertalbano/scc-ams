import axios from 'axios';
import { format } from 'date-fns';
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import UserInfoDisplay from '../../components/rfid/UserInfoDisplay'; // Import the shared UserInfoDisplay
import { TeacherContext } from '../../context/TeacherContext';

const TeacherDashboard = () => {
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const { dToken, backendUrl } = useContext(TeacherContext);

    const fetchTeacherInfoAndTodaysAttendance = useCallback(async () => {
        setError(null);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const response = await axios.get(`${backendUrl}/api/teacher/profile?date=${today}`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (response.data.success) {
                setTeacherInfo(response.data.profileData);
            } else {
                toast.error(response.data.message || "Failed to fetch teacher information.");
                setError(response.data.message || "Failed to fetch teacher information.");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "An error occurred.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [dToken, backendUrl]);

    useEffect(() => {
        fetchTeacherInfoAndTodaysAttendance();
    }, [fetchTeacherInfoAndTodaysAttendance]);

    const prepareLastScan = (todaysAttendance) => {
        if (!todaysAttendance) return null;

        const { signInTime, signOutTime } = todaysAttendance;

        if (signOutTime) {
            return { timestamp: signOutTime, eventType: 'sign-out' };
        }
        if (signInTime) {
            return { timestamp: signInTime, eventType: 'sign-in' };
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 sm:p-6 md:p-10 text-gray-300" 
        >
            <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-2xl w-full"> 
                <div className="flex items-center justify-center mb-6">
                    <FiInfo className="w-8 h-8 text-red-500" /> 
                    <h2 className="text-3xl sm:text-4xl font-bold text-white ml-2">Teacher Information</h2> 
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px]"> 
                        <Loader className="w-12 h-12 text-red-500 animate-spin mr-2 mb-4" /> 
                        <p className="text-xl font-semibold text-gray-200">Loading Information...</p> 
                    </div>
                ) : error ? (
                    <div className="min-h-[300px] flex flex-col justify-center items-center">
                        <p className="text-red-400 text-center text-lg">{error}</p> 
                    </div>
                ) : teacherInfo ? (
                    <UserInfoDisplay 
                        userInfo={teacherInfo} 
                        lastScan={prepareLastScan(teacherInfo.todaysAttendance)}
                    />
                ) : (
                    <div className="min-h-[300px] flex flex-col justify-center items-center">
                        <p className="text-gray-400">No teacher information available.</p> 
                    </div>
                )}
            </div>
            <footer className="mt-8 text-center">
                <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} St. Clare College of Caloocan</p> 
            </footer>
        </motion.div>
    );
};

export default TeacherDashboard;