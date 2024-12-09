import mongoose from "mongoose";

const utilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    number: { type: String, required: true },
    position: { type: String, required: true },
    address: { type: Object, required: true },
}, { minimize: false });

const utilityModel = mongoose.models.utility || mongoose.model("utility", utilitySchema);
export default utilityModel;
