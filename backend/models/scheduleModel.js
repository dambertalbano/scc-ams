import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    section: { type: String, required: true, trim: true },
    gradeYearLevel: { type: String, required: true, trim: true },
    educationLevel: {
      type: String,
      enum: ["Primary", "Secondary"],
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        // "Sunday", // You had Sunday in a previous version, decide if it's needed
      ],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format (e.g., 09:00 or 14:30)']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format (e.g., 10:00 or 15:30)']
    },
    semester: {
      type: String,
      enum: ["1st Sem", "2nd Sem"],
      required: true,
    },
    // ... any other fields ...
  },
  { timestamps: true }
);

const scheduleModel =
  mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);

export default scheduleModel;
