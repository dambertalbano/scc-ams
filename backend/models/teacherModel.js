import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: { type: String, required: true }, // Removed select: false
    image: {
        type: String,
        trim: true,
        match: /^(ftp|http|https):\/\/[^ "]+$/,
    },
    number: { type: String, required: true, trim: true, maxlength: 11 },
    address: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    signInTime: { type: Date },
    signOutTime: { type: Date },
    classSchedule: { type: [String], trim: true },
    subjects: {
        type: [String],
    },
    role: { type: String, default: "Teacher" },
    status: { type: String, default: "active" },
    educationLevel: {
        type: [String],
        enum: ["Primary", "Secondary"],
        trim: true,
    },
    gradeYearLevel: { type: [String], trim: true },
    section: { type: [String], trim: true },
    teachingAssignments: [{
        educationLevel: {
            type: String,
            enum: ["Primary", "Secondary"],
            trim: true,
        },
        gradeYearLevel: { type: String, trim: true },
        section: { type: String, trim: true },
        _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() } // Ensure each assignment has an _id
    }],
},
    { timestamps: true }
);

const teacherModel = mongoose.models.teacher || mongoose.model("Teacher", teacherSchema);
export default teacherModel;