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
        "Sunday",
      ],
      required: true,
    },
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true },
    semester: {
      type: String,
      enum: ["1st Sem", "2nd Sem"],
      required: true,
    },
  },
  { timestamps: true }
);

const scheduleModel =
  mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);

export default scheduleModel;
