import axios from 'axios';
import { motion } from "framer-motion"; // Import motion
import { Loader } from "lucide-react";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import UserInfoDisplay from '../../components/rfid/UserInfoDisplay'; // Import the kiosk UserInfoDisplay
import { StudentContext } from '../../context/StudentContext';

// Helper function to get today's date string in YYYY-MM-DD format
const getTodayDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // YYYY-MM-DD
};

// Helper function to find today's sign-in time from attendance data
const getTodaySignInTime = (attendanceData) => {
    if (!attendanceData || !Array.isArray(attendanceData)) return null;
    const todayDateStr = getTodayDateString();
    const todayAttendance = attendanceData.find(entry => entry.date === todayDateStr);
    return todayAttendance?.signInTime ?? null;
};

// Helper function to find today's sign-out time from attendance data
const getTodaySignOutTime = (attendanceData) => {
    if (!attendanceData || !Array.isArray(attendanceData)) return null;
    const todayDateStr = getTodayDateString();
    const todayAttendance = attendanceData.find(entry => entry.date === todayDateStr);
    return todayAttendance?.signOutTime ?? null;
};

const StudentDashboard = () => {
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { sToken, backendUrl } = useContext(StudentContext);

    const fetchStudentInfo = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${backendUrl}/api/student/profile`, {
                headers: {
                    Authorization: `Bearer ${sToken}`,
                },
            });
            if (response.data.success) {
                const profileData = response.data.profileData;
                const displayInfo = {
                    ...profileData,
                    signInTime: getTodaySignInTime(profileData?.attendance),
                    signOutTime: getTodaySignOutTime(profileData?.attendance),
                };
                setStudentInfo(displayInfo);
            } else {
                toast.error(response.data.message);
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [sToken, backendUrl]);

    useEffect(() => {
        fetchStudentInfo();
    }, [fetchStudentInfo]);

    const formatName = (user) => {
        if (!user) return '';
        return `${user?.firstName} ${user?.middleName ? user?.middleName + ' ' : ''}${user?.lastName}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 sm:p-6 md:p-10 text-gray-300" // Kiosk page background and default text color
        >
            <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-2xl w-full"> {/* Kiosk card background, kept max-w-2xl for more content space */}
                <div className="flex items-center justify-center mb-6"> {/* Adjusted margin */}
                    <FiInfo className="w-8 h-8 text-red-500" /> {/* Kiosk accent color for icon */}
                    <h2 className="text-3xl sm:text-4xl font-bold text-white ml-2">Student Information</h2> {/* Kiosk card title text */}
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px]"> {/* Ensured min-height for loading state */}
                        <Loader className="w-12 h-12 text-red-500 animate-spin mr-2 mb-4" /> {/* Kiosk loader style */}
                        <p className="text-xl font-semibold text-gray-200">Loading Profile...</p> {/* Kiosk loading text */}
                    </div>
                ) : error ? (
                    <div className="min-h-[300px] flex flex-col justify-center items-center">
                        <p className="text-red-400 text-center text-lg">{error}</p> {/* Error text style */}
                    </div>
                ) : studentInfo ? (
                    // UserInfoDisplay will inherit text colors from parent or its own dark mode styles
                    <UserInfoDisplay userInfo={studentInfo} formatName={formatName} />
                ) : (
                    <div className="min-h-[300px] flex flex-col justify-center items-center">
                        <p className="text-gray-400">No student information available.</p> {/* "No info" text style */}
                    </div>
                )}
            </div>
            <footer className="mt-8 text-center">
                <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} St. Clare College of Caloocan</p> {/* Kiosk footer text */}
            </footer>
        </motion.div>
    );
};

export default StudentDashboard;