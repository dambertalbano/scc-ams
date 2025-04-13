import axios from "axios";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { StudentContext } from "../../context/StudentContext";

const ProfileHeader = ({ studentInfo }) => {
  const formatName = (student) => {
    const middleInitial = student.middleName ? `${student.middleName.charAt(0)}.` : '';
    return `${student.lastName}, ${student.firstName} ${middleInitial}`;
  };

  return (
    <div className="bg-gradient-to-r from-customRed to-navbar p-8 text-white flex items-center">
      {studentInfo?.image && (
        <img
          src={studentInfo.image}
          alt="Student"
          className="w-32 h-32 rounded-full border-2 border-white shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = studentInfo.image; // Use user image as fallback
          }}
        />
      )}
      <div className="ml-6">
        <h2 className="text-3xl font-bold">{studentInfo ? formatName(studentInfo) : 'Loading...'}</h2>
        <p className="text-lg opacity-80">{studentInfo.email}</p>
      </div>
    </div>
  );
};

const ProfileForm = ({ formData, setFormData, onSubmit }) => (
  <form onSubmit={onSubmit} className="p-6">
    <div className="grid grid-cols-2 gap-4">
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
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="studentNumber"
          type="text"
          placeholder="Student Number"
          value={formData.studentNumber}
          onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
        />
      </div>
    </div>
    <div className="flex items-center justify-between mt-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Update Profile
      </button>
    </div>
  </form>
);

const SuccessModal = ({ isOpen, onClose }) => (
  isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
  const { sToken, backendUrl, updateStudentProfile } = useContext(StudentContext);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    number: '',
    address: '',
    studentNumber: '',
  });

  const fetchStudentProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/student/profile`, {
        headers: { Authorization: `Bearer ${sToken}` },
      });

      if (response.data.success) {
        const profileData = response.data.profileData;
        setStudentInfo(profileData);

        setFormData({
          firstName: profileData.firstName || '',
          middleName: profileData.middleName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          number: profileData.number || '',
          address: profileData.address || '',
          studentNumber: profileData.studentNumber || '',
        });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sToken, backendUrl]);

  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.number || !formData.address || !formData.studentNumber) {
      return alert('Missing Details');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return alert('Please enter a valid email');
    }

    try {
      const profileData = {
        ...formData,
        number: Number(formData.number),
      };

      const success = await updateStudentProfile(profileData);

      if (success) {
        fetchStudentProfile();
        setShowSuccessCard(true);
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-lg">Loading profile...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="container mx-auto bg-gray-50 min-h-screen">
      <ProfileHeader studentInfo={studentInfo} />
      <ProfileForm formData={formData} setFormData={setFormData} onSubmit={onSubmitHandler} />
      <SuccessModal isOpen={showSuccessCard} onClose={() => setShowSuccessCard(false)} />
    </div>
  );
};

export default StudentProfile;