import mongoose from "mongoose";

const administratorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    number: { type: String, required: true },
    position: { type: String, required: true },
    address: { type: Object, required: true },
}, { minimize: false })

const administratorModel = mongoose.models.administrator || mongoose.model("administrator", administratorSchema);
export default administratorModel;
