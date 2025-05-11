import axios from 'axios';
import { format } from 'date-fns';
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import UserInfoDisplay from '../../components/rfid/UserInfoDisplay';
import { StudentContext } from '../../context/StudentContext';

// Helper function to get today's date string in YYYY-MM-DD format using date-fns
const getTodayDateString = () => {
    return format(new Date(), 'yyyy-MM-dd');
};

// Helper function to find today's attendance entry
const getTodaysAttendanceEntry = (attendanceData) => {
    if (!attendanceData || !Array.isArray(attendanceData)) {
        console.log("getTodaysAttendanceEntry: No attendance data or not an array.");
        return null;
    }
    const todayDateStr = getTodayDateString(); // e.g., "2025-05-10"
    console.log("getTodaysAttendanceEntry: Searching for date (yyyy-MM-dd):", todayDateStr);

    const entry = attendanceData.find(attEntry => {
        if (!attEntry.timestamp) {
            // console.log("getTodaysAttendanceEntry: Entry missing timestamp:", attEntry);
            return false;
        }
        try {
            // Convert entry's timestamp to 'yyyy-MM-dd' format for comparison
            const entryDate = new Date(attEntry.timestamp);
            if (isNaN(entryDate.getTime())) { // Check if date is valid
                // console.log("getTodaysAttendanceEntry: Invalid timestamp in entry:", attEntry.timestamp);
                return false;
            }
            const entryDateStr = format(entryDate, 'yyyy-MM-dd');
            // console.log("getTodaysAttendanceEntry: Comparing", entryDateStr, "with", todayDateStr);
            return entryDateStr === todayDateStr;
        } catch (e) {
            // console.error("getTodaysAttendanceEntry: Error parsing timestamp:", attEntry.timestamp, e);
            return false;
        }
    }) || null;

    console.log("getTodaysAttendanceEntry: Found entry for today:", entry);
    return entry;
};

// Function to prepare the lastScan object, similar to TeacherDashboard
const prepareLastScan = (todaysAttendance) => {
    console.log("prepareLastScan: Received todaysAttendance:", todaysAttendance);
    if (!todaysAttendance) {
        console.log("prepareLastScan: No todaysAttendance, returning null.");
        return null;
    }

    const { signInTime, signOutTime } = todaysAttendance;
    console.log("prepareLastScan: signInTime:", signInTime, "signOutTime:", signOutTime);

    if (signOutTime) {
        const result = { timestamp: signOutTime, eventType: 'sign-out' };
        console.log("prepareLastScan: Returning for sign-out:", result);
        return result;
    }
    if (signInTime) {
        const result = { timestamp: signInTime, eventType: 'sign-in' };
        console.log("prepareLastScan: Returning for sign-in:", result);
        return result;
    }
    console.log("prepareLastScan: No sign-in or sign-out time found, returning null.");
    return null;
};

const StudentDashboard = () => {
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { sToken, backendUrl } = useContext(StudentContext);

    const fetchStudentInfo = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log("fetchStudentInfo: Starting to fetch student profile from /api/student/attendance-profile");
        try {
            const response = await axios.get(`${backendUrl}/api/student/attendance-profile`, {
                headers: {
                    Authorization: `Bearer ${sToken}`,
                },
            });
            console.log("fetchStudentInfo: API Response received:", response.data);

            if (response.data.success) {
                const studentProfile = response.data.student; // Contains signInTime and signOutTime from backend
                const attendanceData = response.data.attendance; 
                
                console.log("fetchStudentInfo: Profile data from API (includes signInTime/signOutTime):", studentProfile);
                console.log("fetchStudentInfo: Full attendance array:", attendanceData);

                // We will use the signInTime and signOutTime directly from studentProfile
                // The getTodaysAttendanceEntry and constructing todaysAttendance for prepareLastScan
                // might still be useful if prepareLastScan needs a specific structure or if you want to
                // derive the last event type (sign-in or sign-out) from the raw attendance array.

                // Let's find the actual sign-in and sign-out events from today to pass to prepareLastScan
                let todaysSignInEntry = null;
                let todaysSignOutEntry = null;

                if (attendanceData && attendanceData.length > 0) {
                    const todayDateStr = getTodayDateString();
                    todaysSignInEntry = attendanceData.find(attEntry => {
                        if (!attEntry.timestamp || attEntry.eventType !== 'sign-in') return false;
                        const entryDateStr = format(new Date(attEntry.timestamp), 'yyyy-MM-dd');
                        return entryDateStr === todayDateStr;
                    });
                    todaysSignOutEntry = attendanceData.find(attEntry => {
                        if (!attEntry.timestamp || attEntry.eventType !== 'sign-out') return false;
                        const entryDateStr = format(new Date(attEntry.timestamp), 'yyyy-MM-dd');
                        return entryDateStr === todayDateStr;
                    });
                }
                
                const displayInfo = {
                    ...studentProfile, // studentProfile already has signInTime and signOutTime
                    // The 'todaysAttendance' for prepareLastScan needs signInTime and signOutTime properties
                    todaysAttendance: {
                        signInTime: todaysSignInEntry?.timestamp || studentProfile.signInTime, // Fallback to profile if specific entry not found
                        signOutTime: todaysSignOutEntry?.timestamp || studentProfile.signOutTime // Fallback
                    },
                    // The UserInfoDisplay component uses top-level signInTime and signOutTime from userInfo
                    // These are already correctly set in studentProfile by the backend.
                    attendance: attendanceData || [], 
                };
                console.log("fetchStudentInfo: Constructed displayInfo:", displayInfo);
                console.log("fetchStudentInfo: displayInfo.signInTime (from profile):", displayInfo.signInTime);
                console.log("fetchStudentInfo: displayInfo.signOutTime (from profile):", displayInfo.signOutTime);
                setStudentInfo(displayInfo);
            } else {
                toast.error(response.data.message);
                setError(response.data.message);
                console.error("fetchStudentInfo: API call not successful:", response.data.message);
            }
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
            console.error("fetchStudentInfo: Error during API call:", err);
        } finally {
            setLoading(false);
            console.log("fetchStudentInfo: Fetch process finished.");
        }
    }, [sToken, backendUrl]);

    useEffect(() => {
        fetchStudentInfo();
    }, [fetchStudentInfo]);

    const formatName = (user) => {
        if (!user) return '';
        const middleInitial = user.middleName ? `${user.middleName.charAt(0)}.` : "";
        return `${user.firstName || ''} ${middleInitial} ${user.lastName || ''}`.trim().replace(/\s+/g, ' ');
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
                    <h2 className="text-3xl sm:text-4xl font-bold text-white ml-2">Student Information</h2> 
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px]"> 
                        <Loader className="w-12 h-12 text-red-500 animate-spin mr-2 mb-4" /> 
                        <p className="text-xl font-semibold text-gray-200">Loading Profile...</p> 
                    </div>
                ) : error ? (
                    <div className="min-h-[300px] flex flex-col justify-center items-center">
                        <p className="text-red-400 text-center text-lg">{error}</p> 
                    </div>
                ) : studentInfo ? (
                    <UserInfoDisplay 
                        userInfo={studentInfo} 
                        formatName={formatName} 
                        lastScan={prepareLastScan(studentInfo.todaysAttendance)} // Use prepareLastScan
                    />
                ) : (
                    <div className="min-h-[300px] flex flex-col justify-center items-center">
                        <p className="text-gray-400">No student information available.</p> 
                    </div>
                )}
            </div>
            <footer className="mt-8 text-center">
                <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} St. Clare College of Caloocan</p> 
            </footer>
        </motion.div>
    );
};

export default StudentDashboard;