import express from 'express';
// Import the new controller function
import {
    getStudentAttendance,
    getStudentAttendanceProfile,
    loginStudent,
    studentProfile,
    updateStudentProfile
} from '../controllers/studentController.js';
import authStudent from '../middleware/authStudent.js';

const studentRouter = express.Router();

// Authentication route
studentRouter.post("/login", loginStudent);

// Profile routes
studentRouter.get("/profile", authStudent, studentProfile);
studentRouter.put("/update-profile", authStudent, updateStudentProfile);

// Get students by student route (If needed, otherwise remove)
// studentRouter.get("/related-students/:studentId", authStudent, getStudentsByStudent);

// Attendance routes
studentRouter.get("/attendance", authStudent, getStudentAttendance); // Existing attendance route
studentRouter.get("/attendance-profile", authStudent, getStudentAttendanceProfile); // <-- New route added

export default studentRouter;