import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentNumber: { type: String, required: true, unique: true, trim: true },
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
    password: { type: String, required: true, select: false },
    image: { type: String, trim: true },
    number: { type: String, required: true, trim: true, maxlength: 11 },
    address: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    signInTime: { type: Date },
    signOutTime: { type: Date },
    educationLevel: {
      type: String,
      required: true,
      enum: ["Primary", "Secondary"],
      trim: true,
    },
    gradeYearLevel: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },

    // New fields for semester and semesterDates
    semester: {
      type: String,
      required: true,
      enum: ["1st Sem", "2nd Sem"], // Restrict to "1st Sem" or "2nd Sem"
      default: "1st Sem", // Default value
    },
    semesterDates: {
      start: { type: Date, required: true, default: new Date("2024-08-15") }, // Default start date for 1st Sem
      end: { type: Date, required: true, default: new Date("2024-12-15") }, // Default end date for 1st Sem
    },

    subjects: [
      {
        name: { type: String, required: true, trim: true },
        teacher: { type: String, required: true, trim: true },
      },
    ],
    schedule: [
      {
        day: { type: String, required: true, trim: true },
        time: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        teacher: { type: String, required: true, trim: true },
      },
    ],
  },
  { timestamps: true }
);

const studentModel =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
export default studentModel;
