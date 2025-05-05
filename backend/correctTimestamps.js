import { MongoClient } from 'mongodb';

// MongoDB connection URI and database/collection details
const uri = "mongodb+srv://greatstack:greatstack123@cluster0.rpg29.mongodb.net"; // Replace with your MongoDB URI
const dbName = "ams-db"; // Replace with your database name
const collectionName = "attendances"; // Replace with your collection name

async function correctTimestamps() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Fetch all documents from the collection
        const documents = await collection.find({}).toArray();

        for (const doc of documents) {
            try {
                // Validate and extract _id timestamp
                if (!doc._id || typeof doc._id.toString !== 'function') {
                    console.warn(`Invalid _id for document:`, doc);
                    continue;
                }
                const idTimestamp = new Date(parseInt(doc._id.toString().substring(0, 8), 16) * 1000);
                if (isNaN(idTimestamp.getTime())) {
                    console.warn(`Invalid _id timestamp for document:`, doc);
                    continue;
                }

                // Validate and extract field timestamp
                if (!doc.timestamp || !doc.timestamp.$date) {
                    console.warn(`Missing or invalid timestamp field for document:`, doc);
                    continue;
                }
                const fieldTimestamp = new Date(doc.timestamp.$date);
                if (isNaN(fieldTimestamp.getTime())) {
                    console.warn(`Invalid field timestamp for document:`, doc);
                    continue;
                }

                // Compare timestamps
                const idDate = idTimestamp.toISOString().split('T')[0];
                const fieldDate = fieldTimestamp.toISOString().split('T')[0];

                if (idDate !== fieldDate) {
                    console.log(`Correcting timestamp for _id: ${doc._id}`);
                    console.log(`  Old timestamp: ${fieldDate}`);
                    console.log(`  New timestamp: ${idDate}`);

                    // Update the document's timestamp field
                    await collection.updateOne(
                        { _id: doc._id },
                        { $set: { timestamp: idTimestamp } }
                    );
                }
            } catch (innerError) {
                console.error(`Error processing document: ${doc._id}`, innerError);
            }
        }

        console.log("Timestamp correction completed.");
    } catch (error) {
        console.error("Error correcting timestamps:", error);
    } finally {
        await client.close();
    }
}

correctTimestamps();