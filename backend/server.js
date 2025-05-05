import cors from 'cors';
import 'dotenv/config';
import express from "express";
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongodb.js";
import adminRouter from "./routes/adminRoute.js";
import studentRouter from "./routes/studentRoute.js";
import teacherRouter from './routes/teacherRoute.js';

// --- ADD THIS LOG ---
console.log(">>>> SERVER.JS TOP LEVEL - Express app created <<<<");
// --- END ADDED LOG ---

// app config
const app = express();
const port = process.env.PORT || 4000;

// --- ADD THIS LOG ---
app.use((req, res, next) => {
    console.log(`+++++ INCOMING REQUEST: ${req.method} ${req.originalUrl} +++++`);
    next();
});
// --- END ADDED LOG ---

// middlewares
app.use(express.json());

const allowedOrigins = [
    'http://localhost:5174', // <-- Add your frontend development origin
    'https://stclareonline-ams.live',
    'https://www.stclareonline-ams.live',
    'https://scc-ams-frontend.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);

app.get("/", (req, res) => {
    res.send("API Working");
});

const startServer = async () => {
    try {
        await connectDB();
        await connectCloudinary();

        app.listen(port, () => console.log(`Server started on PORT:${port}`));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1); // Exit the process if either DB or Cloudinary connection fails
    }
};

startServer();