import express from 'express';
import { getStudentAttendance, getStudentsByStudent, loginStudent, studentProfile, updateStudentProfile } from '../controllers/studentController.js';
import authStudent from '../middleware/authStudent.js';

const studentRouter = express.Router();

// Authentication route
studentRouter.post("/login", loginStudent);

// Profile routes
studentRouter.get("/profile", authStudent, studentProfile);
studentRouter.put("/update-profile", authStudent, updateStudentProfile);

// Get students by student route
studentRouter.get("/related-students/:studentId", authStudent, getStudentsByStudent);

// Attendance route
studentRouter.get("/attendance", authStudent, getStudentAttendance);

export default studentRouter;