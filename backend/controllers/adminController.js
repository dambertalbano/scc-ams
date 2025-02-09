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
        const { code, name, email, password, number, level, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !number || !level || !address || !code) {
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
            code,
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

const getStudentByCode = async (req, res) => {
    try {
        const { code } = req.params;
        console.log(`Received request for student with code: ${code}`);  // Log for debugging

        const student = await studentModel.findOne({ code }).select('-password');
        
        if (student) {
            res.json({ success: true, student });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const students = await studentModel.find({});
        const teachers = await teacherModel.find({});
        const utilitys = await utilityModel.find({});
        const administrators = await administratorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});

        const dashData = {
            administrators: administrators.length,
            students: students.length,
            teachers: teachers.length,
            utilitys: utilitys.length,
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
// API to get user information by code
// Controller to get user by code
const getUserByCode = async (req, res) => {
    try {
        const { code } = req.params;
        let user = await studentModel.findOne({ code }).select('-password');
        
        if (!user) {
            user = await teacherModel.findOne({ code }).select('-password');
        }

        if (!user) {
            user = await administratorModel.findOne({ code }).select('-password');
        }

        if (!user) {
            user = await utilityModel.findOne({ code }).select('-password');
        }

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// API for adding Administrator
const addAdministrator = async (req, res) => {
    try {
        const { code, name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !number || !position || !address || !code) {
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
            code,
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



// API for adding Teacher
const addTeacher = async (req, res) => {
    try {
        const { code, name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !number || !position || !address || !code) {
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
            code,
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
      // Fetch all teachers, excluding the password field
      const teachers = await teacherModel.find({}).select('-password');
      
      // Map the results to include 'id'
      const formattedTeachers = teachers.map((teacher) => ({
        ...teacher.toObject(),
        id: teacher._id,
      }));
      
      // Send response with teachers data
      res.json({ success: true, teachers: formattedTeachers });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
  
  const deleteTeacher = async (req, res) => {
    try {
      const teacherId = req.params.id;
      const deletedTeacher = await teacherModel.findByIdAndDelete(teacherId);
      
      if (!deletedTeacher) {
        return res.status(404).json({ success: false, message: "Teacher not found" });
      }
  
      res.json({ success: true, message: "Teacher deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// API to update Teacher details
const updateTeacher = async (req, res) => {
    try {
      const teacherId = req.params.id;
      const updatedData = req.body;
  
      const updatedTeacher = await teacherModel.findByIdAndUpdate(teacherId, updatedData, {
        new: true, // Return the updated teacher
      });
  
      if (!updatedTeacher) {
        return res.status(404).json({ success: false, message: "Teacher not found" });
      }
  
      res.json({ success: true, teacher: updatedTeacher });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  const deleteUtility = async (req, res) => {
    try {
      const utilityId = req.params.id;
      const deletedUtility = await utilityModel.findByIdAndDelete(utilityId);
      
      if (!deletedUtility) {
        return res.status(404).json({ success: false, message: "Utility not found" });
      }
  
      res.json({ success: true, message: "Utility deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// API to update Utility details
const updateUtility = async (req, res) => {
    try {
      const utilityId = req.params.id;
      const updatedData = req.body;
  
      const updatedUtility = await utilityModel.findByIdAndUpdate(utilityId, updatedData, {
        new: true, // Return the updated utility
      });
  
      if (!updatedUtility) {
        return res.status(404).json({ success: false, message: "Utility not found" });
      }
  
      res.json({ success: true, utility: updatedUtility });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const deleteStudent = async (req, res) => {
    try {
      const studentId = req.params.id;
      const deletedStudent = await studentModel.findByIdAndDelete(studentId);
      
      if (!deletedStudent) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
  
      res.json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// API to update Student details
const updateStudent = async (req, res) => {
    try {
      const studentId = req.params.id;
      const updatedData = req.body;
  
      const updatedStudent = await studentModel.findByIdAndUpdate(studentId, updatedData, {
        new: true, // Return the updated student
      });
  
      if (!updatedStudent) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
  
      res.json({ success: true, student: updatedStudent });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const deleteAdministrator = async (req, res) => {
    try {
      const administratorId = req.params.id;
      const deletedAdministrator = await administratorModel.findByIdAndDelete(administratorId);
      
      if (!deletedAdministrator) {
        return res.status(404).json({ success: false, message: "Administrator not found" });
      }
  
      res.json({ success: true, message: "Administrator deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// API to update Administrator details
const updateAdministrator = async (req, res) => {
    try {
      const administratorId = req.params.id;
      const updatedData = req.body;
  
      const updatedAdministrator = await administratorModel.findByIdAndUpdate(administratorId, updatedData, {
        new: true, // Return the updated administrator
      });
  
      if (!updatedAdministrator) {
        return res.status(404).json({ success: false, message: "Administrator not found" });
      }
  
      res.json({ success: true, administrator: updatedAdministrator });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };



// API for adding Utility
const addUtility = async (req, res) => {
    try {
        const { code, name, email, password, number, position, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !number || !position || !address || !code) {
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
            code,
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



export { addAdministrator, addStudent, addTeacher, addUtility, adminDashboard, allAdministrators, allStudents, allTeachers, allUtilitys, appointmentCancel, appointmentsAdmin, deleteAdministrator, deleteStudent, deleteTeacher, deleteUtility, getStudentByCode, getUserByCode, loginAdmin, updateAdministrator, updateStudent, updateTeacher, updateUtility };

