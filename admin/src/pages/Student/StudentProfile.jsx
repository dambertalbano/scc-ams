import axios from "axios";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaPercentage } from "react-icons/fa"; // Added icons
import { StudentContext } from "../../context/StudentContext";

const ProfileHeader = ({ studentInfo }) => {
  const formatName = (student) => {
    if (!student) return 'Loading...';
    const middleInitial = student.middleName ? `${student.middleName.charAt(0)}.` : '';
    return `${student.lastName}, ${student.firstName} ${middleInitial}`;
  };

  return (
    <div className="bg-gradient-to-r from-customRed to-navbar p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
      {studentInfo?.image && (
        <img
          src={studentInfo.image}
          alt="Student"
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-white shadow-md object-cover"
          onError={(e) => {
            e.target.onerror = null;
            // You might want a placeholder image here if the primary image fails
            e.target.src = "https://via.placeholder.com/150"; // Example placeholder
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
  <form onSubmit={onSubmit} className="p-4 sm:p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Simplified form fields for brevity, ensure all your fields are here */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
          First Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
          Last Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="middleName">
          Middle Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="middleName"
          type="text"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
          Contact Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="number"
          type="text"
          placeholder="Contact Number"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
          Address
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="address"
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentNumber">
          Student Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100" // Made student number read-only visually
          id="studentNumber"
          type="text"
          placeholder="Student Number"
          value={formData.studentNumber}
          readOnly // Student number usually shouldn't be editable by student
        />
      </div>
    </div>
    <div className="flex items-center justify-end mt-6">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Update Profile
      </button>
    </div>
  </form>
);

const AttendanceStatCard = ({ icon, label, value, color }) => (
    <div className={`bg-white p-4 rounded-lg shadow-md flex items-center space-x-3 ${color}`}>
        <div className="text-2xl">{icon}</div>
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xl font-semibold text-gray-800">{value}</p>
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
        <div className="p-4 sm:p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Attendance Statistics</h3>
            {semesterDates && semesterDates.start && semesterDates.end && (
                <p className="mb-4 text-sm text-gray-600">
                    Current Semester: {formatDate(semesterDates.start)} - {formatDate(semesterDates.end)}
                </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AttendanceStatCard icon={<FaCalendarAlt />} label="Total School Days (Exc. Sunday)" value={stats.totalSchoolDays} color="text-blue-500" />
                <AttendanceStatCard icon={<FaCheckCircle />} label="Present Days" value={stats.presentDays} color="text-green-500" />
                <AttendanceStatCard icon={<FaExclamationCircle />} label="Absent Days" value={stats.absentDays} color="text-red-500" />
                <AttendanceStatCard icon={<FaPercentage />} label="Attendance Percentage" value={`${stats.attendancePercentage}%`} color="text-purple-500" />
            </div>
        </div>
    );
};


const SuccessModal = ({ isOpen, onClose }) => (
  isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-md font-bold mb-4 text-gray-600">Profile Updated Successfully!</h2>
        <button
          className="bg-customRed hover:text-navbar text-sm text-white font-medium py-2 px-4 rounded-lg"
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
  const { sToken, backendUrl, updateStudentProfile: contextUpdateProfile } = useContext(StudentContext); // Renamed to avoid conflict

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    number: '',
    address: '',
    studentNumber: '', // Student number is usually not editable by student
  });

  // State for attendance
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
    const today = new Date(); // Consider attendance only up to today
    today.setHours(23,59,59,999);


    while (currentDate <= semEndDate && currentDate <= today) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0) { // Exclude Sundays
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

  const fetchStudentData = useCallback(async () => { // Renamed from fetchStudentProfile for clarity
    setLoading(true);
    setError(null);
    try {
      // Fetch from the endpoint that provides student profile, attendance, and semester dates
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

  // Calculate stats when attendance data or semester dates are updated
  useEffect(() => {
    if (rawAttendanceRecords && semesterDates.start && semesterDates.end) {
        const stats = calculateAttendanceStats(rawAttendanceRecords, semesterDates.start, semesterDates.end);
        setAttendanceStats(stats);
    }
  }, [rawAttendanceRecords, semesterDates, calculateAttendanceStats]);


  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const { studentNumber, ...profileUpdateData } = formData; // Exclude studentNumber from update payload

    if (!profileUpdateData.firstName || !profileUpdateData.lastName || !profileUpdateData.email || !profileUpdateData.number || !profileUpdateData.address) {
      // Removed studentNumber from this check
      return alert('Missing Details. Please fill in all required fields.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileUpdateData.email)) {
      return alert('Please enter a valid email');
    }

    try {
      // Ensure number is sent as a string if your backend expects it, or convert if it expects number
      const payload = {
        ...profileUpdateData,
        // number: String(profileUpdateData.number), // Example: ensure it's a string
      };

      const success = await contextUpdateProfile(payload); // Use contextUpdateProfile

      if (success) {
        fetchStudentData(); // Refetch all data including potentially updated profile info
        setShowSuccessCard(true);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || "An error occurred during profile update.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg bg-gray-50">Loading profile...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-lg bg-gray-50 p-4 text-center">{error}</div>;

  return (
    <div className="container mx-auto bg-gray-50 min-h-screen pb-10">
      <ProfileHeader studentInfo={studentInfo} />
      <AttendanceStatsSection stats={attendanceStats} semesterDates={semesterDates} />
      <ProfileForm formData={formData} setFormData={setFormData} onSubmit={onSubmitHandler} />
      <SuccessModal isOpen={showSuccessCard} onClose={() => setShowSuccessCard(false)} />
    </div>
  );
};

export default StudentProfile;
