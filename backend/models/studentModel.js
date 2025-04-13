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
