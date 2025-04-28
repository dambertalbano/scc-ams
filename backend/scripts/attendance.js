import mongoose from "mongoose";
import Attendance from "../models/attendanceModel.js"; // Adjust the path to your model

// MongoDB connection URI
const mongoURI = "mongodb+srv://greatstack:greatstack123@cluster0.rpg29.mongodb.net/ams-db"; // Replace with your database name
const ObjectId = mongoose.Types.ObjectId;

// Attendance data
const attendanceData = [
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-21T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-21T17:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-22T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-22T17:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-23T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-23T17:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-24T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-24T17:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-25T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-25T17:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-26T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-26T17:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-28T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-28T17:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-29T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-29T17:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-in",
    timestamp: "2025-04-30T07:00:00Z",
    __v: 0
  },
  {
    user: ('68086419f4ccfae93d895892'),
    userType: "Teacher",
    eventType: "sign-out",
    timestamp: "2025-04-30T17:00:00Z",
    __v: 0
  },
  
];
const isValidDate = (dateString) => !isNaN(Date.parse(dateString));

attendanceData.forEach((entry) => {
    if (!isValidDate(entry.timestamp)) {
        throw new Error(`Invalid timestamp: ${entry.timestamp}`);
    }
});

const convertedAttendanceData = attendanceData.map(entry => ({
  ...entry,
  timestamp: new Date(entry.timestamp) // Convert timestamp to Date
}));

// Connect to MongoDB and insert data
const insertData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI,
 {
            useNewUrlParser: true,

            useUnifiedTopology: true,

        });
        console.log("Connected to MongoDB");

        // Insert attendance data
        await Attendance.insertMany(attendanceData);
        console.log("Attendance data inserted successfully");

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error inserting attendance data:",
 error);
    }
};

console.log(convertedAttendanceData);

insertData();