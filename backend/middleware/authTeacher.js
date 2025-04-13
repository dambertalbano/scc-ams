import jwt from 'jsonwebtoken';
import teacherModel from '../models/teacherModel.js'; // Import teacher model

const authTeacher = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Assumes 'Bearer <token>' format

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, login again' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the decoded token has the 'teacher' role
        if (decoded.role !== 'teacher') {
            return res.status(403).json({ success: false, message: 'Forbidden: Teacher role required' });
        }

        const teacher = await teacherModel.findById(decoded.id).select('-password');

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        req.teacher = teacher; // Attach teacher object to request
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token: ' + err.message }); // Send specific error message
    }
};

export default authTeacher;