import axios from "axios";
import { motion } from "framer-motion"; // Import motion
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaPercentage } from "react-icons/fa";
import { StudentContext } from "../../context/StudentContext";

const ProfileHeader = ({ studentInfo }) => {
  const formatName = (student) => {
    if (!student) return 'Loading...';
    const middleInitial = student.middleName ? `${student.middleName.charAt(0)}.` : '';
    return `${student.lastName}, ${student.firstName} ${middleInitial}`;
  };

  return (
    <div className="bg-gradient-to-r from-customRed to-navbar p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 rounded-t-xl">
      {studentInfo?.image && (
        <img
          src={studentInfo.image}
          alt="Student"
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-white shadow-md object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150"; 
          }}
        />
      )}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold">{formatName(studentInfo)}</h2>
        <p className="text-md sm:text-lg opacity-80">{studentInfo?.email || 'No email provided'}</p>
      </div>
    </div>
  );
};

const ProfileForm = ({ formData, setFormData, onSubmit }) => (
  <form onSubmit={onSubmit} className="p-4 sm:p-6 bg-slate-800 rounded-b-xl">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="firstName">
          First Name
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          id="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          readOnly
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="lastName">
          Last Name
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          id="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          readOnly
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="middleName">
          Middle Name
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          id="middleName"
          type="text"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
          readOnly
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          id="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          readOnly
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="number">
          Contact Number
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          id="number"
          type="text"
          placeholder="Contact Number"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="address">
          Address
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          id="address"
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="studentNumber">
          Student Number
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline cursor-not-allowed"
          id="studentNumber"
          type="text"
          placeholder="Student Number"
          value={formData.studentNumber}
          readOnly 
        />
      </div>
    </div>
    <div className="flex items-center justify-end mt-6">
      <button
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        type="submit"
      >
        Update Profile
      </button>
    </div>
  </form>
);

const AttendanceStatCard = ({ icon, label, value, color }) => (
    <div className={`bg-slate-700 p-4 rounded-lg shadow-md flex items-center space-x-3`}>
        <div className={`text-2xl ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xl font-semibold text-gray-200">{value}</p>
        </div>
    </div>
);

const AttendanceStatsSection = ({ stats, semesterDates }) => {
    if (!stats) return null;
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="p-4 sm:p-6 bg-slate-800 rounded-xl mt-8">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Attendance Statistics</h3>
            {semesterDates && semesterDates.start && semesterDates.end && (
                <p className="mb-4 text-sm text-gray-400">
                    Current Semester: {formatDate(semesterDates.start)} - {formatDate(semesterDates.end)}
                </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AttendanceStatCard icon={<FaCalendarAlt />} label="Total School Days (Exc. Sunday)" value={stats.totalSchoolDays} color="text-blue-400" />
                <AttendanceStatCard icon={<FaCheckCircle />} label="Present Days" value={stats.presentDays} color="text-green-400" />
                <AttendanceStatCard icon={<FaExclamationCircle />} label="Absent Days" value={stats.absentDays} color="text-red-400" />
                <AttendanceStatCard icon={<FaPercentage />} label="Attendance Percentage" value={`${stats.attendancePercentage}%`} color="text-purple-400" />
            </div>
        </div>
    );
};


const SuccessModal = ({ isOpen, onClose }) => (
  isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-700 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-md font-bold mb-4 text-gray-200">Profile Updated Successfully!</h2>
        <button
          className="bg-red-600 hover:bg-red-700 text-sm text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  )
);

const StudentProfile = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const { sToken, backendUrl, updateStudentProfile: contextUpdateProfile } = useContext(StudentContext);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    number: '',
    address: '',
    studentNumber: '',
  });

  const [rawAttendanceRecords, setRawAttendanceRecords] = useState([]);
  const [semesterDates, setSemesterDates] = useState({ start: null, end: null });
  const [attendanceStats, setAttendanceStats] = useState(null);


  const calculateAttendanceStats = useCallback((records, semStartDateStr, semEndDateStr) => {
    if (!semStartDateStr || !semEndDateStr || !records) {
      return { presentDays: 0, absentDays: 0, totalSchoolDays: 0, attendancePercentage: 0 };
    }

    const semStartDate = new Date(semStartDateStr);
    semStartDate.setHours(0, 0, 0, 0);
    const semEndDate = new Date(semEndDateStr);
    semEndDate.setHours(23, 59, 59, 999);

    const presentDates = new Set();
    records.forEach(record => {
      if (record.eventType === "sign-in" && record.timestamp) {
        const recordDate = new Date(record.timestamp);
        presentDates.add(recordDate.toISOString().split('T')[0]);
      }
    });

    let totalSchoolDays = 0;
    let absentDays = 0;
    let currentDate = new Date(semStartDate);
    const today = new Date(); 
    today.setHours(23,59,59,999);


    while (currentDate <= semEndDate && currentDate <= today) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0) { 
        totalSchoolDays++;
        const dateStr = currentDate.toISOString().split('T')[0];
        if (!presentDates.has(dateStr)) {
          absentDays++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const presentDays = totalSchoolDays - absentDays;
    const attendancePercentage = totalSchoolDays > 0 ? Math.round((presentDays / totalSchoolDays) * 100) : 0;

    return { presentDays, absentDays, totalSchoolDays, attendancePercentage };
  }, []);

  const fetchStudentData = useCallback(async () => { 
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/student/attendance-profile`, {
        headers: { Authorization: `Bearer ${sToken}` },
      });

      if (response.data.success) {
        const studentData = response.data.student;
        const attendanceData = response.data.attendance || [];
        const semDates = response.data.semesterDates || { start: null, end: null };

        setStudentInfo(studentData);
        setFormData({
          firstName: studentData.firstName || '',
          middleName: studentData.middleName || '',
          lastName: studentData.lastName || '',
          email: studentData.email || '',
          number: studentData.number || '',
          address: studentData.address || '',
          studentNumber: studentData.studentNumber || '',
        });
        setRawAttendanceRecords(attendanceData);
        setSemesterDates(semDates);

      } else {
        setError(response.data.message || "Failed to fetch student data.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [sToken, backendUrl]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  useEffect(() => {
    if (rawAttendanceRecords && semesterDates.start && semesterDates.end) {
        const stats = calculateAttendanceStats(rawAttendanceRecords, semesterDates.start, semesterDates.end);
        setAttendanceStats(stats);
    }
  }, [rawAttendanceRecords, semesterDates, calculateAttendanceStats]);


  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const { studentNumber, firstName, middleName, lastName, email, ...profileUpdateData } = formData;

    if (!profileUpdateData.number || !profileUpdateData.address) {
      return alert('Missing Details. Please fill in Contact Number and Address.');
    }

    try {
      const payload = { ...profileUpdateData };
      const success = await contextUpdateProfile(payload); 

      if (success) {
        fetchStudentData(); 
        setShowSuccessCard(true);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || "An error occurred during profile update.");
    }
  };

  if (loading) return (
    <motion.div className="flex flex-col justify-center items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 text-gray-300">
        Loading profile...
    </motion.div>
  );
  if (error) return (
    <motion.div className="flex flex-col justify-center items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 text-red-400">
        {error}
    </motion.div>
  );

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 sm:p-6 md:p-10 text-gray-300"
    >
        <div className="w-full max-w-4xl">
            <ProfileHeader studentInfo={studentInfo} />
            <ProfileForm formData={formData} setFormData={setFormData} onSubmit={onSubmitHandler} />
            <AttendanceStatsSection stats={attendanceStats} semesterDates={semesterDates} />
            <SuccessModal isOpen={showSuccessCard} onClose={() => setShowSuccessCard(false)} />
             <footer className="mt-12 text-center">
                <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} St. Clare College of Caloocan</p>
            </footer>
        </div>
    </motion.div>
  );
};

export default StudentProfile;
