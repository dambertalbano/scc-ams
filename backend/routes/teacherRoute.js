import express from 'express';
import { body } from 'express-validator';
import {
    addTeacherSubjects,
    getAttendance,
    getAttendanceRecords,
    getStudentsBySchedule,
    loginTeacher,
    logoutTeacher,
    removeTeacherSubjects,
    teacherProfile,
    updateTeacherProfile
} from '../controllers/teacherController.js';
import authTeacher from '../middleware/authTeacher.js';
import teacherModel from '../models/teacherModel.js';

const router = express.Router();

router.post("/login", loginTeacher);
router.post("/logout", authTeacher, logoutTeacher);
router.get("/profile", authTeacher, teacherProfile);

router.put("/profile", authTeacher, [
    body('firstName').optional({ checkFalsy: true }).trim().escape(),
    body('middleName').optional({ checkFalsy: true }).trim().escape(),
    body('lastName').optional({ checkFalsy: true }).trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('number').optional().isMobilePhone('any', { strictMode: false }),
    body('address').optional({ checkFalsy: true }).trim().escape(),
], updateTeacherProfile);

router.get("/students/schedule/:scheduleId",
    authTeacher,
    getStudentsBySchedule
);

router.post("/profile/subjects", authTeacher, addTeacherSubjects);
router.delete("/profile/subjects", authTeacher, removeTeacherSubjects);

router.get('/code/:code', async (req, res) => {
    try {
        const teacher = await teacherModel.findOne({ code: req.params.code }).select('-password');
        if (teacher) {
            res.json(teacher);
        } else {
            res.status(404).json({ success: false, message: 'Teacher not found' });
        }
    } catch (error) {
        console.error('Error fetching teacher by code:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get("/attendance", authTeacher, getAttendanceRecords);
router.get('/attendance-all', authTeacher, getAttendance);

export default router;