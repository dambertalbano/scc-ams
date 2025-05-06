import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import validator from "validator";
import Attendance from "../models/attendanceModel.js";
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

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
    const { id } = req.params;
    const updates = req.body;

    try {
        if (!req.file) {
            if (updates.image && typeof updates.image === 'object' && Object.keys(updates.image).length === 0) {
                delete updates.image;
            }
        } else {
            try {
                const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
                updates.image = imageUpload.secure_url;
            } catch (cloudinaryError) {
                return res.status(500).json({ success: false, message: "Failed to upload image to Cloudinary" });
            }
        }

        const updatedTeacher = await teacherModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedTeacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.json({ success: true, message: 'Teacher updated successfully', teacher: updatedTeacher });

    } catch (error) {
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

export {
    addStudent,
    addTeacher,
    adminDashboard,
    adminSignIn,
    adminSignOut,
    allStudents,
    allTeachers,
    deleteStudent,
    deleteTeacher,
    getAttendanceByDate,
    getAttendanceRecords,
    getStudentByCode,
    getUserByCode,
    loginAdmin,
    updateStudent,
    updateTeacher
};
