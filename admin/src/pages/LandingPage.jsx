import { motion } from "framer-motion"; // Import motion
import React, { useState } from "react";
import { Link } from "react-router-dom";
import admin_logo from "../assets/admin_logo.svg";
import bgSolid from "../assets/bg-solid.png";
import scc_bg from "../assets/scc_bg.webp";

export default function LandingPage() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [termsButtonEnabled, setTermsButtonEnabled] = useState(false);
  const [privacyButtonEnabled, setPrivacyButtonEnabled] = useState(false);

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

  const rightPanelVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const rightPanelTransition = {
    type: "spring",
    stiffness: 100,
    delay: 0.3, // Delay for right panel to come after left
  };

  return (
    <motion.div // Overall page container for smooth transitions if used with AnimatePresence
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
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} // Slight delay for staggered effect
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded w-full mb-4 text-center transition-transform transform hover:scale-105"
          >
            Student
          </Link>

          <Link
            to="/teacher-login"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded w-full mb-4 text-center transition-transform transform hover:scale-105"
          >
            Teachers
          </Link>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-sm text-center text-white mt-4"
        >
          By using this service, you understood and agree to the SCC Online Services
          <button onClick={handleOpenTerms} className="text-blue-400 hover:text-blue-300 hover:underline ml-1">
            Terms of Use
          </button>
          and
          <button onClick={handleOpenPrivacy} className="text-blue-400 hover:text-blue-300 hover:underline ml-1">
            Privacy Statement
          </button>
          .
        </motion.p>
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
    </motion.div>
  );
}