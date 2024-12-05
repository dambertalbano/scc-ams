import jwt from "jsonwebtoken";

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;
        if (!atoken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }

        // Verify and decode the token
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

        // Validate the email in the token payload
        if (token_decode.email !== process.env.ADMIN_EMAIL) {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authAdmin;
