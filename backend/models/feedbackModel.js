import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Anonymous',
  },
  email: {
    type: String,
    trim: true,
    // Basic email validation, consider a more robust one if needed
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  message: {
    type: String,
    required: [true, 'Message is required.'],
    trim: true,
  },
  source: { // Optional: e.g., 'LandingPage', 'StudentDashboard'
    type: String,
  },
  status: {
    type: String,
    enum: ['new', 'viewed', 'archived'],
    default: 'new',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  viewedAt: { // When an admin first views it
    type: Date,
  }
});

const feedbackModel =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

export default feedbackModel;
