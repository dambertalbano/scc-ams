import express from 'express';
import {
    addStudent,
    addTeacher,
    addTeacherClassSchedule,
    addTeacherEducationLevel,
    addTeacherGradeYearLevel,
    addTeacherSection,
    addTeacherSubjects,
    adminDashboard,
    adminSignIn,
    adminSignOut,
    allStudents,
    allTeachers,
    deleteStudent,
    deleteTeacher,
    editTeacherClassSchedule,
    editTeacherEducationLevel,
    editTeacherGradeYearLevel,
    editTeacherSubjects,
    getAttendanceByDate,
    getStudentByCode,
    getUserByCode,
    loginAdmin,
    removeTeacherClassSchedule,
    removeTeacherEducationLevel,
    removeTeacherGradeYearLevel,
    removeTeacherSection,
    removeTeacherSubjects,
    updateStudent,
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

adminRouter.post("/teachers/:teacherId/class-schedule", authAdmin, addTeacherClassSchedule);
adminRouter.delete("/teachers/:teacherId/class-schedule", authAdmin, removeTeacherClassSchedule);
adminRouter.put("/teachers/:teacherId/class-schedule", authAdmin, editTeacherClassSchedule);

adminRouter.post("/teachers/:teacherId/education-level", authAdmin, addTeacherEducationLevel);
adminRouter.delete("/teachers/:teacherId/education-level", authAdmin, removeTeacherEducationLevel);
adminRouter.put("/teachers/:teacherId/education-level", authAdmin, editTeacherEducationLevel);

adminRouter.post("/teachers/:teacherId/grade-year-level", authAdmin, addTeacherGradeYearLevel);
adminRouter.delete("/teachers/:teacherId/grade-year-level", authAdmin, removeTeacherGradeYearLevel);
adminRouter.put("/teachers/:teacherId/grade-year-level", authAdmin, editTeacherGradeYearLevel);

adminRouter.post("/teachers/:teacherId/section", authAdmin, addTeacherSection);
adminRouter.delete("/teachers/:teacherId/section", authAdmin, removeTeacherSection);

adminRouter.post("/teachers/:teacherId/subjects", authAdmin, addTeacherSubjects);
adminRouter.delete("/teachers/:teacherId/subjects", authAdmin, removeTeacherSubjects);
adminRouter.put("/teachers/:teacherId/subjects", authAdmin, editTeacherSubjects);

export default adminRouter;