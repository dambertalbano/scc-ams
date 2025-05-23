import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { eachDayOfInterval, endOfMonth, formatISO, isValid, parseISO, startOfMonth, subMonths } from 'date-fns';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from 'multer';
import validator from "validator";
import { default as Attendance, default as attendanceModel } from "../models/attendanceModel.js";
import scheduleModel from "../models/scheduleModel.js";
import studentModel from "../models/studentModel.js";
import subjectModel from "../models/subjectModel.js";
import teacherModel from "../models/teacherModel.js";

const upload = multer({ dest: 'uploads/' });

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '4h' });
            return res.status(200).json({ success: true, token });
        }

        res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const findUserByCode = async (code) => {
    let user = await studentModel.findOne({ code });
    if (!user) user = await teacherModel.findOne({ code });
    return user;
};

const adminSignIn = async (req, res) => {
    try {
        const { code } = req.params;
        let user = await studentModel.findOne({ code });
        let userType = 'Student';
        if (!user) {
            user = await teacherModel.findOne({ code });
            userType = 'Teacher';
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.signInTime = Date.now();
        await user.save();

        const attendanceRecord = new Attendance({
            user: user._id,
            userType: userType,
            eventType: "sign-in",
        });
        await attendanceRecord.save();

        res.status(200).json({ success: true, message: "Sign in successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const adminSignOut = async (req, res) => {
    try {
        const { code } = req.params;
        let user = await studentModel.findOne({ code });
        let userType = 'Student';
        if (!user) {
            user = await teacherModel.findOne({ code });
            userType = 'Teacher';
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.signOutTime = Date.now();
        await user.save();

        const attendanceRecord = new Attendance({
            user: user._id,
            userType: userType,
            eventType: "sign-out",
        });
        await attendanceRecord.save();

        res.status(200).json({ success: true, message: "Sign out successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addStudent = async (req, res) => {
    try {
        const {
            studentNumber,
            code,
            firstName,
            middleName,
            lastName,
            email,
            password,
            number,
            address,
            educationLevel,
            gradeYearLevel,
            section,
            semester = "1st Sem",
            semesterDates = {
                start: new Date("2025-01-06"),
                end: new Date("2025-05-15"),
            },
            status
        } = req.body;

        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        if (!studentNumber || !firstName || !lastName || !email || !password || !number || !code || !educationLevel || !gradeYearLevel || !section || !semester) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const userData = {
            studentNumber,
            code,
            firstName,
            middleName,
            lastName,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            address,
            educationLevel,
            gradeYearLevel,
            section,
            semester,
            semesterDates,
            status: status || 'Active'
        };

        const newStudent = new studentModel(userData);
        await newStudent.save();

        try {
            const matchingSchedules = await scheduleModel.find({
                educationLevel: newStudent.educationLevel,
                gradeYearLevel: newStudent.gradeYearLevel,
                section: newStudent.section,
                semester: newStudent.semester
            });

            if (matchingSchedules.length > 0) {
                const scheduleIdsForStudent = [];
                for (const schedule of matchingSchedules) {
                    if (!schedule.enrolledStudents.includes(newStudent._id)) {
                        schedule.enrolledStudents.push(newStudent._id);
                        await schedule.save();
                    }
                    scheduleIdsForStudent.push(schedule._id);
                }
                newStudent.enrolledSchedules = scheduleIdsForStudent;
                await newStudent.save();
                console.log(`[Admin] Student ${newStudent._id} automatically enrolled in ${matchingSchedules.length} schedules.`);
            } else {
                console.log(`[Admin] No matching schedules found for student ${newStudent._id} based on their class details and semester.`);
            }
        } catch (enrollError) {
            console.error(`[Admin] Error during automatic schedule enrollment for student ${newStudent._id}:`, enrollError);
        }

        res.status(201).json({ success: true, message: `Student Added`, student: newStudent });
    } catch (error) {
        console.error("Detailed error in addStudent:", error);
        if (error.name === "ValidationError") {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ success: false, message: "Validation error", errors });
        }
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "RFID Already Used.", details: error.keyValue });
        }
        res.status(500).json({ success: false, message: "Internal server error during student creation.", fullError: error.message });
    }
};

const addTeacher = async (req, res) => {
    try {
        const { code, firstName, middleName, lastName, email, password, number, address } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        if (!firstName || !lastName || !email || !password || !number || !code) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Please enter a strong password" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const userData = {
            code,
            firstName,
            middleName,
            lastName,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            address,
            date: Date.now()
        };

        const newTeacher = new teacherModel(userData);
        await newTeacher.save();
        res.status(201).json({ success: true, message: `Teacher Added` });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ success: false, message: 'Validation error', errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllUsers = async (req, res, Model, userType) => {
    try {
        const users = await Model.find({}).select('-password');
        res.status(200).json({ success: true, [userType]: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const allStudents = async (req, res) => {
    getAllUsers(req, res, studentModel, 'students');
};

const allTeachers = async (req, res) => {
    getAllUsers(req, res, teacherModel, 'teachers');
};


const getStudentByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const student = await studentModel.findOne({ code }).select('-password');

        if (student) {
            res.status(200).json({ success: true, student });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const adminDashboard = async (req, res) => {
    try {
        const students = await studentModel.countDocuments({});
        const teachers = await teacherModel.countDocuments({});

        const dashData = {
            students,
            teachers,
        };

        res.status(200).json({ success: true, dashData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserByCode = async (req, res) => {
    const { code } = req.params;

    try {
        let user = await studentModel.findOne({ code }).select('-password'); // Exclude password
        let userType = 'Student'; // Assume student first

        if (!user) {
            user = await teacherModel.findOne({ code }).select('-password'); // Exclude password
            userType = 'Teacher'; // If found in teachers, update userType
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // The logic to reset signInTime/signOutTime if it's a new day
        const today = new Date();
        const signInDate = user.signInTime ? new Date(user.signInTime) : null;

        if (signInDate && (today.getFullYear() !== signInDate.getFullYear() ||
            today.getMonth() !== signInDate.getMonth() ||
            today.getDate() !== signInDate.getDate())) {
            // Reset times for the new day
            user.signInTime = null;
            user.signOutTime = null;
            // Note: Saving the user here might be premature if the next step is sign-in/sign-out
            // which will also save. Consider if this save is always needed or if the sign-in/out
            // operation will handle updating these fields appropriately.
            // For now, keeping it as it was, but it's a point of review.
            await user.save();
        }

        // Send user and userType in the response
        res.status(200).json({ success: true, user, userType });
    } catch (error) {
        console.error("Error in getUserByCode:", error); // Log the error for debugging
        res.status(500).json({ success: false, message: "Error fetching user" });
    }
};

const deleteUser = async (req, res, model, userType) => {
    try {
        const userId = req.params.id;

        if (userType === "Student") {
            try {
                const studentObjectId = new mongoose.Types.ObjectId(userId);
                const schedulesToUpdate = await scheduleModel.find({ enrolledStudents: studentObjectId });

                if (schedulesToUpdate.length > 0) {
                    for (const schedule of schedulesToUpdate) {
                        schedule.enrolledStudents.pull(studentObjectId);
                        await schedule.save();
                    }
                    console.log(`[Admin] Student ${userId} automatically unenrolled from ${schedulesToUpdate.length} schedules.`);
                }
            } catch (unenrollError) {
                console.error(`[Admin] Error during automatic schedule unenrollment for student ${userId}:`, unenrollError);
            }
        } else if (userType === "Teacher") {
            try {
                const teacherObjectId = new mongoose.Types.ObjectId(userId);
                const schedulesAssignedToTeacher = await scheduleModel.find({ teacherId: teacherObjectId });

                if (schedulesAssignedToTeacher.length > 0) {
                    for (const schedule of schedulesAssignedToTeacher) {
                        schedule.teacherId = null;
                        await schedule.save();
                    }
                    console.log(`[Admin] Teacher ${userId} unassigned from ${schedulesAssignedToTeacher.length} schedules.`);
                }
            } catch (teacherUnassignError) {
                console.error(`[Admin] Error during unassigning teacher ${userId} from schedules:`, teacherUnassignError);
            }
        }

        const deletedUser = await model.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: `${userType} not found` });
        }

        res.status(200).json({ success: true, message: `${userType} deleted successfully` });
    } catch (error) {
        console.error(`[Admin] Error deleting ${userType} ${req.params.id}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUser = async (req, res, model, userType) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        const updatedUser = await model.findByIdAndUpdate(userId, updatedData, {
            new: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: `${userType} not found` });
        }

        res.status(200).json({ success: true, [userType.toLowerCase()]: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTeacher = async (req, res) => {
    deleteUser(req, res, teacherModel, "Teacher");
};

const updateTeacher = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        console.log("Raw request body:", req.body);

        if (!updatedData.firstName || !updatedData.lastName || !updatedData.email) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            updatedData.image = imageUpload.secure_url;
        }

        const updatedTeacher = await teacherModel.findByIdAndUpdate(userId, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedTeacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        console.log("Updated teacher:", updatedTeacher);

        res.status(200).json({ success: true, teacher: updatedTeacher });
    } catch (error) {
        console.error("Error in updateTeacher:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteStudent = async (req, res) => {
    deleteUser(req, res, studentModel, "Student");
};

const updateStudent = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        if (updatedData.semesterDates) {
            if (!updatedData.semesterDates.start || !updatedData.semesterDates.end) {
                return res.status(400).json({
                    success: false,
                    message: "Both start and end dates are required for semesterDates",
                });
            }
            updatedData.semesterDates.start = new Date(updatedData.semesterDates.start);
            updatedData.semesterDates.end = new Date(updatedData.semesterDates.end);
        }

        const updatedStudent = await studentModel.findByIdAndUpdate(userId, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({ success: true, student: updatedStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getAttendanceByDate = async (req, res) => {
    try {
        const date = new Date(req.query.date);

        if (isNaN(date.getTime())) {
            return res.status(400).json({ message: 'Invalid date format.  Please use ISO format.' });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await Attendance.find({
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        }).populate({
            path: 'user',
            select: 'firstName lastName middleName studentNumber position gradeYearLevel section',
        });

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAttendanceRecords = async (req, res) => {
    try {
        const { date, userType } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        const isoDate = new Date(date);
        if (isNaN(isoDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format" });
        }

        const startOfDay = new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate());
        const endOfDay = new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate() + 1);

        let query = {
            timestamp: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        };

        if (userType) {
            query['userType'] = userType;
        }

        const attendanceRecords = await attendanceModel.find(query).populate({
            path: 'user',
            select: 'firstName lastName middleName studentNumber position',
        });

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(200).json({ success: true, attendanceRecords: [] });
        }

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// --- Subject Management ---

const createSubject = async (req, res) => {
    try {
        const { name, code, semesterId } = req.body;

        if (!name || !code) {
            return res.status(400).json({ success: false, message: 'Subject name and code are required' });
        }

        const subjectExists = await subjectModel.findOne({ code });
        if (subjectExists) {
            return res.status(400).json({ success: false, message: 'Subject with this code already exists' });
        }

        const subjectData = { name, code };
        if (semesterId) {
            subjectData.semesterId = semesterId;
        }

        const subject = await subjectModel.create(subjectData);
        res.status(201).json({ success: true, message: 'Subject created successfully', subject });
    } catch (error) {
        console.error("Error creating subject:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error when creating subject' });
    }
};

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await subjectModel.find({}).populate('semesterId', 'name year');
        res.status(200).json({ success: true, subjects });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error when fetching subjects' });
    }
};

const getSubjectById = async (req, res) => {
    try {
        const subject = await subjectModel.findById(req.params.id).populate('semesterId', 'name year');
        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.status(200).json({ success: true, subject });
    } catch (error) {
        console.error("Error fetching subject by ID:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Subject not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server Error when fetching subject by ID' });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { name, code, semesterId } = req.body;
        const subjectId = req.params.id;

        const subject = await subjectModel.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        if (code && code !== subject.code) {
            const subjectWithNewCodeExists = await subjectModel.findOne({ code });
            if (subjectWithNewCodeExists && subjectWithNewCodeExists._id.toString() !== subjectId) {
                return res.status(400).json({ success: false, message: 'Another subject with this code already exists' });
            }
        }

        subject.name = name || subject.name;
        subject.code = code || subject.code;
        if (req.body.hasOwnProperty('semesterId')) {
            subject.semesterId = semesterId;
        }

        const updatedSubject = await subject.save();
        res.status(200).json({ success: true, message: 'Subject updated successfully', subject: updatedSubject });
    } catch (error) {
        console.error("Error updating subject:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Subject not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server Error when updating subject' });
    }
};

const deleteSubjectAdmin = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const subject = await subjectModel.findById(subjectId);

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        const schedulesUsingSubject = await scheduleModel.findOne({ subjectId: subjectId });
        if (schedulesUsingSubject) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete subject. It is currently assigned to one or more schedules. Please remove it from schedules first.'
            });
        }

        await subject.deleteOne();
        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        console.error("Error deleting subject:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Subject not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server Error when deleting subject' });
    }
};

// --- Schedule Management ---

const createSchedule = async (req, res) => {
    try {
        const { subjectId, teacherId, section, gradeYearLevel, educationLevel, dayOfWeek, startTime, endTime, semester } = req.body;

        if (!subjectId || !teacherId || !section || !gradeYearLevel || !educationLevel || !startTime || !endTime || !semester ||
            !dayOfWeek || !Array.isArray(dayOfWeek) || dayOfWeek.length === 0) {
            return res.status(400).json({ success: false, message: 'All schedule fields are required, and dayOfWeek must be a non-empty array.' });
        }

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (const day of dayOfWeek) {
            if (!validDays.includes(day)) {
                return res.status(400).json({ success: false, message: `Invalid day provided: ${day}.` });
            }
        }

        const teacher = await teacherModel.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Assigned teacher not found' });
        }

        const subject = await subjectModel.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ success: false, message: 'Assigned subject not found' });
        }

        const newSchedule = await scheduleModel.create({
            subjectId,
            teacherId,
            section,
            gradeYearLevel,
            educationLevel,
            dayOfWeek,
            startTime,
            endTime,
            semester
        });

        if (newSchedule && teacher) {
            if (!teacher.schedules.includes(newSchedule._id)) {
                teacher.schedules.push(newSchedule._id);
                await teacher.save();
            }
        }

        try {
            const matchingStudents = await studentModel.find({
                educationLevel: newSchedule.educationLevel,
                gradeYearLevel: newSchedule.gradeYearLevel,
                section: newSchedule.section,
                semester: newSchedule.semester
            });

            if (matchingStudents.length > 0) {
                const studentIdsForSchedule = [];
                for (const student of matchingStudents) {
                    if (!student.enrolledSchedules.includes(newSchedule._id)) {
                        student.enrolledSchedules.push(newSchedule._id);
                        await student.save();
                    }
                    studentIdsForSchedule.push(student._id);
                }

                newSchedule.enrolledStudents = studentIdsForSchedule;
                await newSchedule.save();
                console.log(`[Admin] Automatically enrolled ${matchingStudents.length} students into new schedule ${newSchedule._id}.`);
            } else {
                console.log(`[Admin] No existing students found matching the criteria for new schedule ${newSchedule._id}.`);
            }
        } catch (autoEnrollError) {
            console.error(`[Admin] Error during automatic student enrollment for new schedule ${newSchedule._id}:`, autoEnrollError);
        }

        res.status(201).json({ success: true, message: 'Schedule created successfully', schedule: newSchedule });
    } catch (error) {
        console.error("Error creating schedule:", error);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: 'Validation error: ' + error.message, errors: error.errors });
        }
        res.status(500).json({ success: false, message: error.message || 'Server Error when creating schedule' });
    }
};

const addSchedule = async (req, res) => {
    try {
        const { subjectId, teacherId, section, gradeYearLevel, educationLevel, dayOfWeek, startTime, endTime, semester } = req.body;

        // --- Basic Validation (add more as needed) ---
        if (!subjectId || !teacherId || !section || !gradeYearLevel || !educationLevel || !dayOfWeek || dayOfWeek.length === 0 || !startTime || !endTime || !semester) {
            return res.status(400).json({ success: false, message: "Missing required schedule details." });
        }

        // --- Create and Save New Schedule ---
        const newSchedule = new scheduleModel({
            subjectId,
            teacherId,
            section,
            gradeYearLevel,
            educationLevel,
            dayOfWeek,
            startTime,
            endTime,
            semester
            // enrolledStudents will be populated next
        });
        await newSchedule.save();
        console.log(`[Admin] New schedule ${newSchedule._id} created.`);

        // --- Automatically Enroll Matching Students ---
        try {
            const matchingStudents = await studentModel.find({
                educationLevel: newSchedule.educationLevel,
                gradeYearLevel: newSchedule.gradeYearLevel,
                section: newSchedule.section,
                semester: newSchedule.semester
            });

            if (matchingStudents.length > 0) {
                const studentIdsForSchedule = [];
                for (const student of matchingStudents) {
                    // Add schedule to student's enrolledSchedules
                    if (!student.enrolledSchedules.includes(newSchedule._id)) {
                        student.enrolledSchedules.push(newSchedule._id);
                        await student.save(); // Save each updated student
                    }
                    studentIdsForSchedule.push(student._id);
                }

                // Add students to the schedule's enrolledStudents
                newSchedule.enrolledStudents = studentIdsForSchedule;
                await newSchedule.save(); // Save schedule again with enrolled students

                console.log(`[Admin] Automatically enrolled ${matchingStudents.length} students into new schedule ${newSchedule._id}.`);
            } else {
                console.log(`[Admin] No existing students found matching the criteria for new schedule ${newSchedule._id}.`);
            }
        } catch (autoEnrollError) {
            console.error(`[Admin] Error during automatic student enrollment for new schedule ${newSchedule._id}:`, autoEnrollError);
            // Decide on error handling: proceed with schedule creation or return an error
            // For now, we log and the schedule is still considered created.
        }
        // --- End Automatic Enrollment ---

        res.status(201).json({ success: true, message: "Schedule created successfully and matching students enrolled.", schedule: newSchedule });

    } catch (error) {
        console.error("[Admin] Error in addSchedule:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "Validation error creating schedule.", errors: error.errors });
        }
        res.status(500).json({ success: false, message: "Internal server error while creating schedule." });
    }
};

const getAllSchedules = async (req, res) => {
    try {
        const schedules = await scheduleModel.find({})
            .populate('subjectId', 'name code')
            .populate('teacherId', 'firstName lastName code');
        res.status(200).json({ success: true, schedules });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error when fetching schedules' });
    }
};

const getScheduleById = async (req, res) => {
    try {
        const schedule = await scheduleModel.findById(req.params.id)
            .populate('subjectId', 'name code')
            .populate('teacherId', 'firstName lastName code');
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        res.status(200).json({ success: true, schedule });
    } catch (error) {
        console.error("Error fetching schedule by ID:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Schedule not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server Error when fetching schedule by ID' });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const updates = req.body;

        const currentSchedule = await scheduleModel.findById(scheduleId);
        if (!currentSchedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found for update' });
        }
        const oldTeacherId = currentSchedule.teacherId;

        const updatedSchedule = await scheduleModel.findByIdAndUpdate(scheduleId, updates, { new: true, runValidators: true })
            .populate('subjectId', 'name code')
            .populate('teacherId', 'firstName lastName code');

        if (!updatedSchedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found after update attempt' });
        }

        const newTeacherId = updatedSchedule.teacherId?._id || updatedSchedule.teacherId;

        if (oldTeacherId && newTeacherId && oldTeacherId.toString() !== newTeacherId.toString()) {
            const oldTeacher = await teacherModel.findById(oldTeacherId);
            if (oldTeacher) {
                oldTeacher.schedules.pull(scheduleId);
                await oldTeacher.save();
            }

            const newTeacher = await teacherModel.findById(newTeacherId);
            if (newTeacher) {
                if (!newTeacher.schedules.includes(scheduleId)) {
                    newTeacher.schedules.push(scheduleId);
                    await newTeacher.save();
                }
            } else {
                 console.warn(`New teacher with ID ${newTeacherId} not found while updating schedule references.`);
            }
        } else if (!oldTeacherId && newTeacherId) {
            const newTeacher = await teacherModel.findById(newTeacherId);
            if (newTeacher) {
                if (!newTeacher.schedules.includes(scheduleId)) {
                    newTeacher.schedules.push(scheduleId);
                    await newTeacher.save();
                }
            }
        } else if (oldTeacherId && !newTeacherId) {
             const oldTeacher = await teacherModel.findById(oldTeacherId);
            if (oldTeacher) {
                oldTeacher.schedules.pull(scheduleId);
                await oldTeacher.save();
            }
        }

        res.status(200).json({ success: true, message: 'Schedule updated successfully', schedule: updatedSchedule });
    } catch (error) {
        console.error("Error updating schedule:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Schedule not found (invalid ID format)' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation error: ' + error.message, errors: error.errors });
       }
        res.status(500).json({ success: false, message: error.message || 'Server Error when updating schedule' });
    }
};

const deleteScheduleAdmin = async (req, res) => {
    try {
        const scheduleId = req.params.id;

        const scheduleToDelete = await scheduleModel.findById(scheduleId);

        if (!scheduleToDelete) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        const teacherId = scheduleToDelete.teacherId;

        const schedule = await scheduleModel.findByIdAndDelete(scheduleId);

        if (schedule && teacherId) {
            const teacher = await teacherModel.findById(teacherId);
            if (teacher) {
                teacher.schedules.pull(scheduleId);
                await teacher.save();
            }
        }

        res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Schedule not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server Error when deleting schedule' });
    }
};

// --- Analytics Helper ---
const getAnalyticsDateRange = (periodQuery, customStartDate, customEndDate) => {
    const now = new Date();
    let startDate, endDateRes;

    if (customStartDate && customEndDate && isValid(parseISO(customStartDate)) && isValid(parseISO(customEndDate))) {
        startDate = parseISO(customStartDate);
        endDateRes = parseISO(customEndDate);
    } else {
        endDateRes = endOfMonth(now);
        switch (periodQuery) {
            case 'last7days':
                startDate = new Date(new Date().setDate(now.getDate() - 7));
                endDateRes = new Date();
                break;
            case 'last30days':
                startDate = new Date(new Date().setDate(now.getDate() - 30));
                endDateRes = new Date();
                break;
            case 'last6months':
                startDate = startOfMonth(subMonths(now, 5));
                break;
            case 'last12months':
                startDate = startOfMonth(subMonths(now, 11));
                break;
            case 'thisMonth':
                startDate = startOfMonth(now);
                break;
            default:
                startDate = new Date(new Date().setDate(now.getDate() - 30));
                endDateRes = new Date();
                break;
        }
    }
    return {
        startDate: new Date(startDate.setHours(0, 0, 0, 0)),
        endDate: new Date(endDateRes.setHours(23, 59, 59, 999))
    };
};


// --- Analytics Controllers ---
const getAnalyticsSummary = async (req, res) => {
    try {
        const { period = 'last30days', startDate: customStartDateQuery, endDate: customEndDateQuery } = req.query;
        const { startDate, endDate } = getAnalyticsDateRange(period, customStartDateQuery, customEndDateQuery);

        const totalStudents = await studentModel.countDocuments();
        const totalTeachers = await teacherModel.countDocuments();
        const totalUsers = totalStudents + totalTeachers;

        const allStudentDocs = await studentModel.find({}, '_id').lean();
        const allTeacherDocs = await teacherModel.find({}, '_id').lean();
        const validStudentIds = new Set(allStudentDocs.map(s => s._id.toString()));
        const validTeacherIds = new Set(allTeacherDocs.map(t => t._id.toString()));

        const signInUserIdsFromAttendance = await attendanceModel.find({
            eventType: 'sign-in',
            timestamp: { $gte: startDate, $lte: endDate }
        }).distinct('user');

        const validSignInUserIds = signInUserIdsFromAttendance.filter(userId =>
            validStudentIds.has(userId.toString()) || validTeacherIds.has(userId.toString())
        );

        const uniqueActiveUsers = validSignInUserIds.length;
        const overallActivityRate = totalUsers > 0 ? (uniqueActiveUsers / totalUsers) * 100 : 0;

        const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate > new Date() ? new Date() : endDate });
        let dailyAttendanceRatesSum = 0;
        let daysWithAttendanceData = 0;

        for (const day of daysInPeriod) {
            const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
            const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);

            const dailySignInUserIdsFromAttendance = await attendanceModel.find({
                eventType: 'sign-in',
                timestamp: { $gte: dayStart, $lte: dayEnd }
            }).distinct('user');

            const validDailySignInUserIds = dailySignInUserIdsFromAttendance.filter(userId =>
                validStudentIds.has(userId.toString()) || validTeacherIds.has(userId.toString())
            );

            if (totalUsers > 0) {
                const dailyRate = (validDailySignInUserIds.length / totalUsers) * 100;
                dailyAttendanceRatesSum += dailyRate;
            }
            daysWithAttendanceData++;
        }
        
        const averageDailyAttendanceRate = daysWithAttendanceData > 0 ? dailyAttendanceRatesSum / daysWithAttendanceData : 0;

        res.status(200).json({
            success: true,
            summary: {
                totalUsers,
                activeTeachers: totalTeachers,
                activeStudents: totalStudents,
                overallActivityRate: parseFloat(overallActivityRate.toFixed(2)),
                averageDailyAttendanceRate: parseFloat(averageDailyAttendanceRate.toFixed(2)),
                period: {
                    startDate: formatISO(startDate, { representation: 'date' }),
                    endDate: formatISO(endDate, { representation: 'date' })
                }
            }
        });

    } catch (error) {
        console.error("Error in getAnalyticsSummary:", error);
        res.status(500).json({ success: false, message: error.message || "Server error fetching analytics summary" });
    }
};

const getUserGrowthStats = async (req, res) => {
    try {
        const { period = 'last6months', startDate: customStartDateQuery, endDate: customEndDateQuery } = req.query;
        console.log('[Analytics] getUserGrowthStats query:', { period, customStartDateQuery, customEndDateQuery });

        const { startDate, endDate } = getAnalyticsDateRange(period, customStartDateQuery, customEndDateQuery);
        console.log('[Analytics] getUserGrowthStats date range:', { startDate, endDate });

        const dataKeyName = "date";
        const isDaily = true;

        const groupByFormat = { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" }, 
            day: { $dayOfMonth: "$createdAt" } 
        };
        const projectFormat = {
            $concat: [
                { $toString: "$_id.year" }, "-",
                { $toString: "$_id.month" }, "-",
                { $toString: "$_id.day" }
            ]
        };
        
        console.log('[Analytics] getUserGrowthStats (Forced Daily) dataKeyName:', dataKeyName);

        const studentGrowth = await studentModel.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: groupByFormat, newStudents: { $sum: 1 } } },
            { $project: { _id: 0, [dataKeyName]: projectFormat, newStudents: 1 } },
            { $sort: { [dataKeyName]: 1 } }
        ]);
        console.log('[Analytics] studentGrowth result:', JSON.stringify(studentGrowth));

        const teacherGrowth = await teacherModel.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: groupByFormat, newTeachers: { $sum: 1 } } },
            { $project: { _id: 0, [dataKeyName]: projectFormat, newTeachers: 1 } },
            { $sort: { [dataKeyName]: 1 } }
        ]);
        console.log('[Analytics] teacherGrowth result:', JSON.stringify(teacherGrowth));

        const growthDataMap = new Map();
        
        studentGrowth.forEach(item => {
            const key = item[dataKeyName]; 
            if (!key) {
                console.error('[Analytics] ERROR: studentGrowth item missing key for dataKeyName:', dataKeyName, 'Item:', item);
                return;
            }
            let formattedKey;
            try {
                const [year, monthNum, dayNum] = String(key).split('-').map(Number);
                formattedKey = `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            } catch (e) {
                console.error('[Analytics] ERROR: Formatting key failed for studentGrowth. Key:', key, 'Error:', e);
                return;
            }

            if (!growthDataMap.has(formattedKey)) growthDataMap.set(formattedKey, { [dataKeyName]: formattedKey, newStudents: 0, newTeachers: 0 });
            growthDataMap.get(formattedKey).newStudents = item.newStudents;
        });

        teacherGrowth.forEach(item => {
            const key = item[dataKeyName];
            if (!key) {
                console.error('[Analytics] ERROR: teacherGrowth item missing key for dataKeyName:', dataKeyName, 'Item:', item);
                return;
            }
            let formattedKey;
            try {
                const [year, monthNum, dayNum] = String(key).split('-').map(Number);
                formattedKey = `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            } catch (e) {
                console.error('[Analytics] ERROR: Formatting key failed for teacherGrowth. Key:', key, 'Error:', e);
                return;
            }

            if (!growthDataMap.has(formattedKey)) growthDataMap.set(formattedKey, { [dataKeyName]: formattedKey, newStudents: 0, newTeachers: 0 });
            growthDataMap.get(formattedKey).newTeachers = item.newTeachers;
        });
        console.log('[Analytics] growthDataMap after processing student/teacher growth:', JSON.stringify(Array.from(growthDataMap.entries())));

        const intervalPoints = eachDayOfInterval({ start: startDate, end: endDate });

        console.log(`[Analytics] Interval generation: Number of interval points: ${intervalPoints.length}`);
        intervalPoints.forEach((pointInTime) => {
            const keyToFill = formatISO(pointInTime, { representation: 'date' }); 
            
            if (!growthDataMap.has(keyToFill)) {
                growthDataMap.set(keyToFill, { [dataKeyName]: keyToFill, newStudents: 0, newTeachers: 0 });
            }
        });

        console.log('[Analytics] growthDataMap after filling interval days:', JSON.stringify(Array.from(growthDataMap.entries())));

        const combinedGrowth = Array.from(growthDataMap.values()).map(item => ({
            ...item,
            totalNewUsers: (item.newStudents || 0) + (item.newTeachers || 0)
        })).sort((a,b) => {
            const valA = a[dataKeyName] || ""; 
            const valB = b[dataKeyName] || ""; 
            return valA.localeCompare(valB);
        });

        console.log('[Analytics] getUserGrowthStats combinedGrowth:', JSON.stringify(combinedGrowth, null, 2));
        console.log('[Analytics] getUserGrowthStats response granularity: daily'); 
        
        res.status(200).json({
            success: true,
            userGrowth: combinedGrowth,
            period: {
                startDate: formatISO(startDate, { representation: 'date' }),
                endDate: formatISO(endDate, { representation: 'date' })
            },
            granularity: 'daily'
        });
    } catch (error) {
        console.error("Error in getUserGrowthStats:", error);
        res.status(500).json({ success: false, message: error.message || "Server error fetching user growth statistics" });
    }
};

const getAttendanceStatsByEducationLevel = async (req, res) => {
    try {
        const { period = 'last30days', startDate: customStartDate, endDate: customEndDate } = req.query;
        const { startDate, endDate } = getAnalyticsDateRange(period, customStartDate, customEndDate);

        const educationLevels = await studentModel.distinct('educationLevel', { educationLevel: { $ne: null, $ne: "" } });
        const attendanceByLevel = [];

        for (const level of educationLevels) {
            const totalStudentsInLevel = await studentModel.countDocuments({ educationLevel: level });

            if (totalStudentsInLevel === 0) {
                attendanceByLevel.push({ educationLevel: level, activityRate: 0, averageDailyAttendanceRate: 0, totalStudents: 0 });
                continue;
            }
            
            const activeStudentRecords = await attendanceModel.aggregate([
                { $match: { eventType: 'sign-in', userType: 'Student', timestamp: { $gte: startDate, $lte: endDate } }},
                { $lookup: { from: 'students', localField: 'user', foreignField: '_id', as: 'studentInfo' }},
                { $unwind: '$studentInfo' },
                { $match: { 'studentInfo.educationLevel': level } },
                { $group: { _id: '$user' } },
                { $count: 'uniqueActiveStudents' }
            ]);
            
            const uniqueActiveStudentsInLevel = activeStudentRecords.length > 0 ? activeStudentRecords[0].uniqueActiveStudents : 0;
            const activityRate = (uniqueActiveStudentsInLevel / totalStudentsInLevel) * 100;

            const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate > new Date() ? new Date() : endDate });
            let dailyRatesSumForLevel = 0;
            let daysWithDataForLevel = 0;

            for (const day of daysInPeriod) {
                const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0,0,0,0);
                const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23,59,59,999);

                const dailySignInsForLevel = await attendanceModel.aggregate([
                    { $match: { eventType: 'sign-in', userType: 'Student', timestamp: { $gte: dayStart, $lte: dayEnd } }},
                    { $lookup: { from: 'students', localField: 'user', foreignField: '_id', as: 'studentInfo' }},
                    { $unwind: '$studentInfo' },
                    { $match: { 'studentInfo.educationLevel': level } },
                    { $group: { _id: '$user' } }, { $count: 'count' }
                ]);
                
                const uniqueSignInsTodayForLevel = dailySignInsForLevel.length > 0 ? dailySignInsForLevel[0].count : 0;
                if (totalStudentsInLevel > 0) {
                     dailyRatesSumForLevel += (uniqueSignInsTodayForLevel / totalStudentsInLevel) * 100;
                }
                daysWithDataForLevel++;
            }

            const averageDailyAttendanceRateForLevel = daysWithDataForLevel > 0 ? dailyRatesSumForLevel / daysWithDataForLevel : 0;

            attendanceByLevel.push({
                educationLevel: level,
                activityRate: parseFloat(activityRate.toFixed(2)),
                averageDailyAttendanceRate: parseFloat(averageDailyAttendanceRateForLevel.toFixed(2)),
                totalStudents: totalStudentsInLevel,
                uniqueActiveStudents: uniqueActiveStudentsInLevel
            });
        }

        res.status(200).json({
            success: true,
            attendanceByEducationLevel: attendanceByLevel,
            period: {
                startDate: formatISO(startDate, { representation: 'date' }),
                endDate: formatISO(endDate, { representation: 'date' })
            }
        });

    } catch (error) {
        console.error("Error in getAttendanceStatsByEducationLevel:", error);
        res.status(500).json({ success: false, message: error.message || "Server error fetching attendance stats by education level" });
    }
};

const getDailySignInStats = async (req, res) => {
    try {
        const { period = 'last30days', startDate: customStartDateQuery, endDate: customEndDateQuery } = req.query;
        console.log('[Analytics] getDailySignInStats query:', { period, customStartDateQuery, customEndDateQuery });

        const { startDate, endDate } = getAnalyticsDateRange(period, customStartDateQuery, customEndDateQuery);
        console.log('[Analytics] getDailySignInStats date range:', { startDate, endDate });

        const dailySignInsAgg = await attendanceModel.aggregate([
            {
                $match: {
                    eventType: 'sign-in',
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" },
                        user: "$user"
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: "$_id.year",
                        month: "$_id.month",
                        day: "$_id.day"
                    },
                    signInCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $concat: [
                            { $toString: "$_id.year" }, "-",
                            { $toString: "$_id.month" }, "-",
                            { $toString: "$_id.day" }
                        ]
                    },
                    signInCount: 1
                }
            },
            { $sort: { date: 1 } }
        ]);
        console.log('[Analytics] dailySignInsAgg result:', JSON.stringify(dailySignInsAgg));

        const signInDataMap = new Map();
        dailySignInsAgg.forEach(item => {
            const key = item.date;
            if (!key) {
                console.error('[Analytics] ERROR: dailySignInsAgg item missing key for date. Item:', item);
                return;
            }
            let formattedKey;
            try {
                const [year, monthNum, dayNum] = String(key).split('-').map(Number);
                formattedKey = `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            } catch (e) {
                console.error('[Analytics] ERROR: Formatting key failed for dailySignInsAgg. Key:', key, 'Error:', e);
                return;
            }
            signInDataMap.set(formattedKey, { date: formattedKey, signInCount: item.signInCount });
        });

        const intervalPoints = eachDayOfInterval({ start: startDate, end: endDate });
        console.log(`[Analytics] Daily Sign-Ins: Number of interval points: ${intervalPoints.length}`);

        intervalPoints.forEach((pointInTime) => {
            const keyToFill = formatISO(pointInTime, { representation: 'date' });
            if (!signInDataMap.has(keyToFill)) {
                signInDataMap.set(keyToFill, { date: keyToFill, signInCount: 0 });
            }
        });

        const dailySignInsData = Array.from(signInDataMap.values()).sort((a, b) => {
            return (a.date || "").localeCompare(b.date || "");
        });

        console.log('[Analytics] getDailySignInStats dailySignInsData:', JSON.stringify(dailySignInsData, null, 2));
        
        res.status(200).json({
            success: true,
            dailySignIns: dailySignInsData,
            period: {
                startDate: formatISO(startDate, { representation: 'date' }),
                endDate: formatISO(endDate, { representation: 'date' })
            },
            granularity: 'daily'
        });

    } catch (error) {
        console.error("Error in getDailySignInStats:", error);
        res.status(500).json({ success: false, message: error.message || "Server error fetching daily sign-in statistics" });
    }
};

export {
    addSchedule, addStudent,
    addTeacher,
    adminDashboard,
    adminSignIn,
    adminSignOut,
    allStudents,
    allTeachers, createSchedule, createSubject, deleteScheduleAdmin, deleteStudent, deleteSubjectAdmin, deleteTeacher, getAllSchedules, getAllSubjects, getAnalyticsDateRange, getAnalyticsSummary, getAttendanceByDate,
    getAttendanceRecords, getAttendanceStatsByEducationLevel, getDailySignInStats,
    getScheduleById, getStudentByCode, getSubjectById, getUserByCode, getUserGrowthStats, loginAdmin, updateSchedule, updateStudent, updateSubject, updateTeacher
};

