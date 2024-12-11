import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditCard from './components/EditCard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserCard from './components/UserCard';
import { AdminContext } from './context/AdminContext';
import { TeacherContext } from './context/TeacherContext';
import AddAdministrator from './pages/Admin/AddAdministrator';
import AddStudent from './pages/Admin/AddStudent';
import AddTeacher from './pages/Admin/AddTeacher';
import AddUsers from './pages/Admin/AddUsers';
import AddUtility from './pages/Admin/AddUtility';
import AdministratorsList from './pages/Admin/AdministratorList';
import AllUsers from './pages/Admin/AllUsers';
import Attendance from './pages/Admin/Attendance';
import AttendaceAdministratorCard from './pages/Admin/AttendanceAdministratorCard';
import AttendanceStudentCard from './pages/Admin/AttendanceStudentCard';
import AttendanceTeacherCard from './pages/Admin/AttendanceTeacherCard';
import AttendanceUtilityCard from './pages/Admin/AttendanceUtilityCard';
import Dashboard from './pages/Admin/Dashboard';
import EditUser from './pages/Admin/EditUser';
import RFID_Scan from './pages/Admin/RFID_Scan';
import StudentsList from './pages/Admin/StudentsList';
import TeachersList from './pages/Admin/TeacherList';
import UtilitysList from './pages/Admin/UtilityList';
import AdministratorAppointments from './pages/Administrator/AdministratorAppointment';
import AdministratorDashboard from './pages/Administrator/AdministratorDashboard';
import AdministratorProfile from './pages/Administrator/AdministratorProfile';
import Login from './pages/Login';
import StudentAppointments from './pages/Student/StudentAppointments';
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentProfile from './pages/Student/StudentProfile';
import TeacherAppointments from './pages/Teacher/TeacherAppointment';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import TeacherProfile from './pages/Teacher/TeacherProfile';
import UtilityAppointments from './pages/Utility/UtilityAppointment';
import UtilityDashboard from './pages/Utility/UtilityDashboard';
import UtilityProfile from './pages/Utility/UtilityProfile';

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(TeacherContext);

  console.log("Tokens:", { aToken, dToken});

  return aToken || dToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/teacher-dashboard' element={<TeacherDashboard />} />
          <Route path='/rfid-scan' element={<RFID_Scan />} />
          <Route path='/add-student' element={<AddStudent />} />
          <Route path='/add-administrator' element={<AddAdministrator />} />
          <Route path='/add-teacher' element={<AddTeacher />} />
          <Route path='/add-utility' element={<AddUtility />} />
          <Route path='/student-list' element={<StudentsList />} />
          <Route path='/administrator-list' element={<AdministratorsList />} />
          <Route path='/teacher-list' element={<TeachersList />} />
          <Route path='/utility-list' element={<UtilitysList />} />
          <Route path='/user-card' element={<UserCard />} />
          <Route path='/edit-card' element={<EditCard />} />
          <Route path='/attendance' element={<Attendance />} />
          <Route path='/attendance-admin' element={<AttendaceAdministratorCard />} />
          <Route path='/attendance-teacher' element={<AttendanceTeacherCard />} />
          <Route path='/attendance-student' element={<AttendanceStudentCard />} />
          <Route path='/attendance-utility' element={<AttendanceUtilityCard />} />
          <Route path='/student-dashboard' element={<StudentDashboard />} />
          <Route path='/administrator-dashboard' element={<AdministratorDashboard />} />
          <Route path='/utility-dashboard' element={<UtilityDashboard />} />
          <Route path='/administrator-appointments' element={<AdministratorAppointments />} />
          <Route path='/teacher-appointments' element={<TeacherAppointments />} />
          <Route path='/utility-appointments' element={<UtilityAppointments />} />
          <Route path='/student-appointments' element={<StudentAppointments />} />
          <Route path='/student-profile' element={<StudentProfile />} />
          <Route path='/administrator-profile' element={<AdministratorProfile />} />
          <Route path='/teacher-profile' element={<TeacherProfile />} />
          <Route path='/utility-profile' element={<UtilityProfile />} />
          <Route path='/all-users' element={<AllUsers />} />
          <Route path='/add-users' element={<AddUsers />} />
          <Route path='/edit-users' element={<EditUser />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  );
};

export default App;