import express from 'express';
import { appointmentCancel, appointmentComplete, appointmentsStudent, changeAvailablity, loginStudent, studentDashboard, studentList, studentProfile, updateStudentProfile } from '../controllers/studentController.js';
import authStudent from '../middleware/authStudent.js';
const studentRouter = express.Router();

studentRouter.post("/login", loginStudent)
studentRouter.post("/cancel-appointment", authStudent, appointmentCancel)
studentRouter.get("/appointments", authStudent, appointmentsStudent)
studentRouter.get("/list", studentList)
studentRouter.post("/change-availability", authStudent, changeAvailablity)
studentRouter.post("/complete-appointment", authStudent, appointmentComplete)
studentRouter.get("/dashboard", authStudent, studentDashboard)
studentRouter.get("/profile", authStudent, studentProfile)
studentRouter.post("/update-profile", authStudent, updateStudentProfile)

export default studentRouter;