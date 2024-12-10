import jwt from 'jsonwebtoken';

// teacher authentication middleware
const authTeacher = async (req, res, next) => {
  // Get token from the Authorization header (Bearer token)
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Assumes 'Bearer <token>' format

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded token (teacher info) to the request object for later use
    req.teacher = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: 'Invalid Token, Authorization Failed' });
  }
};

export default authTeacher;
