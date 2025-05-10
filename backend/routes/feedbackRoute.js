import express from 'express';
import Feedback from '../models/feedbackModel.js'; // Corrected import and added .js extension

const feedbackRouter = express.Router();
feedbackRouter.post('/', async (req, res) => {
  try {
    const { name, email, message, source } = req.body;

    if (!message || message.trim() === "") {
        return res.status(400).json({ message: "Message cannot be empty." });
    }

    const newFeedback = new Feedback({
      name: name || 'Anonymous', // Default to Anonymous if name is not provided
      email, // Will be undefined if not provided, schema handles default/validation
      message,
      source,
    });

    await newFeedback.save();
    
    // Optional: Implement a notification system here if needed (e.g., for admins)

    res.status(201).json({ message: 'Feedback submitted successfully!', feedbackId: newFeedback._id });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    if (error.name === 'ValidationError') {
        // Extract a more user-friendly message from Mongoose validation errors
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while submitting feedback.' });
  }
});

export default feedbackRouter;