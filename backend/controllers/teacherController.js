import bcrypt from "bcrypt";
import { validationResult } from 'express-validator';
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import cloudinary from "../config/cloudinary.js";
import attendanceModel from "../models/attendanceModel.js";
import scheduleModel from "../models/scheduleModel.js"; // Import scheduleModel
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

const excludedFields = ['-password', '-email']; // email might be needed for some contexts, consider if it should always be excluded

const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) { // Added email check
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        const user = await teacherModel.findOne({ email }).select('+password').lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: 'teacher' }, process.env.JWT_SECRET);
        // Exclude password from user object returned to frontend if any
        const { password: _, ...userWithoutPassword } = user;

        res.json({ success: true, token, user: userWithoutPassword }); // Optionally return user data
    } catch (error) {
        console.error("Login Teacher Error:", error);
        res.status(500).json({ success: false, message: "An error occurred during login." });
    }
};

const logoutTeacher = async (req, res) => {
    try {
        // In a stateless JWT setup, logout is typically handled client-side by deleting the token.
        // If you have a token blocklist or session management server-side, implement that here.
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Teacher Error:", error);
        res.status(500).json({ success: false, message: "An error occurred during logout." });
    }
};

const teacherList = async (req, res) => {
    try {
        const teachers = await teacherModel.find({}).select(excludedFields).lean();
        res.json({ success: true, teachers });
    } catch (error) {
        console.error("Teacher List Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch teachers." });
    }
};

const teacherProfile = async (req, res) => {
    try {
        const teacherId = req.teacher.id; // Assuming req.teacher.id is set by auth middleware

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
        }

        const profileData = await teacherModel.findById(teacherId)
            .select('-password')
            .populate({
                path: 'schedules', // Populate the schedules array
                populate: {
                    path: 'subjectId', // Populate subject details within each schedule
                    select: 'name code'
                }
            })
            .lean();

        if (!profileData) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.json({ success: true, profileData });
    } catch (error) {
        console.error("Teacher Profile Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch teacher profile." });
    }
};

const updateTeacherProfile = async (req, res) => {
    try {
        const { id } = req.teacher; // Assuming req.teacher.id is set by auth middleware
        const updates = req.body;

        // Remove fields that are no longer directly updatable on teacherModel
        // These are now derived from schedules or not managed here.
        delete updates.educationLevel;
        delete updates.gradeYearLevel;
        delete updates.section;
        delete updates.teachingAssignments;
        delete updates.schedules; // Schedules are managed by admin, not directly by teacher profile update

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Handle image upload if a file is present
        if (req.file) {
            try {
                const imageUpload = await cloudinary.uploader.upload(req.file.path, {
                    folder: "teacher_profiles", // Optional: organize in Cloudinary
                    resource_type: "image"
                });
                updates.image = imageUpload.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ success: false, message: "Image upload failed." });
            }
        } else if (updates.image === undefined || updates.image === null || updates.image === '') {
            // If image is explicitly set to empty or not provided, allow it to be cleared or unchanged
            // If you want to prevent clearing, add specific logic here.
            // For now, if updates.image is not in req.body, it won't be updated unless it's undefined/null to clear.
            if (updates.image === null || updates.image === '') delete updates.image; // Allow clearing
        }


        const updatedTeacher = await teacherModel.findByIdAndUpdate(id, { $set: updates }, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!updatedTeacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', teacher: updatedTeacher });

    } catch (error) {
        console.error("Update Teacher Profile Error:", error);
        if (error.code === 11000) { // Handle duplicate key errors (e.g., email, code)
            return res.status(400).json({ success: false, message: "Update failed. RFID value for unique field.", field: error.keyValue });
        }
        res.status(500).json({ success: false, message: "Failed to update profile." });
    }
};

const getStudentsBySchedule = async (req, res) => {
    console.log("<<<<< ENTERED getStudentsBySchedule >>>>>");
    try {
        const { scheduleId } = req.params;
        const { date, startDate, endDate } = req.query;

        if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
            return res.status(400).json({ success: false, message: "Invalid schedule ID" });
        }

        let startQueryDate;
        let endQueryDate;
        let isDateRange = false;

        if (date) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).json({ success: false, message: "Date parameter requires YYYY-MM-DD format" });
            }
            startQueryDate = new Date(`${date}T00:00:00.000Z`);
            endQueryDate = new Date(`${date}T23:59:59.999Z`);
        } else if (startDate && endDate) {
            isDateRange = true;
            if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                return res.status(400).json({ success: false, message: "startDate and endDate parameters require YYYY-MM-DD format" });
            }
            startQueryDate = new Date(`${startDate}T00:00:00.000Z`);
            endQueryDate = new Date(`${endDate}T23:59:59.999Z`);
        } else {
            return res.status(400).json({ success: false, message: "Either 'date' or both 'startDate' and 'endDate' query parameters are required (YYYY-MM-DD)" });
        }

        if (isNaN(startQueryDate.getTime()) || isNaN(endQueryDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date provided" });
        }

        const schedule = await scheduleModel.findById(scheduleId).lean();
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        const { educationLevel, gradeYearLevel, section } = schedule;
        if (!educationLevel || !gradeYearLevel || !section) {
            return res.status(404).json({ success: false, message: "Schedule details (educationLevel, gradeYearLevel, section) are incomplete." });
        }

        const students = await studentModel.find({
            educationLevel,
            gradeYearLevel,
            section,
        }).lean();
        const studentIds = students.map((student) => student._id);

        const attendanceQuery = {
            user: { $in: studentIds },
            timestamp: { $gte: startQueryDate, $lte: endQueryDate },
        };
        const attendanceRecords = await attendanceModel.find(attendanceQuery).lean();

        console.log("Schedule ID:", scheduleId);
        console.log("Query Start Date (UTC):", startQueryDate.toISOString());
        console.log("Query End Date (UTC):", endQueryDate.toISOString());
        console.log("Students Found:", students.length);
        console.log("Attendance Records Found:", attendanceRecords.length);

        const studentsWithAttendance = students.map((student) => {
            const studentAttendance = attendanceRecords.filter(
                (record) => record.user.toString() === student._id.toString()
            );
            studentAttendance.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            if (isDateRange) {
                return {
                    ...student,
                    attendanceInRange: studentAttendance,
                };
            } else {
                const signInRecord = studentAttendance.find((record) => record.eventType === "sign-in");
                const signOutRecord = studentAttendance.slice().reverse().find((record) => record.eventType === "sign-out");
                return {
                    ...student,
                    signInTime: signInRecord ? signInRecord.timestamp : null,
                    signOutTime: signOutRecord ? signOutRecord.timestamp : null,
                };
            }
        });

        res.status(200).json({ success: true, students: studentsWithAttendance, scheduleDetails: schedule });
    } catch (error) {
        console.error("Error fetching students by schedule:", error);
        res.status(500).json({ success: false, message: `Failed to fetch students. Error: ${error.message}` });
    }
};

const addTeacherSubjects = async (req, res) => {
    try {
        const { id } = req.teacher; // Teacher's own ID
        const { subjects } = req.body; // Expecting an array of subject strings or objects

        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ success: false, message: 'Subjects array is required.' });
        }

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Assuming teacher.subjects is an array of strings or simple objects
        // Add new subjects, avoid duplicates if they are simple strings
        subjects.forEach(subject => {
            if (typeof subject === 'string' && !teacher.subjects.includes(subject)) {
                teacher.subjects.push(subject);
            }
            // If subjects are objects, you'll need a more complex check for duplicates
        });

        await teacher.save();
        res.status(200).json({ success: true, message: 'Subjects added successfully', subjects: teacher.subjects });
    } catch (error) {
        console.error("Add Teacher Subjects Error:", error);
        res.status(500).json({ success: false, message: "Failed to add subjects." });
    }
};

const removeTeacherSubjects = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { subjectToRemove } = req.body; // Expecting a single subject string/identifier to remove

        if (!subjectToRemove) {
            return res.status(400).json({ success: false, message: 'Subject to remove is required.' });
        }

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.subjects = teacher.subjects.filter(s => s.toString() !== subjectToRemove.toString());
        await teacher.save();

        res.status(200).json({ success: true, message: 'Subject removed successfully', subjects: teacher.subjects });
    } catch (error) {
        console.error("Remove Teacher Subjects Error:", error);
        res.status(500).json({ success: false, message: "Failed to remove subject." });
    }
};

const getAttendanceByDate = async (req, res) => { // This seems like an admin/general utility
    try {
        const dateParam = req.query.date; // Expecting YYYY-MM-DD

        if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing date format. Please use YYYY-MM-DD.' });
        }

        const date = new Date(dateParam + "T00:00:00.000Z"); // Ensure UTC context for start of day

        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const attendanceRecords = await attendanceModel.find({ // Changed from Attendance to attendanceModel
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        }).populate({
            path: 'user', // Populate user details
            select: 'firstName lastName middleName code role' // Adjust fields as needed
        }).lean();

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        console.error("Get Attendance By Date Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch attendance records." });
    }
};

const getAttendanceRecords = async (req, res) => { // This also seems like an admin/general utility
    try {
        const { date, userType } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required (YYYY-MM-DD)" });
        }
         if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, message: "Date parameter requires YYYY-MM-DD format" });
        }

        const isoDate = new Date(date + "T00:00:00.000Z");

        const startOfDay = new Date(isoDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(isoDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        let query = {
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };

        if (userType) {
            query['userType'] = userType; // Ensure your attendanceModel has userType
        }

        const attendanceRecords = await attendanceModel.find(query).populate({
            path: 'user',
            select: 'firstName lastName middleName code role' // studentNumber, position might not exist on all user types
        }).lean();

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        console.error("Get Attendance Records Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch attendance records." });
    }
};

const getAttendance = async (req, res) => {
  const { startDate, endDate, userType } = req.query;

  try {
    if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: "startDate and endDate are required (YYYY-MM-DD)" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({ success: false, message: "Date parameters require YYYY-MM-DD format" });
    }

    const startQueryDate = new Date(startDate + "T00:00:00.000Z");
    startQueryDate.setUTCHours(0, 0, 0, 0);

    const endQueryDate = new Date(endDate + "T00:00:00.000Z");
    endQueryDate.setUTCHours(23, 59, 59, 999);

    let query = {
      timestamp: { $gte: startQueryDate, $lte: endQueryDate },
    };
    if (userType) {
        query.userType = userType;
    }

    const attendanceRecords = await attendanceModel.find(query).populate({ // Changed from Attendance to attendanceModel
        path: 'user',
        select: 'firstName lastName middleName code role'
    }).lean();

    res.status(200).json({
      success: true,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records.",
    });
  }
};

export {
    addTeacherSubjects, getAttendance, getAttendanceByDate,
    getAttendanceRecords, getStudentsBySchedule, loginTeacher,
    logoutTeacher, removeTeacherSubjects, teacherList,
    teacherProfile,
    updateTeacherProfile
};

