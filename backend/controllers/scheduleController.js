import scheduleModel from "../models/scheduleModel.js";
import teacherModel from "../models/teacherModel.js"; // Import the Teacher model

export const getAllSchedules = async (req, res) => {
    try {
        const schedules = await scheduleModel.find({})
            .populate("subjectId", "name code")
            .populate("teacherId", "firstName lastName");
        res.status(200).json({ success: true, schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await scheduleModel.findById(id)
            .populate("subjectId", "name code")
            .populate("teacherId", "firstName lastName");

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        res.status(200).json({ success: true, schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createSchedule = async (req, res) => {
    try {
        const {
            subjectId,
            teacherName,
            section,
            gradeYearLevel,
            educationLevel,
            dayOfWeek,
            startTime,
            endTime,
            semester,
        } = req.body;

        // Split the teacherName into parts (firstName, middleName, lastName)
        const nameParts = teacherName.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

        // Find the teacher by their full name
        const teacher = await teacherModel.findOne({
            firstName: { $regex: firstName, $options: "i" },
            middleName: { $regex: middleName, $options: "i" },
            lastName: { $regex: lastName, $options: "i" },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // Create the schedule with the teacher's ID
        const newSchedule = new scheduleModel({
            subjectId,
            teacherId: teacher._id, // Use the teacher's ObjectId
            section,
            gradeYearLevel,
            educationLevel,
            dayOfWeek,
            startTime,
            endTime,
            semester,
        });

        await newSchedule.save();

        res.status(201).json({ success: true, schedule: newSchedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedSchedule = await scheduleModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedSchedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        res.status(200).json({ success: true, schedule: updatedSchedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSchedule = await scheduleModel.findByIdAndDelete(id);

        if (!deletedSchedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        res.status(200).json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};