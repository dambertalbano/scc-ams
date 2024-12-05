import express from 'express';
import { appointmentCancel, appointmentComplete, appointmentsTeacher, changeAvailablity, loginTeacher, teacherDashboard, teacherList, teacherProfile, updateTeacherProfile } from '../controllers/teacherController.js';
import authTeacher from '../middleware/authTeacher.js';
const teacherRouter = express.Router();

teacherRouter.post("/login", loginTeacher)
teacherRouter.post("/cancel-appointment", authTeacher, appointmentCancel)
teacherRouter.get("/appointments", authTeacher, appointmentsTeacher)
teacherRouter.get("/list", teacherList)
teacherRouter.post("/change-availability", authTeacher, changeAvailablity)
teacherRouter.post("/complete-appointment", authTeacher, appointmentComplete)
teacherRouter.get("/dashboard", authTeacher, teacherDashboard)
teacherRouter.get("/profile", authTeacher, teacherProfile)
teacherRouter.post("/update-profile", authTeacher, updateTeacherProfile)

export default teacherRouter;