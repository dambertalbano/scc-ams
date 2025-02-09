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
teacherRouter.get('/code/:code', async (req, res) => {
    try {
        const teacher = await teacherModel.findOne({ code: req.params.code });
        if (teacher) {
            res.json(teacher);
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        console.error('Error fetching teacher by code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
export default teacherRouter;