import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType' // Use refPath to dynamically reference the model
    },
    userType: {
        type: String,
        required: true,
        enum: ['Student', 'Teacher'] // Possible user types
    },
    eventType: {
        type: String,
        enum: ['sign-in', 'sign-out'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;