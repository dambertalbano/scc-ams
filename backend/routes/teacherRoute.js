import express from 'express';
import { body } from 'express-validator';
import { addTeacherClassSchedule, addTeacherEducationLevel, addTeacherGradeYearLevel, addTeacherSection, addTeacherSubjects, editTeacherClassSchedule, editTeacherEducationLevel, editTeacherGradeYearLevel, editTeacherSubjects, getAttendance, getAttendanceRecords, getStudentsByTeacher, loginTeacher, logoutTeacher, removeTeacherClassSchedule, removeTeacherEducationLevel, removeTeacherGradeYearLevel, removeTeacherSection, removeTeacherSubjects, teacherProfile, updateTeacher, updateTeacherProfile } from '../controllers/teacherController.js'; // Import all controller functions
import authTeacher from '../middleware/authTeacher.js'; // Import auth middleware
import teacherModel from '../models/teacherModel.js';

const router = express.Router();

router.post("/login", loginTeacher);
router.post("/logout", authTeacher, logoutTeacher);
router.get("/profile", authTeacher, teacherProfile);
router.put("/profile", authTeacher, [
    body('firstName').optional().trim().escape(),
    body('middleName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('number').optional().isMobilePhone(),
    body('address').optional().trim().escape(),
    body('code').optional().trim().escape(),
], updateTeacherProfile);
router.get("/students/:assignmentId", authTeacher, getStudentsByTeacher);

router.put('/:id', authTeacher, [  // Route for updating a teacher by ID
    body('firstName').optional().trim().escape(),
    body('middleName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('number').optional().isMobilePhone(),
    body('address').optional().trim().escape(),
    body('code').optional().trim().escape(),
], updateTeacher);

// Teaching Assignments Route
router.put("/profile/teaching-assignments", authTeacher, async (req, res) => {
    try {
        const { teachingAssignments } = req.body;
        // Log the teaching assignments received
        console.log("Received teaching assignments:", teachingAssignments);

        // Assuming the teacher's ID is available in req.teacher (set by authTeacher middleware)
        const teacherId = req.teacher.id;
        console.log("Teacher ID from authTeacher:", teacherId);

        // Find the teacher by ID
        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            console.log("Teacher not found with ID:", teacherId);
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Update the teaching assignments
        teacher.teachingAssignments = teachingAssignments;

        // Log the teacher object before saving
        console.log("Teacher object before saving:", teacher);

        // Save the updated teacher profile
        await teacher.save();

        // Log after saving
        console.log("Teacher object saved successfully");

        // Send a success response
        res.json({ success: true, message: 'Teaching assignments updated successfully' });
    } catch (error) {
        console.error('Error updating teaching assignments:', error);
        res.status(500).json({ success: false, message: 'Failed to update teaching assignments', error: error.message });
    }
});

// Class Schedule Routes
router.post("/profile/class-schedule", authTeacher, addTeacherClassSchedule);
router.delete("/profile/class-schedule/:classScheduleId", authTeacher, removeTeacherClassSchedule);
router.put("/profile/class-schedule/:classScheduleId", authTeacher, editTeacherClassSchedule);

// Education Level Routes
router.post("/profile/education-level", authTeacher, addTeacherEducationLevel);
router.delete("/profile/education-level/:educationLevelId", authTeacher, removeTeacherEducationLevel);
router.put("/profile/education-level/:educationLevelId", authTeacher, editTeacherEducationLevel);

// Grade/Year Level Routes
router.post("/profile/grade-year-level", authTeacher, addTeacherGradeYearLevel);
router.delete("/profile/grade-year-level/:gradeYearLevelId", authTeacher, removeTeacherGradeYearLevel);
router.put("/profile/grade-year-level/:gradeYearLevelId", authTeacher, editTeacherGradeYearLevel);

// Section Routes
router.post("/profile/section", authTeacher, addTeacherSection);
router.delete("/profile/section/:sectionId", authTeacher, removeTeacherSection);

// Subjects Routes
router.post("/profile/subjects", authTeacher, addTeacherSubjects);
router.delete("/profile/subjects/:subjectsId", authTeacher, removeTeacherSubjects);
router.put("/profile/subjects/:subjectsId", authTeacher, editTeacherSubjects);

router.get('/code/:code', async (req, res) => {
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

// Attendance Route
router.get("/attendance", authTeacher, getAttendanceRecords);
router.get('/attendance-all', authTeacher,getAttendance);

export default router;