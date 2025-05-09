import express from 'express';
import {
    addStudent,
    addTeacher,
    adminDashboard,
    adminSignIn,
    adminSignOut,
    allStudents,
    allTeachers,
    createSchedule,
    createSubject,
    deleteScheduleAdmin,
    deleteStudent,
    deleteSubjectAdmin,
    deleteTeacher,
    getAllSchedules,
    getAllSubjects,
    getAnalyticsSummary,
    getAttendanceByDate,
    getDailySignInStats,
    getScheduleById,
    getStudentByCode,
    getSubjectById,
    getUserByCode,
    getUserGrowthStats,
    loginAdmin,
    updateSchedule,
    updateStudent,
    updateSubject,
    updateTeacher
} from '../controllers/adminController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);

adminRouter.post("/add-student", authAdmin, upload.single('image'), addStudent);
adminRouter.post("/add-teacher", authAdmin, upload.single('image'), addTeacher);

adminRouter.get("/all-students", authAdmin, allStudents);
adminRouter.get("/all-teachers", authAdmin, allTeachers);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get('/user/code/:code', getUserByCode);
adminRouter.get("/student/code/:code", authAdmin, getStudentByCode);

adminRouter.get("/attendance", authAdmin, getAttendanceByDate);

adminRouter.put('/teachers/:id', upload.single('image'), updateTeacher);
adminRouter.put("/students/:id", authAdmin, updateStudent);

adminRouter.delete("/teachers/:id", authAdmin, deleteTeacher);
adminRouter.delete("/students/:id", authAdmin, deleteStudent);

adminRouter.post("/sign-in/:code", authAdmin, adminSignIn);
adminRouter.post("/sign-out/:code", authAdmin, adminSignOut);

adminRouter.put("/sign-in/:code", adminSignIn);
adminRouter.put("/sign-out/:code", adminSignOut);

adminRouter.route('/subjects')
    .post(authAdmin, createSubject)
    .get(authAdmin, getAllSubjects);
adminRouter.route('/subjects/:id')
    .get(authAdmin, getSubjectById)
    .put(authAdmin, updateSubject)
    .delete(authAdmin, deleteSubjectAdmin);

adminRouter.route('/schedules')
    .post(authAdmin, createSchedule)
    .get(authAdmin, getAllSchedules);
adminRouter.route('/schedules/:id')
    .get(authAdmin, getScheduleById)
    .put(authAdmin, updateSchedule)
    .delete(authAdmin, deleteScheduleAdmin);

adminRouter.get('/analytics/summary', authAdmin, getAnalyticsSummary);
adminRouter.get('/analytics/user-growth', authAdmin, getUserGrowthStats);
adminRouter.get('/analytics/daily-sign-ins', authAdmin, getDailySignInStats);

export default adminRouter;