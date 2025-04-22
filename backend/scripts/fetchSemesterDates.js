import mongoose from "mongoose";
import studentModel from "../models/studentModel.js"; // Corrected path

// MongoDB connection URI
const mongoURI = "mongodb+srv://greatstack:greatstack123@cluster0.rpg29.mongodb.net/scc-ams"; // Replace with your database name

// Function to fetch semesterDates for a specific student
const fetchSemesterDates = async (studentId) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Query the student by _id and select the semesterDates field
    const student = await studentModel.findById(studentId).select("semesterDates").lean();

    if (!student) {
      console.log(`Student with ID ${studentId} not found.`);
    } else {
      console.log("Semester Dates:", student.semesterDates);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error fetching semester dates:", error);
  }
};

// Replace with the actual student ID
const studentId = "67ee1ff0f034a7a8631c592d"; // Replace with the ObjectId of the student
fetchSemesterDates(studentId);