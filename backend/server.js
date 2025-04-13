import cors from 'cors';
import 'dotenv/config';
import express from "express";
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongodb.js";
import adminRouter from "./routes/adminRoute.js";
import studentRouter from "./routes/studentRoute.js";
import teacherRouter from './routes/teacherRoute.js';


// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(cors());

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