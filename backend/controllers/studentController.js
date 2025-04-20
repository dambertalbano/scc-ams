import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import attendanceModel from "../models/attendanceModel.js";
import studentModel from "../models/studentModel.js";

const handleControllerError = (res, error, message = 'An error occurred') => {
    console.error(error);
    res.status(500).json({ success: false, message: message, error: error.message });
};

const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const user = await studentModel.findOne({ email }).select('+password').lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: 'student' }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        handleControllerError(res, error, "Login error");
    }
};

const studentProfile = async (req, res) => {
    try {
        const studentId = req.student.id;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const profileData = await studentModel.findById(studentId).select('-password').lean();

        if (!profileData) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, profileData });
    } catch (error) {
        handleControllerError(res, error, 'Error fetching student profile');
    }
};

const studentList = async (req, res) => {
    try {
        const students = await studentModel.find({})
            .select(['-password', '-email', 'semester', 'semesterDates'])
            .lean();

        res.json({ success: true, students });
    } catch (error) {
        handleControllerError(res, error, 'Error getting student list');
    }
};

const updateStudentProfile = async (req, res) => {
    try {
        const { id } = req.student;
        const updates = req.body;

        // Validate semesterDates if provided
        if (updates.semesterDates) {
            if (!updates.semesterDates.start || !updates.semesterDates.end) {
                return res.status(400).json({
                    success: false,
                    message: "Both start and end dates are required for semesterDates",
                });
            }
            updates.semesterDates.start = new Date(updates.semesterDates.start);
            updates.semesterDates.end = new Date(updates.semesterDates.end);
        }

        const updatedStudent = await studentModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).select('-password').lean();

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', student: updatedStudent });
    } catch (error) {
        handleControllerError(res, error, 'Error updating student profile');
    }
};

const getStudentsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const student = await studentModel.findById(studentId).lean();

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const { educationLevel, gradeYearLevel, section } = student;

        const query = {
            educationLevel: educationLevel,
            gradeYearLevel: gradeYearLevel,
            section: section
        };

        const students = await studentModel.find(query).select(['-password', '-email']).lean();

        res.json({ success: true, students });
    } catch (error) {
        handleControllerError(res, error, 'Error getting students by student');
    }
};

const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.student.id;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const attendance = await attendanceModel.find({
            user: studentId,
            userType: 'Student'
        })
            .populate('user', 'firstName middleName lastName educationLevel gradeYearLevel section')
            .sort({ timestamp: 1 })
            .lean();

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'No attendance records found for this student' });
        }

        const groupedAttendance = attendance.reduce((acc, record) => {
            const date = new Date(record.timestamp).toLocaleDateString();
            const existingRecord = acc.find(item => new Date(item.timestamp).toLocaleDateString() === date);

            if (existingRecord) {
                if (record.eventType === 'sign-in' && !existingRecord.signInTime) {
                    existingRecord.signInTime = record.timestamp;
                } else if (record.eventType === 'sign-out' && !existingRecord.signOutTime) {
                    existingRecord.signOutTime = record.timestamp;
                }
            } else {
                acc.push({
                    user: record.user,
                    date: record.timestamp,
                    signInTime: record.eventType === 'sign-in' ? record.timestamp : null,
                    signOutTime: record.eventType === 'sign-out' ? record.timestamp : null
                });
            }

            return acc;
        }, []);

        res.json({ success: true, attendance: groupedAttendance });
    } catch (error) {
        handleControllerError(res, error, 'Error getting student attendance');
    }
};

const getStudentsBySemester = async (req, res) => {
    try {
        const { semester } = req.params;

        if (!["1st Sem", "2nd Sem"].includes(semester)) {
            return res.status(400).json({ success: false, message: "Invalid semester value" });
        }

        const students = await studentModel.find({ semester })
            .select(['-password', '-email', 'semester', 'semesterDates'])
            .lean();

        if (!students || students.length === 0) {
            return res.status(404).json({ success: false, message: "No students found for the specified semester" });
        }

        res.json({ success: true, students });
    } catch (error) {
        handleControllerError(res, error, 'Error getting students by semester');
    }
};

export { getStudentAttendance, getStudentsBySemester, getStudentsByStudent, loginStudent, studentList, studentProfile, updateStudentProfile };

