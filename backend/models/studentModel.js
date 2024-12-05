import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    number: { type: String, required: true },
    level: { type: String, required: true },
    address: { type: Object, required: true },
}, { minimize: false })

const studentModel = mongoose.models.student || mongoose.model("student", studentSchema);
export default studentModel;
