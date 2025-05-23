import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import attendanceModel from "../models/attendanceModel.js";
import scheduleModel from "../models/scheduleModel.js"; // Import scheduleModel
import studentModel from "../models/studentModel.js";

const handleControllerError = (res, error, message = 'An error occurred') => {
    console.error(`${message}:`, error); // Log the specific message and error
    res.status(500).json({ success: false, message: message, error: error.message });
};

// --- loginStudent ---
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

// --- studentProfile ---
const studentProfile = async (req, res) => {
    try {
        const studentId = req.student.id;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const studentDoc = await studentModel.findById(studentId).select('-password').lean();

        if (!studentDoc) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const attendanceRecords = await attendanceModel.find({ user: studentId, userType: 'Student' }).sort({ timestamp: 1 }).lean();

        const profileData = {
            ...studentDoc,
            attendance: attendanceRecords
        };

        res.json({ success: true, profileData });
    } catch (error) {
        handleControllerError(res, error, 'Error fetching student profile');
    }
};

// --- studentList ---
const studentList = async (req, res) => {
    try {
        const students = await studentModel.find({})
            .select(['-password', '-email', 'semester', 'semesterDates']) // Exclude sensitive/unneeded fields
            .lean();

        res.json({ success: true, students });
    } catch (error) {
        handleControllerError(res, error, 'Error getting student list');
    }
};

// --- updateStudentProfile ---
const updateStudentProfile = async (req, res) => {
    try {
        const { id } = req.student; // Get ID from authenticated student
        const updates = req.body;

        // Validate and convert semesterDates if provided
        if (updates.semesterDates) {
            if (!updates.semesterDates.start || !updates.semesterDates.end) {
                return res.status(400).json({
                    success: false,
                    message: "Both start and end dates are required for semesterDates",
                });
            }
            // Ensure they are Date objects
            updates.semesterDates.start = new Date(updates.semesterDates.start);
            updates.semesterDates.end = new Date(updates.semesterDates.end);
            if (isNaN(updates.semesterDates.start.getTime()) || isNaN(updates.semesterDates.end.getTime())) {
                 return res.status(400).json({ success: false, message: "Invalid date format for semesterDates" });
            }
        }

        const updatedStudent = await studentModel.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators
        }).select('-password').lean(); // Exclude password from result

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', student: updatedStudent });
    } catch (error) {
        handleControllerError(res, error, 'Error updating student profile');
    }
};

// --- getStudentsByStudent --- (Likely for finding classmates)
const getStudentsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params; // ID of the student whose classmates we want

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const student = await studentModel.findById(studentId).lean();

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const { educationLevel, gradeYearLevel, section } = student;

        // Find other students in the same class, excluding the student themselves
        const query = {
            _id: { $ne: studentId }, // Exclude the requesting student
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

// --- getStudentAttendance --- (Existing - fetches attendance based on student's semester)
const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.student.id;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const student = await studentModel.findById(studentId).select('semesterDates').lean();
        // console.log('Student:', student); // Debug log

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const semesterDates = student.semesterDates;
        // console.log('Semester Dates:', semesterDates); // Debug log

        if (!semesterDates || !semesterDates.start || !semesterDates.end) {
            return res.status(400).json({
                success: false,
                message: 'Semester dates are missing or invalid. Please contact the administrator to update the student profile.'
            });
        }

        const startDate = new Date(semesterDates.start);
        const endDate = new Date(semesterDates.end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid semester dates.' });
        }

        const attendance = await attendanceModel.find({
            user: studentId,
            userType: 'Student', // Ensure we only get student attendance
            timestamp: { $gte: startDate, $lte: endDate } // Filter by semester dates
        })
            // .populate('user', 'firstName middleName lastName educationLevel gradeYearLevel section') // Might be redundant if only fetching for self
            .sort({ timestamp: 1 }) // Sort chronologically
            .lean();

        res.json({
            success: true,
            attendance,
            semesterDates, // Include semesterDates in the response
        });
    } catch (error) {
        // Use the centralized error handler
        handleControllerError(res, error, 'Error fetching student attendance');
    }
};

// --- getStudentsBySemester --- (For admin/teacher use probably)
const getStudentsBySemester = async (req, res) => {
    try {
        const { semester } = req.params;

        if (!["1st Sem", "2nd Sem"].includes(semester)) {
            return res.status(400).json({ success: false, message: "Invalid semester value" });
        }

        const students = await studentModel.find({ semester })
            .select(['-password', '-email', 'semester', 'semesterDates']) // Select fields needed for listing
            .lean();

        if (!students || students.length === 0) {
            return res.status(404).json({ success: false, message: "No students found for the specified semester" });
        }

        res.json({ success: true, students });
    } catch (error) {
        handleControllerError(res, error, 'Error getting students by semester');
    }
};

const getStudentAttendanceProfile = async (req, res) => {
    try {
        const studentId = req.student.id;
        console.log('[AttendanceProfile] Student ID from token:', studentId);

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            console.log('[AttendanceProfile] Invalid Student ID format');
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        // Fetch the student document, ensuring enrolledSchedules is populated
        const student = await studentModel.findById(studentId)
            .select('-password') // Exclude password
            .lean();


        if (!student) {
            console.log('[AttendanceProfile] Student not found in DB for ID:', studentId);
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        console.log('[AttendanceProfile] Student data found:', JSON.stringify(student, null, 2));

        const semesterDates = student.semesterDates;
        console.log('[AttendanceProfile] Raw Semester Dates from student doc:', JSON.stringify(semesterDates, null, 2));

        let startDate, endDate;
        if (semesterDates && semesterDates.start && semesterDates.end) {
            startDate = new Date(semesterDates.start);
            endDate = new Date(semesterDates.end);

            console.log(`[AttendanceProfile] Querying for attendance with:`);
            console.log(`  User ID: ${studentId}`);
            console.log(`  Start Date (UTC): ${startDate.toISOString()}`);
            console.log(`  End Date (UTC): ${endDate.toISOString()}`);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.log('[AttendanceProfile] Invalid date conversion for semester start/end dates.');
            }
        }

        let attendance = [];
        if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const attendanceQuery = {
                user: student._id, 
                userType: 'Student',
                timestamp: {
                    $gte: startDate,
                    $lte: endDate,
                },
            };
            console.log('[AttendanceProfile] Attendance Query:', JSON.stringify(attendanceQuery, null, 2));
            attendance = await attendanceModel.find(attendanceQuery)
                .sort({ timestamp: 1 })
                .lean();
            console.log(`[AttendanceProfile] Found ${attendance.length} attendance records.`);
        } else {
            console.log('[AttendanceProfile] Skipping attendance query due to missing or invalid semester dates.');
        }
        
        let studentSchedules = [];
        if (student.enrolledSchedules && student.enrolledSchedules.length > 0) {
            // Fetch schedules where their _id is in the student's enrolledSchedules array
            studentSchedules = await scheduleModel.find({ _id: { $in: student.enrolledSchedules } })
                .populate('subjectId', 'name code') // Populate subject details
                .populate('teacherId', 'firstName lastName middleName') // Populate teacher details
                .lean();
            console.log(`[AttendanceProfile] Found ${studentSchedules.length} schedules for the student based on student.enrolledSchedules.`);
        } else {
            console.log(`[AttendanceProfile] Student has no enrolledSchedules or array is empty.`);
        }


        res.status(200).json({
            success: true,
            student: student, // student object already includes the enrolledSchedules IDs
            attendance: attendance,
            semesterDates: semesterDates || { start: null, end: null }, 
            schedules: studentSchedules, // This will now be the populated schedule details
        });

    } catch (error) {
        handleControllerError(res, error, 'Error in getStudentAttendanceProfile');
    }
};


// --- Exports ---
export {
    getStudentAttendance, getStudentAttendanceProfile, // <-- Export the new function
    getStudentsBySemester,
    getStudentsByStudent,
    loginStudent,
    studentList,
    studentProfile,
    updateStudentProfile
};

