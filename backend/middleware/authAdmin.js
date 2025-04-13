import jwt from "jsonwebtoken";

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }

        const atoken = authHeader.split(' ')[1];

        // Verify and decode the token
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

        // Validate the email in the token payload
        if (token_decode.email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.log(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Login Again' });
        }
        res.status(401).json({ success: false, message: 'Invalid Token. Login Again' });
    }
};

export default authAdmin;