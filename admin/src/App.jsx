import { useContext, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditCard from './components/EditCard';
import Navbar from './components/Navbar';
import UserCard from './components/UserCard';
import { AdminContext } from './context/AdminContext';
import { StudentContext } from './context/StudentContext';
import { TeacherContext } from './context/TeacherContext';
import AddStudent from './pages/Admin/AddStudent';
import AddTeacher from './pages/Admin/AddTeacher';
import AddUsers from './pages/Admin/AddUsers';
import AllUserAttendanceCard from './pages/Admin/AllUserAttendanceCard';
import AllUsers from './pages/Admin/AllUsers';
import Analytics from './pages/Admin/Analytics';
import Attendance from './pages/Admin/Attendance';
import AttendanceStudentCard from './pages/Admin/AttendanceStudentCard';
import AttendanceTeacherCard from './pages/Admin/AttendanceTeacherCard';
import Dashboard from './pages/Admin/Dashboard';
import EditUser from './pages/Admin/EditUser';
import AdminFeedbackPage from './pages/Admin/Feedback';
import FeedbackDetailPage from './pages/Admin/FeedbackDetailPage';
import Manage from './pages/Admin/Manage';
import RFID_Scan from './pages/Admin/RFID_Scan';
import Schedules from './pages/Admin/Schedules';
import StudentsList from './pages/Admin/StudentsList';
import Subjects from './pages/Admin/Subjects';
import TeachersList from './pages/Admin/TeacherList';
import UseRfidScanLogic from './pages/Admin/useRfidScanLogic';
import AdminLogin from './pages/AdminLogin';
import LandingPage from './pages/LandingPage';
import KioskScanPage from './pages/RFID_Scan/KioskScanPage';
import StudentAttendance from './pages/Student/StudentAttendance';
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentProfile from './pages/Student/StudentProfile';
import StudentLogin from './pages/StudentLogin';
import TeacherAttendance from './pages/Teacher/TeacherAttendance';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import TeacherProfile from './pages/Teacher/TeacherProfile';
import TeacherLogin from './pages/TeacherLogin';

const App = () => {
    const { aToken, setAToken } = useContext(AdminContext);
    const { dToken, setDToken } = useContext(TeacherContext);
    const { sToken, setSToken } = useContext(StudentContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [navbarHeight, setNavbarHeight] = useState(0);
    const navbarRef = useRef(null);

    useEffect(() => {
        const updateNavbarHeight = () => {
            if (navbarRef.current) {
                setNavbarHeight(navbarRef.current.offsetHeight);
            }
        };

        updateNavbarHeight();

        window.addEventListener('resize', updateNavbarHeight);

        return () => {
            window.removeEventListener('resize', updateNavbarHeight);
        };
    }, []);

    useEffect(() => {
        if (location.pathname === '/') {
            if (aToken) {
                navigate('/admin-dashboard', { replace: true });
            } else if (dToken) {
                navigate('/teacher-dashboard', { replace: true });
            } else if (sToken) {
                navigate('/student-dashboard', { replace: true });
            }
        }
    }, [aToken, dToken, sToken, navigate, location.pathname]);

    const handleLogout = () => {
        setAToken(null);
        setDToken(null);
        setSToken(null);
        localStorage.removeItem('aToken');
        localStorage.removeItem('dToken');
        localStorage.removeItem('sToken');
        navigate(0);
    };

    return (
        <>
            <Navbar ref={navbarRef} />
            <ToastContainer />
            <div style={{ paddingTop: `${navbarHeight}px` }}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/teacher-login" element={<TeacherLogin />} />
                    <Route path="/student-login" element={<StudentLogin />} />
                    
                    {/* Protected Routes */}
                    <Route path='/admin-dashboard' element={aToken ? <Dashboard /> : <LandingPage />} />
                    <Route path='/teacher-dashboard' element={dToken ? <TeacherDashboard /> : <LandingPage />} />
                    <Route path='/student-dashboard' element={sToken ? <StudentDashboard /> : <LandingPage />} />
                    <Route path='/rfid-scan' element={aToken ? <RFID_Scan /> : <LandingPage />} />
                    <Route path='/add-student' element={aToken ? <AddStudent /> : <LandingPage />} />
                    <Route path='/add-teacher' element={aToken ? <AddTeacher /> : <LandingPage />} />
                    <Route path='/student-list' element={aToken ? <StudentsList /> : <LandingPage />} />
                    <Route path='/teacher-list' element={aToken ? <TeachersList /> : <LandingPage />} />
                    <Route path='/user-card' element={aToken ? <UserCard /> : <LandingPage />} />
                    <Route path='/edit-card' element={aToken ? <EditCard /> : <LandingPage />} />
                    <Route path='/attendance-all' element={aToken ? <AllUserAttendanceCard /> : <LandingPage />} />
                    <Route path='/attendance' element={aToken ? <Attendance /> : <LandingPage />} />
                    <Route path='/attendance-student' element={aToken ? <AttendanceStudentCard /> : <LandingPage />} />
                    <Route path='/attendance-teacher' element={aToken ? <AttendanceTeacherCard /> : <LandingPage />} />
                    <Route path='/teacher-attendance' element={dToken ? <TeacherAttendance /> : <LandingPage />} />
                    <Route path='/student-attendance' element={sToken ? <StudentAttendance /> : <LandingPage />} />
                    <Route path='/student-profile' element={sToken ? <StudentProfile /> : <LandingPage />} />
                    <Route path='/teacher-profile' element={dToken ? <TeacherProfile /> : <LandingPage />} />
                    <Route path='/all-users' element={aToken ? <AllUsers /> : <LandingPage />} />
                    <Route path='/add-users' element={aToken ? <AddUsers /> : <LandingPage />} />
                    <Route path='/edit-users' element={aToken ? <EditUser /> : <LandingPage />} />
                    <Route path='/subjects' element={aToken ? <Subjects /> : <LandingPage />} />
                    <Route path='/schedules' element={aToken ? <Schedules /> : <LandingPage />} />
                    <Route path='/analytics' element={aToken ? <Analytics /> : <LandingPage />} />
                    <Route path='/kiosk-scan' element={<KioskScanPage />} />
                    <Route path='/use-rfid-scan' element={aToken ? <UseRfidScanLogic /> : <LandingPage />} />
                    <Route path='/manage' element={aToken ? <Manage /> : <LandingPage />} />
                    
                    {/* Corrected Feedback Routes */}
                    <Route path="admin/feedback" element={aToken ? <AdminFeedbackPage /> : <LandingPage />} />
                    <Route path="admin/feedback/:feedbackId" element={aToken ? <FeedbackDetailPage /> : <LandingPage />} />

                </Routes>
            </div>
        </>
    );
};

export default App;