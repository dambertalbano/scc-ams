import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    number: { type: String, required: true },
    position: { type: String, required: true },
    address: {
      line1: { type: String, default: 'No Address Line 1' },
      line2: { type: String, default: 'No Address Line 2' },
    },
  }, { minimize: false });
  

const teacherModel = mongoose.models.teacher || mongoose.model("teacher", teacherSchema);
export default teacherModel;
