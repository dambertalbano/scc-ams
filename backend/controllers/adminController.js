import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import validator from "validator";
import administratorModel from "../models/administratorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";
import userModel from "../models/userModel.js";
import utilityModel from "../models/utilityModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if credentials match the environment variables
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Sign the JWT with email as payload
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ success: true, token });
        }

        res.json({ success: false, message: "Invalid credentials" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API for adding Student
const addStudent = async (req, res) => {
    try {
        const { name, email, password, number, level, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !number || !level || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const studentData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            level,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newStudent = new studentModel(studentData);
        await newStudent.save();
        res.json({ success: true, message: 'Student Added' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all students list for admin panel
const allStudents = async (req, res) => {
    try {
        const students = await studentModel.find({}).select('-password');
        res.json({ success: true, students });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const students = await studentModel.find({});
        const administrators = await administratorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});

        const dashData = {
            administrators: administrators.length,
            students: students.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API for adding Administrator
const addAdministrator = async (req, res) => {
    try {
        const { name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !number || !position || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const administratorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            position,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newAdministrator = new administratorModel(administratorData);
        await newAdministrator.save();
        res.json({ success: true, message: 'Administrator Added' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all administrators list for admin panel
const allAdministrators = async (req, res) => {
    try {
        const administrators = await administratorModel.find({}).select('-password');
        res.json({ success: true, administrators });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to update Administrator details
const updateAdministrator = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        // Check if all required fields are present
        if (!name || !email || !password || !number || !position || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Find the administrator by ID
        const admin = await administratorModel.findById(id);
        if (!admin) {
            return res.json({ success: false, message: "Administrator not found" });
        }

        // Check if the email is valid
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Check for password strength and hash if it's provided
        let hashedPassword = admin.password; // Retain the old password if no new password is provided
        if (password && password.length >= 8) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Upload new image if provided
        let imageUrl = admin.image;
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        // Update the administrator
        const updatedAdministrator = await administratorModel.findByIdAndUpdate(id, {
            name,
            email,
            password: hashedPassword,
            number,
            position,
            address: JSON.parse(address),
            image: imageUrl,
        }, { new: true });

        res.json({ success: true, message: 'Administrator updated successfully', updatedAdministrator });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API for adding Teacher
const addTeacher = async (req, res) => {
    try {
        const { name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !number || !position || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const teacherData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            position,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newTeacher = new teacherModel(teacherData);
        await newTeacher.save();
        res.json({ success: true, message: 'Teacher Added' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all teachers list for admin panel
const allTeachers = async (req, res) => {
    try {
        const teachers = await teacherModel.find({}).select('-password');
        res.json({ success: true, teachers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to update Teacher details
const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        // Check if all required fields are present
        if (!name || !email || !number || !position ) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Find the teacher by ID
        const admin = await teacherModel.findById(id);
        if (!admin) {
            return res.json({ success: false, message: "Teacher not found" });
        }

        // Check if the email is valid
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Check for password strength and hash if it's provided
        let hashedPassword = admin.password; // Retain the old password if no new password is provided
        if (password && password.length >= 8) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Upload new image if provided
        let imageUrl = admin.image;
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        // Update the teacher
        const updatedTeacher = await teacherModel.findByIdAndUpdate(id, {
            name,
            email,
            password: hashedPassword,
            number,
            position,
            address: JSON.parse(address),
            image: imageUrl,
        }, { new: true });

        res.json({ success: true, message: 'Teacher updated successfully', updatedTeacher });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API for adding Utility
const addUtility = async (req, res) => {
    try {
        const { name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !number || !position || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const utilityData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            position,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newUtility = new utilityModel(utilityData);
        await newUtility.save();
        res.json({ success: true, message: 'Utility Added' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all utilitys list for admin panel
const allUtilitys = async (req, res) => {
    console.log('Fetching all utilities');
    try {
        const utilitys = await utilityModel.find({}).select('-password');
        console.log('Utilities fetched:', utilitys);
        res.json({ success: true, utilitys });
    } catch (error) {
        console.error('Error fetching utilities:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to update Utility details
const updateUtility = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        // Check if all required fields are present
        if (!name || !email || !password || !number || !position || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Find the utility by ID
        const admin = await utilityModel.findById(id);
        if (!admin) {
            return res.json({ success: false, message: "Utility not found" });
        }

        // Check if the email is valid
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Check for password strength and hash if it's provided
        let hashedPassword = admin.password; // Retain the old password if no new password is provided
        if (password && password.length >= 8) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Upload new image if provided
        let imageUrl = admin.image;
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        // Update the utility
        const updatedUtility = await utilityModel.findByIdAndUpdate(id, {
            name,
            email,
            password: hashedPassword,
            number,
            position,
            address: JSON.parse(address),
            image: imageUrl,
        }, { new: true });

        res.json({ success: true, message: 'Utility updated successfully', updatedUtility });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addAdministrator, addStudent, addTeacher, addUtility, adminDashboard, allAdministrators, allStudents, allTeachers, allUtilitys, appointmentCancel, appointmentsAdmin, loginAdmin, updateAdministrator, updateTeacher, updateUtility };

