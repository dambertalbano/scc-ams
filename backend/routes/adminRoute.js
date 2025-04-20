import express from 'express';
import {
    addStudent,
    addTeacher,
    adminDashboard,
    adminSignIn,
    adminSignOut,
    allStudents,
    allTeachers,
    deleteStudent,
    deleteTeacher,
    getAttendanceByDate,
    getStudentByCode,
    getUserByCode,
    loginAdmin,
    updateStudent,
    updateTeacher
} from '../controllers/adminController.js';
import {
    createSchedule,
    deleteSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule
} from '../controllers/scheduleController.js';
import {
    createSubject,
    deleteSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject
} from '../controllers/subjectController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);

adminRouter.post("/add-student", authAdmin, upload.single('image'), addStudent);
adminRouter.post("/add-teacher", authAdmin, upload.single('image'), addTeacher);

adminRouter.get("/all-students", authAdmin, allStudents);
adminRouter.get("/all-teachers", authAdmin, allTeachers);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get('/user/code/:code', authAdmin, getUserByCode);
adminRouter.get("/student/code/:code", authAdmin, getStudentByCode);

adminRouter.get("/attendance", authAdmin, getAttendanceByDate);

adminRouter.put("/teachers/:id", authAdmin, updateTeacher);
adminRouter.put("/students/:id", authAdmin, updateStudent);

adminRouter.delete("/teachers/:id", authAdmin, deleteTeacher);
adminRouter.delete("/students/:id", authAdmin, deleteStudent);

adminRouter.post("/sign-in/:code", authAdmin, adminSignIn);
adminRouter.post("/sign-out/:code", authAdmin, adminSignOut);

adminRouter.put("/sign-in/:code", authAdmin, adminSignIn);
adminRouter.put("/sign-out/:code", authAdmin, adminSignOut);

adminRouter.get("/subjects", authAdmin, getAllSubjects);
adminRouter.get("/subjects/:id", authAdmin, getSubjectById);
adminRouter.post("/subjects", authAdmin, createSubject);
adminRouter.put("/subjects/:id", authAdmin, updateSubject);
adminRouter.delete("/subjects/:id", authAdmin, deleteSubject);

adminRouter.get("/schedules", authAdmin, getAllSchedules);
adminRouter.get("/schedules/:id", authAdmin, getScheduleById);
adminRouter.post("/schedules", authAdmin, createSchedule);
adminRouter.put("/schedules/:id", authAdmin, updateSchedule);
adminRouter.delete("/schedules/:id", authAdmin, deleteSchedule);

export default adminRouter;