import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { baseURL } from '../utils/constant';

const Home = () => {
  const [adminTotal, setAdminTotal] = useState(0);
  const [studentTotal, setStudentTotal] = useState(0);
  const [teacherTotal, setTeacherTotal] = useState(0);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminResponse = await axios.get(`${baseURL}/admin/admin_count`);
        if (adminResponse.data.success) {
          setAdminTotal(adminResponse.data.adminCount);
        } else {
          console.error('Error in admin count response:', adminResponse.data);
        }

        const studentResponse = await axios.get(`${baseURL}/admin/student_count`);
        if (studentResponse.data.success) {
          setStudentTotal(studentResponse.data.studentCount);
        } else {
          console.error('Error in student count response:', studentResponse.data);
        }

        const teacherResponse = await axios.get(`${baseURL}/admin/teacher_count`);
        if (teacherResponse.data.success) {
          setTeacherTotal(teacherResponse.data.teacherCount);
        } else {
          console.error('Error in teacher count response:', teacherResponse.data);
        }

        const adminRecordsResponse = await axios.get(`${baseURL}/admin/admin_records`);
        if (adminRecordsResponse.data.success) {
          setAdmins(adminRecordsResponse.data.admins);
        } else {
          console.error('Error in admin records response:', adminRecordsResponse.data);
          alert(adminRecordsResponse.data.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error, show error message to user, etc.
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="p-3 d-flex justify-content-around mt-3">
      <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Admin</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{adminTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Student</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{studentTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Teacher</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{teacherTotal}</h5>
          </div>
        </div>
      </div>
      <div className="mt-4 px-5 pt-3">
        <h3 className="adminList">List of Admins</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => (
              <tr key={index}>
                <td>{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
