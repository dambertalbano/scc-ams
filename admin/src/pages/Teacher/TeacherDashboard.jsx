import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns for formatting
import { Loader } from "lucide-react";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherDashboard = () => {
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { dToken, backendUrl } = useContext(TeacherContext);

    const fetchTeacherInfoAndTodaysAttendance = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const today = format(new Date(), 'yyyy-MM-dd'); // Get today's date in YYYY-MM-DD format
            const response = await axios.get(`${backendUrl}/api/teacher/profile?date=${today}`, { // Append date to API call
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (response.data.success) {
                // Assuming profileData now includes signInTime and signOutTime for today if available
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

    const formatName = (user) => {
        if (!user) return '';
        return `${user?.firstName} ${user?.middleName ? user?.middleName + ' ' : ''}${user?.lastName}`;
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-2xl w-full">
                <div className="flex items-center justify-center mb-6 text-customRed">
                    {!loading && (
                        <div className="flex items-center justify-center text-customRed">
                            <FiInfo className="w-8 h-8" />
                            <h2 className="text-3xl font-bold ml-2">Teacher Information</h2>
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <Loader className="w-5 h-5 text-customRed animate-spin mr-2" />
                        <span className="text-customRed">Loading Information...</span>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : teacherInfo ? (
                    <UserInfoDisplay userInfo={teacherInfo} formatName={formatName} />
                ) : (
                    <p>No teacher information available.</p>
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
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid Date';
        }
    };

    return (
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden w-full">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 px-6 py-6 bg-gradient-to-br from-red-50 to-white">
                <img
                    src={userInfo?.image || 'https://via.placeholder.com/150'}
                    alt="Teacher"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border object-cover shadow-md"
                />
                <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-gray-800">{formatName(userInfo)}</h3>
                    <p className="text-sm text-gray-500">{userInfo?.email}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-4 text-gray-700 border-t">
                <p><strong>Address:</strong> {userInfo?.address || 'N/A'}</p>
                <p><strong>Contact Number:</strong> {userInfo?.number || 'N/A'}</p>
                {userInfo?.position && <p><strong>Position:</strong> {userInfo?.position}</p>}
            </div>

            {/* Sign-in/out Footer - Updated to use todaysAttendance */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t bg-gray-50">
                <p className="text-green-600 font-medium">
                    <strong>Sign In Time (Today):</strong> {formatDateTime(userInfo?.todaysAttendance?.signInTime)}
                </p>
                {userInfo?.todaysAttendance?.signOutTime ? (
                    <p className="text-red-500 font-medium mt-2 sm:mt-0">
                        <strong>Sign Out Time (Today):</strong> {formatDateTime(userInfo?.todaysAttendance?.signOutTime)}
                    </p>
                ) : (
                    <p className="text-gray-600 font-medium mt-2 sm:mt-0">
                        <strong>Sign Out Time (Today):</strong> Not yet signed out
                    </p>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;