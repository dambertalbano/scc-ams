import jwt from 'jsonwebtoken';
import studentModel from '../models/studentModel.js'; // Import student model

const authStudent = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Assumes 'Bearer <token>' format

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, login again' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the decoded token has the 'student' role
        if (decoded.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Forbidden: Student role required' });
        }

        const student = await studentModel.findById(decoded.id).select('-password');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        req.student = student; // Attach student object to request
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token: ' + err.message }); // Send specific error message
    }
};

export default authStudent;