import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import attendanceModel from "../models/attendanceModel.js";
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
        // Assuming authStudent middleware adds student info to req.student
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


// --- NEW: getStudentAttendanceProfile ---
// @desc    Get student profile, semester dates, and semester attendance
// @route   GET /api/student/attendance-profile
// @access  Private (Student)
const getStudentAttendanceProfile = async (req, res) => {
    try {
        // req.student should be populated by authStudent middleware
        const studentId = req.student.id;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        // 1. Fetch student details (excluding password)
        const student = await studentModel.findById(studentId).select('-password').lean();

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // 2. Get semester dates from the student document
        const semesterDates = student.semesterDates;

        if (!semesterDates || !semesterDates.start || !semesterDates.end) {
             return res.status(400).json({
                success: false,
                message: 'Semester dates not found for the student. Please contact an administrator.'
             });
        }

        // Ensure dates are valid Date objects before querying
        const startDate = new Date(semesterDates.start);
        const endDate = new Date(semesterDates.end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid semester dates stored for the student.' });
        }

        // 3. Fetch attendance records within the semester dates
        const attendance = await attendanceModel.find({
            user: studentId,
            userType: 'Student', // Ensure it's student attendance
            timestamp: { // Assuming 'timestamp' field stores the attendance time
                $gte: startDate,
                $lte: endDate,
            },
        }).sort({ timestamp: 1 }).lean(); // Sort by date ascending

        // 4. Send combined response
        res.status(200).json({
            success: true,
            student: student, // Send student profile data
            attendance: attendance, // Send attendance records for the semester
            semesterDates: semesterDates, // Send the semester dates used
        });

    } catch (error) {
        handleControllerError(res, error, 'Error fetching student attendance profile');
    }
};


// --- Exports ---
export {
    getStudentAttendance, getStudentAttendanceProfile // <-- Export the new function
    ,

    getStudentsBySemester,
    getStudentsByStudent,
    loginStudent,
    studentList,
    studentProfile,
    updateStudentProfile
};

