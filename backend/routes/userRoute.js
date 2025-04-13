import express from 'express';
import { getStudentByRFID, getTeacherByRFID } from '../controllers/userController.js';

const userRouter = express.Router();

// New routes for fetching users by RFID code
userRouter.get("/students/:code", getStudentByRFID);
userRouter.get("/teachers/:code", getTeacherByRFID);

export default userRouter;