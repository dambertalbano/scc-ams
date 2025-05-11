const fs = require('fs');
const { ObjectId } = require('mongodb');

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates a Date object for a specific baseDate, with targetHour and targetMinute,
 * applying a random minuteVariation.
 * @param {Date} baseDate - The base date (day, month, year).
 * @param {number} targetHour - The target hour (0-23).
 * @param {number} targetMinute - The target minute (0-59).
 * @param {number} minuteVariation - The range of random minutes to add/subtract (e.g., 15 for +/- 15 minutes).
 * @returns {Date}
 */
function createVariedDateTime(baseDate, targetHour, targetMinute, minuteVariation = 15) {
    const date = new Date(baseDate); // Clone the base date to only use its YYYY-MM-DD part
    date.setHours(targetHour, targetMinute, 0, 0); // Set to target time first

    const variation = getRandomInt(-minuteVariation, minuteVariation);
    date.setMinutes(date.getMinutes() + variation);
    return date;
}

async function generateAttendanceRecords() {
    const studentFilePath = 'c:/Users/labo/Desktop/new-thesis-master/backend/ams-db.students.json'; // Adjust if needed
    const outputFilePath = 'generated_attendance_records.json';

    let studentsData;
    try {
        studentsData = JSON.parse(fs.readFileSync(studentFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Error reading student data from ${studentFilePath}:`, error);
        return;
    }

    const students = studentsData.map(s => ({
        _id: new ObjectId(s._id.$oid), // Convert string OID to actual ObjectId
        studentNumber: s.studentNumber // For potential logging
    }));

    if (students.length === 0) {
        console.log("No students found in the input file.");
        return;
    }

    const attendanceRecords = [];
    const startDate = new Date('2025-04-21T00:00:00.000Z');
    const endDate = new Date('2025-04-30T23:59:59.999Z');

    console.log(`Generating records from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDateIter = new Date(d); // Use a new Date object for manipulation within the loop iteration
        const dayOfWeek = currentDateIter.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        let targetSignInHour, targetSignInMinute, targetSignOutHour, targetSignOutMinute;
        let shouldGenerate = false;

        if (dayOfWeek === 1) { // Monday
            targetSignInHour = 7; targetSignInMinute = 0;  // 7:00 AM
            targetSignOutHour = 12; targetSignOutMinute = 0; // 12:00 PM
            shouldGenerate = true;
            // console.log(`Processing Monday: ${currentDateIter.toDateString()}`);
        } else if (dayOfWeek === 3 || dayOfWeek === 5) { // Wednesday or Friday
            targetSignInHour = 7; targetSignInMinute = 0;  // 7:00 AM
            targetSignOutHour = 11; targetSignOutMinute = 0; // 11:00 AM
            shouldGenerate = true;
            // console.log(`Processing Wed/Fri: ${currentDateIter.toDateString()}`);
        }

        if (shouldGenerate) {
            for (const student of students) {
                const signInTime = createVariedDateTime(currentDateIter, targetSignInHour, targetSignInMinute, 25); // +/- 25 mins variation for sign-in
                let signOutTime = createVariedDateTime(currentDateIter, targetSignOutHour, targetSignOutMinute, 25); // +/- 25 mins variation for sign-out

                // Ensure signOut is always after signIn for the same day
                if (signOutTime <= signInTime) {
                    // If sign-out ended up before or at sign-in, adjust it to be at least 1 hour after sign-in
                    signOutTime = new Date(signInTime.getTime() + (60 + getRandomInt(0, 120)) * 60000); // 1 to 3 hours after sign-in
                }

                // Further ensure sign-out doesn't exceed the intended daily maximum due to variation
                const maxSignOut = new Date(currentDateIter);
                if (dayOfWeek === 1) { // Monday
                    maxSignOut.setHours(12, 30, 0, 0); // Cap around 12:30 PM for Monday
                } else { // Wednesday/Friday
                    maxSignOut.setHours(11, 30, 0, 0); // Cap around 11:30 AM for Wed/Fri
                }
                if (signOutTime > maxSignOut) {
                    signOutTime.setTime(maxSignOut.getTime() - getRandomInt(0,15)*60000); // slightly before cap
                }
                 if (signOutTime <= signInTime) { // Final check if adjustment made it invalid
                    signOutTime.setTime(signInTime.getTime() + 60 * 60000); // Default to 1 hour after if still invalid
                 }


                // Sign-In Record
                attendanceRecords.push({
                    _id: new ObjectId(),
                    user: student._id,
                    userType: "Student",
                    timestamp: signInTime,
                    eventType: "sign-in",
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                // Sign-Out Record
                attendanceRecords.push({
                    _id: new ObjectId(),
                    user: student._id,
                    userType: "Student",
                    timestamp: signOutTime,
                    eventType: "sign-out",
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    }

    // Prepare for mongoimport (MongoDB Extended JSON v2 format)
    const recordsForMongoImport = attendanceRecords.map(rec => ({
        _id: { $oid: rec._id.toString() },
        user: { $oid: rec.user.toString() },
        userType: rec.userType,
        timestamp: { $date: rec.timestamp.toISOString() },
        eventType: rec.eventType,
        createdAt: { $date: rec.createdAt.toISOString() },
        updatedAt: { $date: rec.updatedAt.toISOString() }
    }));

    try {
        fs.writeFileSync(outputFilePath, JSON.stringify(recordsForMongoImport, null, 2));
        console.log(`\nSuccessfully generated ${attendanceRecords.length} attendance records for ${students.length} students.`);
        console.log(`Output file: ${outputFilePath}`);
        console.log("You can now import this file into MongoDB using mongoimport.");
    } catch (error) {
        console.error(`Error writing output file ${outputFilePath}:`, error);
    }
}

generateAttendanceRecords().catch(console.error);