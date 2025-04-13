import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

// API to get student by RFID code
const getStudentByRFID = async (req, res) => {
    const { code } = req.params;

    try {
        const student = await studentModel.findOne({ code });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error("Error fetching student by RFID code:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// API to get teacher by RFID code
const getTeacherByRFID = async (req, res) => {
    const { code } = req.params;

    try {
        const teacher = await teacherModel.findOne({ code });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        console.error("Error fetching teacher by RFID code:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { getStudentByRFID, getTeacherByRFID };
