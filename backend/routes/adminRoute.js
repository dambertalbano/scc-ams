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

// Feedback routes
import Feedback from '../models/feedbackModel.js';

const protect = (req, res, next) => {
    console.log('Mock protect middleware called');
    next();
};
const authorizeAdmin = (req, res, next) => {
    console.log('Mock authorizeAdmin middleware called');
    next();
};

adminRouter.get('/feedback', protect, authorizeAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalFeedback = await Feedback.countDocuments();
        const feedbackItems = await Feedback.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            feedbackItems,
            currentPage: page,
            totalPages: Math.ceil(totalFeedback / limit),
            totalFeedback,
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: 'Server error while fetching feedback.' });
    }
});

adminRouter.get('/feedback/stats', protect, authorizeAdmin, async (req, res) => {
    try {
        const totalFeedback = await Feedback.countDocuments();
        const newFeedbackCount = await Feedback.countDocuments({ status: 'new' });
        const viewedFeedbackCount = await Feedback.countDocuments({ status: 'viewed' });
        const archivedFeedbackCount = await Feedback.countDocuments({ status: 'archived' });

        res.json({
            totalFeedback,
            newFeedbackCount,
            viewedFeedbackCount,
            archivedFeedbackCount,
        });
    } catch (error) {
        console.error("Error fetching feedback stats:", error);
        res.status(500).json({ message: 'Server error while fetching feedback stats.' });
    }
});

adminRouter.get('/feedback/:id', protect, authorizeAdmin, async (req, res) => {
    try {
        const feedbackItem = await Feedback.findById(req.params.id);
        if (!feedbackItem) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }
        res.json(feedbackItem);
    } catch (error) {
        console.error(`Error fetching feedback ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid feedback ID format.' });
        }
        res.status(500).json({ message: 'Server error while fetching feedback.' });
    }
});

adminRouter.patch('/feedback/:id/status', protect, authorizeAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['new', 'viewed', 'archived'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const updateData = { status };
        if (status === 'viewed' && !(await Feedback.findById(req.params.id))?.viewedAt) {
            const currentFeedback = await Feedback.findById(req.params.id);
            if (currentFeedback && !currentFeedback.viewedAt) {
                updateData.viewedAt = Date.now();
            }
        }

        const feedbackItem = await Feedback.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!feedbackItem) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }
        res.json({ message: 'Feedback status updated.', feedbackItem });
    } catch (error) {
        console.error(`Error updating feedback status for ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid feedback ID format.' });
        }
        res.status(500).json({ message: 'Server error while updating feedback status.' });
    }
});

adminRouter.delete('/feedback/:id', protect, authorizeAdmin, async (req, res) => {
    try {
        const feedbackItem = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedbackItem) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }
        res.json({ message: 'Feedback deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting feedback ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid feedback ID format.' });
        }
        res.status(500).json({ message: 'Server error while deleting feedback.' });
    }
});

export default adminRouter;