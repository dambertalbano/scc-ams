import { motion } from "framer-motion"; // Import motion
import { X } from 'lucide-react'; // Import X icon for closing modal
import React, { useState } from "react";
import { Link } from "react-router-dom";
import admin_logo from "../assets/admin_logo.svg";
import bgSolid from "../assets/bg-solid.png";
import scc_bg from "../assets/scc_bg.webp";

// Access the environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function LandingPage() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [termsButtonEnabled, setTermsButtonEnabled] = useState(false);
  const [privacyButtonEnabled, setPrivacyButtonEnabled] = useState(false);

  // State for Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitStatus, setFeedbackSubmitStatus] = useState({ type: "", message: "" }); // type: 'success' or 'error'

  const handleOpenTerms = () => {
    setShowTerms(true);
    setTermsButtonEnabled(false);
    setTimeout(() => setTermsButtonEnabled(true), 5000);
  };

  const handleCloseTerms = () => setShowTerms(false);

  const handleOpenPrivacy = () => {
    setShowPrivacy(true);
    setPrivacyButtonEnabled(false);
    setTimeout(() => setPrivacyButtonEnabled(true), 5000);
  };

  const handleClosePrivacy = () => setShowPrivacy(false);

  const handleOpenFeedbackModal = () => {
    setShowFeedbackModal(true);
    setFeedbackSubmitStatus({ type: "", message: "" }); // Reset status when opening
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    // Only reset form if submission wasn't successful, or always reset
    if (feedbackSubmitStatus.type !== 'success') {
        setFeedbackData({ name: "", email: "", message: "" });
    }
    setIsSubmittingFeedback(false);
    // feedbackSubmitStatus is reset when modal is opened next
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackData.message.trim()) {
      setFeedbackSubmitStatus({ type: "error", message: "Message cannot be empty." });
      return;
    }
    setIsSubmittingFeedback(true);
    setFeedbackSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${BACKEND_URL}/api/feedback`, { // Use the environment variable
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: feedbackData.name,
          email: feedbackData.email,
          message: feedbackData.message,
          source: 'LandingPage',
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        setFeedbackSubmitStatus({ type: "success", message: responseData.message || "Feedback submitted successfully!" });
        setFeedbackData({ name: "", email: "", message: "" });
      } else {
        // Attempt to parse error response if not OK, but handle cases where it might not be JSON
        let errorMessage = "Failed to submit feedback. Please try again.";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
            // If response is not JSON (e.g. plain text 404 page), use the status text
            errorMessage = `Failed to submit feedback. Server responded with ${response.status}: ${response.statusText}`;
            console.error("Response was not JSON:", await response.text());
        }
        setFeedbackSubmitStatus({ type: "error", message: errorMessage });
      }
    } catch (error) {
      console.error("Feedback submission network error:", error);
      setFeedbackSubmitStatus({ type: "error", message: "A network error occurred. Please try again." });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.7,
  };

  return (
    <motion.div // Overall page container
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col md:flex-row h-screen"
    >
      {/* Left Side - Building Image */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden md:block w-full md:w-7/12 h-1/3 md:h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${scc_bg})` }}
      ></motion.div>

      {/* Right Side - Login Section */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="w-full md:w-5/12 h-full bg-gray-100 flex flex-col justify-center items-center p-6 md:p-10 shadow-lg"
        style={{ backgroundImage: `url(${bgSolid})` }}
      >
        <motion.img 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
          src={admin_logo} 
          alt="SCC Logo" 
          className="w-16 h-16 md:w-20 md:h-20 mb-4" 
        />
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 0.6 }}
          className="text-2xl md:text-3xl font-bold text-white text-center"
        >
          Hi, Clareans!
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 0.7 }}
          className="text-white mb-6 text-center"
        >
          Please click or tap your destination.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.8 }} 
          className="w-full max-w-xs flex flex-col items-center"
        >
          <Link
            to="/student-login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded w-full mb-4 text-center transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Student
          </Link>

          <Link
            to="/teacher-login"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded w-full mb-4 text-center transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Teachers
          </Link>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-sm text-center text-white mt-6 px-2"
        >
          By using this service, you acknowledge you have read, understood, and agree to the SCC Online Services
          <button onClick={handleOpenTerms} className="text-blue-400 hover:text-blue-300 hover:underline mx-1 font-medium">
            Terms of Use
          </button>
          and our
          <button onClick={handleOpenPrivacy} className="text-blue-400 hover:text-blue-300 hover:underline ml-1 font-medium">
            Privacy Statement
          </button>
          .
        </motion.p>

        {/* Enhanced Feedback Section - Now a button to open modal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, type: "spring", stiffness: 100 }}
          className="mt-5 text-center w-full max-w-xs"
        >
          <p className="text-xs text-gray-200 mb-2">
            Encountered an issue or have suggestions?
          </p>
          <button
            onClick={handleOpenFeedbackModal}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
            aria-label="Send feedback"
          >
            Send Feedback
          </button>
        </motion.div>
      </motion.div>

      {/* Terms of Use Modal */}
      {showTerms && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Terms of Use</h2>
            <p className="mb-4 text-gray-700">
              Welcome to SCC AMS (St. Clare College Attendance Management System). By accessing or using this system, you agree to be bound by these Terms of Use. Please read them carefully.
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>
                <strong>Acceptance of Terms:</strong> By accessing or using SCC AMS, you agree to comply with and be legally bound by these Terms of Use and our Privacy Policy.
              </li>
              <li>
                <strong>Description of the Service:</strong> SCC AMS is a digital platform developed for St. Clare College to manage attendance records of students, faculty, and other stakeholders using RFID technology and other digital tools.
              </li>
              <li>
                <strong>User Responsibilities:</strong> Users must provide accurate information, use the system for its intended purposes, and keep login credentials secure.
              </li>
              <li>
                <strong>Acceptable Use Policy:</strong> Users must not misuse the system, access unauthorized data, or perform malicious activities.
              </li>
              <li>
                <strong>Data Accuracy and Availability:</strong> While every effort is made to ensure data accuracy, SCC AMS does not guarantee error-free information.
              </li>
              <li>
                <strong>Termination of Access:</strong> SCC AMS reserves the right to suspend or terminate access for any user who violates these terms.
              </li>
            </ul>
            <div className="text-right mt-6">
              <button
                onClick={handleCloseTerms}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-opacity ${
                  termsButtonEnabled ? "" : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!termsButtonEnabled}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Privacy Statement Modal */}
      {showPrivacy && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Privacy Statement</h2>
            <p className="mb-4 text-gray-700">
              At SCC AMS, we are committed to protecting the privacy and personal information of all users, including students, faculty, and staff. This Privacy Statement outlines how we collect, use, store, and protect your data.
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>
                <strong>Information We Collect:</strong> Personal information such as name, ID, contact details, and attendance timestamps.
              </li>
              <li>
                <strong>Purpose of Data Collection:</strong> To track attendance, provide reports, and maintain system security.
              </li>
              <li>
                <strong>Data Sharing:</strong> Data is shared only with authorized personnel or when required by law.
              </li>
              <li>
                <strong>Data Security:</strong> We implement encryption, secure login systems, and regular audits to protect your data.
              </li>
              <li>
                <strong>Data Retention:</strong> Data is retained only as long as necessary for its intended purpose or legal obligations.
              </li>
              <li>
                <strong>User Rights:</strong> Users can access, correct, or request deletion of their data by contacting the system administrator.
              </li>
            </ul>
            <div className="text-right mt-6">
              <button
                onClick={handleClosePrivacy}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-opacity ${
                  privacyButtonEnabled ? "" : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!privacyButtonEnabled}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60] p-4" // Higher z-index
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Send Feedback</h2>
              <button onClick={handleCloseFeedbackModal} className="text-gray-500 hover:text-gray-700" disabled={isSubmittingFeedback}>
                <X size={24} />
              </button>
            </div>
            {feedbackSubmitStatus.type === "success" ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <p className="mt-4 text-lg font-medium text-gray-700">{feedbackSubmitStatus.message}</p>
                <p className="text-sm text-gray-500">Thank you for your input.</p>
                 <button
                    onClick={handleCloseFeedbackModal}
                    className="mt-6 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Close
                  </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label htmlFor="feedbackName" className="block text-sm font-medium text-gray-700">Name (Optional)</label>
                  <input
                    type="text"
                    name="name"
                    id="feedbackName"
                    value={feedbackData.name}
                    onChange={handleFeedbackChange}
                    disabled={isSubmittingFeedback}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="feedbackEmail" className="block text-sm font-medium text-gray-700">Email (Optional, for follow-up)</label>
                  <input
                    type="email"
                    name="email"
                    id="feedbackEmail"
                    value={feedbackData.email}
                    onChange={handleFeedbackChange}
                    disabled={isSubmittingFeedback}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="feedbackMessage" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    name="message"
                    id="feedbackMessage"
                    rows="4"
                    value={feedbackData.message}
                    onChange={handleFeedbackChange}
                    required
                    disabled={isSubmittingFeedback}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  ></textarea>
                </div>
                {feedbackSubmitStatus.type === "error" && (
                  <p className="text-sm text-red-600">{feedbackSubmitStatus.message}</p>
                )}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseFeedbackModal}
                    disabled={isSubmittingFeedback}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:bg-red-400 flex items-center justify-center min-w-[120px]" // Added min-width
                  >
                    {isSubmittingFeedback ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : "Submit Feedback"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}