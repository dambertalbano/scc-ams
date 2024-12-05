import cors from 'cors'
import 'dotenv/config'
import express from "express"
import connectCloudinary from "./config/cloudinary.js"
import connectDB from "./config/mongodb.js"
import administratorRouter from "./routes/administratorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import studentRouter from "./routes/studentRoute.js"
import teacherRouter from './routes/teacherRoute.js'
import userRouter from "./routes/userRoute.js"
import utilityRouter from './routes/utilityRoute.js'

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/student", studentRouter)
app.use("/api/administrator", administratorRouter)
app.use("/api/teacher", teacherRouter)
app.use("/api/utility", utilityRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))