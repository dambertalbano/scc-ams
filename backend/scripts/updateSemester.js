import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path'; // Import path module
import { fileURLToPath } from 'url'; // Import url module
import studentModel from '../models/studentModel.js'; // Adjust path if needed

// --- Robust path resolution for .env ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env'); // Resolve path relative to this script's directory
dotenv.config({ path: envPath });
// --- End path resolution ---

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGO_URI environment variable not found.');
  console.log(`Attempted to load .env from: ${envPath}`); // Log the path being used
  console.log('Ensure the .env file exists at that location and is readable.');
  process.exit(1); // Exit if connection string is missing
}

// --- Define the new values ---
const newSemesterValue = "2nd Sem";
const newStartDateValue = new Date("2025-01-06"); // Mongoose will store this as ISODate
const newEndDateValue = new Date("2025-05-15");   // Mongoose will store this as ISODate
// --- ---

const runUpdate = async () => {
  let connection;
  try {
    console.log('Connecting to MongoDB...');
    // Connect to the database AND specify the correct dbName
    connection = await mongoose.connect(MONGODB_URI, {
      dbName: 'ams-db' // <-- Use the correct database name here
    });
    console.log('MongoDB connected successfully to database:', connection.connections[0].name); // Log the actual DB name

    console.log(`Updating all students to:`);
    console.log(`  Semester: ${newSemesterValue}`);
    console.log(`  Start Date: ${newStartDateValue.toISOString().split('T')[0]}`);
    console.log(`  End Date: ${newEndDateValue.toISOString().split('T')[0]}`);

    // Perform the update operation on all documents
    const result = await studentModel.updateMany(
      {}, // Empty filter matches all documents
      {
        $set: {
          semester: newSemesterValue,
          'semesterDates.start': newStartDateValue, // Use dot notation for nested fields
          'semesterDates.end': newEndDateValue,     // Use dot notation for nested fields
        },
      }
    );

    console.log('\n--- Update Result ---');
    console.log(`Documents matched: ${result.matchedCount}`);
    console.log(`Documents modified: ${result.modifiedCount}`);
    if (result.acknowledged) {
        console.log('Operation acknowledged by the server.');
    } else {
        console.warn('Operation *not* acknowledged by the server.');
    }
    console.log('--------------------');


  } catch (error) {
    console.error('\n--- ERROR DURING UPDATE ---');
    console.error(error);
    console.error('--------------------------');
  } finally {
    // Ensure disconnection even if errors occur
    if (connection) {
      await mongoose.disconnect();
      console.log('\nMongoDB disconnected.');
    }
  }
};

// Execute the update function
runUpdate();