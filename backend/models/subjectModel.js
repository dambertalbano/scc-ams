import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester", // optional depending on how you manage semesters
    },
  },
  { timestamps: true }
);

const subjectModel =
  mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

export default subjectModel;
    