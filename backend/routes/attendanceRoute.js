import express from 'express';
import { getAttendanceRecords } from '../controllers/teacherController.js';
import authTeacher from '../middleware/authTeacher.js';

const attendanceRouter = express.Router();

attendanceRouter.get("/records", authTeacher, getAttendanceRecords);

export default attendanceRouter;