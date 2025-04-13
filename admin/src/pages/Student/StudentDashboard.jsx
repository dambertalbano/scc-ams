import axios from 'axios';
import { Loader } from "lucide-react";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { StudentContext } from '../../context/StudentContext';

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
                setStudentInfo(response.data.profileData);
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
        <div className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-2xl w-full">
                <div className="flex items-center justify-center mb-4 text-customRed">
                    {!loading && (
                        <div className="flex items-center justify-center mb-4 text-customRed">
                            <FiInfo className="w-8 h-8" />
                            <h2 className="text-3xl font-bold ml-2">Student Information</h2>
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <Loader className="w-5 h-5 text-customRed animate-spin mr-2" />
                        <span className="text-customRed">Scanning ...</span>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : studentInfo ? (
                    <UserInfoDisplay userInfo={studentInfo} formatName={formatName} />
                ) : (
                    <p>No student information available.</p>
                )}
            </div>
        </div>
    );
};

const UserInfoDisplay = ({ userInfo, formatName }) => {
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'No Data';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid Date';
        }
    };

    const today = new Date();
    const todayDateString = today.toLocaleDateString('en-CA'); // YYYY-MM-DD

    const getTodaySignInTime = (attendanceData) => {
        if (!attendanceData || !Array.isArray(attendanceData)) return null;
        const todayAttendance = attendanceData.find(entry => entry.date === todayDateString);
        return todayAttendance?.signInTime ?? null;
    };

    const getTodaySignOutTime = (attendanceData) => {
        if (!attendanceData || !Array.isArray(attendanceData)) return null;
        const todayAttendance = attendanceData.find(entry => entry.date === todayDateString);
        return todayAttendance?.signOutTime ?? null;
    };

    const todaySignInTime = getTodaySignInTime(userInfo?.attendance);
    const todaySignOutTime = getTodaySignOutTime(userInfo?.attendance);

    return (
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden w-full">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 px-6 py-6 bg-gradient-to-br from-red-50 to-white">
                <img
                    src={userInfo?.image || 'https://via.placeholder.com/150'}
                    alt="Student"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border object-cover shadow-md"
                />
                <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-gray-800">{formatName(userInfo)}</h3>
                    <p className="text-sm text-gray-500">{userInfo?.email}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-4 text-gray-700 border-t">
                <p><strong>Email:</strong> {userInfo?.email}</p>
                <p><strong>Address:</strong> {userInfo?.address}</p>
                <p><strong>Contact Number:</strong> {userInfo?.number}</p>
                {userInfo?.position && <p><strong>Position:</strong> {userInfo?.position}</p>}
                {userInfo?.educationLevel && <p><strong>Education Level:</strong> {userInfo?.educationLevel}</p>}
                {userInfo?.subjects && <p><strong>Subjects:</strong> {userInfo?.subjects}</p>}
            </div>

            {/* Sign-in/out Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t bg-gray-50">
                <p className="text-green-600 font-medium">
                    <strong>Sign In Time:</strong> {formatDateTime(todaySignInTime)}
                </p>
                {todaySignOutTime ? (
                    <p className="text-red-500 font-medium mt-2 sm:mt-0">
                        <strong>Sign Out Time:</strong> {formatDateTime(todaySignOutTime)}
                    </p>
                ) : (
                    <p className="text-red-600 font-medium mt-2 sm:mt-0">
                        <strong>Sign Out Time:</strong> Not yet signed out
                    </p>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;