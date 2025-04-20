import subjectModel from "../models/subjectModel.js";

export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await subjectModel.find({});
        res.status(200).json({ success: true, subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await subjectModel.findById(id);

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        res.status(200).json({ success: true, subject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createSubject = async (req, res) => {
    try {
        const { name, code, semesterId } = req.body;

        const newSubject = new subjectModel({ name, code, semesterId });
        await newSubject.save();

        res.status(201).json({ success: true, subject: newSubject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedSubject = await subjectModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedSubject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        res.status(200).json({ success: true, subject: updatedSubject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSubject = await subjectModel.findByIdAndDelete(id);

        if (!deletedSubject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        res.status(200).json({ success: true, message: "Subject deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};