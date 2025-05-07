import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { eachDayOfInterval, endOfMonth, formatISO, isValid, parseISO, startOfMonth, subMonths } from 'date-fns';
import jwt from "jsonwebtoken";
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
            semester = "1st Sem", // Default to "1st Sem"
            semesterDates = {
                start: new Date("2024-08-15"),
                end: new Date("2024-12-15"),
            }, // Default dates for "1st Sem"
        } = req.body;

        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        if (!studentNumber || !firstName || !lastName || !email || !password || !number || !code || !educationLevel || !gradeYearLevel || !section) {
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
            date: Date.now(),
        };

        const newStudent = new studentModel(userData);
        await newStudent.save();
        res.status(201).json({ success: true, message: `Student Added` });
    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ success: false, message: "Validation error", errors });
        }
        res.status(500).json({ success: false, message: error.message });
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
        let user = await studentModel.findOne({ code });
        if (!user) user = await teacherModel.findOne({ code });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const today = new Date();
        const signInDate = user.signInTime ? new Date(user.signInTime) : null;

        if (signInDate && (today.getFullYear() !== signInDate.getFullYear() ||
            today.getMonth() !== signInDate.getMonth() ||
            today.getDate() !== signInDate.getDate())) {
            user.signInTime = null;
            user.signOutTime = null;
            await user.save();
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user" });
    }
};

const deleteUser = async (req, res, model, userType) => {
    try {
        const userId = req.params.id;
        const deletedUser = await model.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: `${userType} not found` });
        }

        res.status(200).json({ success: true, message: `${userType} deleted successfully` });
    } catch (error) {
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

        // Validate required fields
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

        // Validate semesterDates if provided
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
            runValidators: true, // Ensure validation rules are applied
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
            select: 'firstName lastName middleName studentNumber position'
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

        // Return an empty array if no records are found
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

        if (!subjectId || !teacherId || !section || !gradeYearLevel || !educationLevel || !dayOfWeek || !startTime || !endTime || !semester) {
            return res.status(400).json({ success: false, message: 'All schedule fields are required' });
        }

        // Check if teacher exists
        const teacher = await teacherModel.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Assigned teacher not found' });
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

        // Add schedule reference to teacher
        if (newSchedule && teacher) {
            teacher.schedules.push(newSchedule._id);
            await teacher.save();
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

        // Fetch the current schedule to check old teacherId
        const currentSchedule = await scheduleModel.findById(scheduleId);
        if (!currentSchedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found for update' });
        }
        const oldTeacherId = currentSchedule.teacherId;

        const updatedSchedule = await scheduleModel.findByIdAndUpdate(scheduleId, updates, { new: true, runValidators: true })
            .populate('subjectId', 'name code')
            .populate('teacherId', 'firstName lastName code');

        if (!updatedSchedule) {
            // This case should ideally be caught by the findById above, but as a fallback
            return res.status(404).json({ success: false, message: 'Schedule not found after update attempt' });
        }

        // If teacherId has changed, update teacher documents
        const newTeacherId = updatedSchedule.teacherId?._id || updatedSchedule.teacherId; // Handle populated vs non-populated

        if (oldTeacherId && newTeacherId && oldTeacherId.toString() !== newTeacherId.toString()) {
            // Remove schedule from old teacher
            const oldTeacher = await teacherModel.findById(oldTeacherId);
            if (oldTeacher) {
                oldTeacher.schedules.pull(scheduleId);
                await oldTeacher.save();
            }

            // Add schedule to new teacher
            const newTeacher = await teacherModel.findById(newTeacherId);
            if (newTeacher) {
                if (!newTeacher.schedules.includes(scheduleId)) { // Avoid duplicates
                    newTeacher.schedules.push(scheduleId);
                    await newTeacher.save();
                }
            } else {
                 console.warn(`New teacher with ID ${newTeacherId} not found while updating schedule references.`);
            }
        } else if (!oldTeacherId && newTeacherId) { // Case: Schedule was not assigned to a teacher, but now is
            const newTeacher = await teacherModel.findById(newTeacherId);
            if (newTeacher) {
                if (!newTeacher.schedules.includes(scheduleId)) {
                    newTeacher.schedules.push(scheduleId);
                    await newTeacher.save();
                }
            }
        } else if (oldTeacherId && !newTeacherId) { // Case: Schedule was assigned, but now is not (teacherId removed)
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

        // Find the schedule to get the teacherId before deleting
        const scheduleToDelete = await scheduleModel.findById(scheduleId);

        if (!scheduleToDelete) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        const teacherId = scheduleToDelete.teacherId;

        // Delete the schedule
        const schedule = await scheduleModel.findByIdAndDelete(scheduleId);

        // If schedule was successfully deleted and had an associated teacher
        if (schedule && teacherId) {
            const teacher = await teacherModel.findById(teacherId);
            if (teacher) {
                teacher.schedules.pull(scheduleId); // Remove the scheduleId from teacher's schedules array
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
    let startDate, endDateRes; // Renamed endDate to avoid conflict with global if any

    if (customStartDate && customEndDate && isValid(parseISO(customStartDate)) && isValid(parseISO(customEndDate))) {
        startDate = parseISO(customStartDate);
        endDateRes = parseISO(customEndDate);
    } else {
        endDateRes = endOfMonth(now); // Default end date
        switch (periodQuery) {
            case 'last7days':
                startDate = new Date(new Date().setDate(now.getDate() - 7));
                endDateRes = new Date(); // today
                break;
            case 'last30days':
                startDate = new Date(new Date().setDate(now.getDate() - 30));
                endDateRes = new Date(); // today
                break;
            case 'last6months':
                startDate = startOfMonth(subMonths(now, 5));
                // endDateRes remains endOfMonth(now) or is set if custom
                break;
            case 'last12months':
                startDate = startOfMonth(subMonths(now, 11));
                // endDateRes remains endOfMonth(now) or is set if custom
                break;
            case 'thisMonth':
                startDate = startOfMonth(now);
                // endDateRes remains endOfMonth(now) or is set if custom
                break;
            default: // Default to last 30 days if period is invalid
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

        const signInRecords = await attendanceModel.find({
            eventType: 'sign-in',
            timestamp: { $gte: startDate, $lte: endDate }
        }).distinct('user');

        const uniqueActiveUsers = signInRecords.length;
        const overallActivityRate = totalUsers > 0 ? (uniqueActiveUsers / totalUsers) * 100 : 0;

        const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate > new Date() ? new Date() : endDate }); // Iterate up to today if endDate is in future
        let dailyAttendanceRatesSum = 0;
        let daysWithAttendanceData = 0;

        for (const day of daysInPeriod) {
            const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
            const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);

            const dailySignIns = await attendanceModel.find({
                eventType: 'sign-in',
                timestamp: { $gte: dayStart, $lte: dayEnd }
            }).distinct('user');

            if (totalUsers > 0) {
                const dailyRate = (dailySignIns.length / totalUsers) * 100;
                dailyAttendanceRatesSum += dailyRate;
            }
            daysWithAttendanceData++; // Count day even if no signins, for averaging
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

        // --- MODIFICATIONS START: Force daily granularity ---
        const dataKeyName = "date"; // Always use 'date' as the key name
        const isDaily = true; // Always treat as daily for output structure

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
        }; // Ensures "YYYY-M-D" format from aggregation
        
        console.log('[Analytics] getUserGrowthStats (Forced Daily) dataKeyName:', dataKeyName);
        // --- MODIFICATIONS END ---

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
                // Always format to "YYYY-MM-DD" since output is always daily
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
                // Always format to "YYYY-MM-DD"
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

        // Always use eachDayOfInterval
        const intervalPoints = eachDayOfInterval({ start: startDate, end: endDate });

        console.log(`[Analytics] Interval generation: Number of interval points: ${intervalPoints.length}`);
        intervalPoints.forEach((pointInTime) => {
            // Always format keyToFill as "YYYY-MM-DD"
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
        // Granularity is now always 'daily'
        console.log('[Analytics] getUserGrowthStats response granularity: daily'); 
        
        res.status(200).json({
            success: true,
            userGrowth: combinedGrowth,
            period: {
                startDate: formatISO(startDate, { representation: 'date' }),
                endDate: formatISO(endDate, { representation: 'date' })
            },
            granularity: 'daily' // Always respond with daily granularity
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
                        user: "$user" // Group by user first to count unique users per day
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
                    signInCount: { $sum: 1 } // Count the unique users for that day
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
    addStudent,
    addTeacher,
    adminDashboard,
    adminSignIn,
    adminSignOut,
    allStudents,
    allTeachers, createSchedule, createSubject, deleteScheduleAdmin, deleteStudent, deleteSubjectAdmin, deleteTeacher, getAllSchedules, getAllSubjects, getAnalyticsDateRange, getAnalyticsSummary, getAttendanceByDate,
    getAttendanceRecords, getAttendanceStatsByEducationLevel, getDailySignInStats, // Added getDailySignInStats
    getScheduleById, getStudentByCode, getSubjectById, getUserByCode, getUserGrowthStats, loginAdmin, updateSchedule, updateStudent, updateSubject, updateTeacher
};

