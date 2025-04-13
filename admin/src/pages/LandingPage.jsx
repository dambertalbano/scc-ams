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
    setTimeout(() => setTermsButtonEnabled(true), 5000); // Enable button after 5 seconds
  };

  const handleCloseTerms = () => setShowTerms(false);

  const handleOpenPrivacy = () => {
    setShowPrivacy(true);
    setPrivacyButtonEnabled(false);
    setTimeout(() => setPrivacyButtonEnabled(true), 5000); // Enable button after 5 seconds
  };

  const handleClosePrivacy = () => setShowPrivacy(false);

  return (
    <div className="flex h-screen">
      {/* Left Side - Building Image */}
      <div
        className="w-7/12 bg-cover bg-center"
        style={{ backgroundImage: `url(${scc_bg})` }}
      ></div>

      {/* Right Side - Login Section */}
      <div
        className="w-5/12 bg-gray-100 flex flex-col justify-center items-center p-10 shadow-lg"
        style={{ backgroundImage: `url(${bgSolid})` }}
      >
        <img src={admin_logo} alt="SCC Logo" className="w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-white">Hi, Clareans!</h1>
        <p className="text-white mb-6">Please click or tap your destination.</p>

        <Link
          to="/student-login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded w-full max-w-xs mb-4 text-center"
        >
          Student
        </Link>

        <Link
          to="/teacher-login"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded w-full max-w-xs mb-4 text-center"
        >
          Teachers
        </Link>

        <p className="text-sm text-center text-white">
          By using this service, you understood and agree to the SCC Online Services
          <button onClick={handleOpenTerms} className="text-blue-600 hover:underline ml-1">
            Terms of Use
          </button>
          and
          <button onClick={handleOpenPrivacy} className="text-blue-600 hover:underline ml-1">
            Privacy Statement
          </button>
          .
        </p>
      </div>

      {/* Terms of Use Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 w-11/12 md:w-1/2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Terms of Use</h2>
            <p className="mb-4">
              Welcome to SCC AMS (St. Clare College Attendance Management System). By accessing or using this system, you agree to be bound by these Terms of Use. Please read them carefully.
            </p>
            <ul className="list-disc pl-6 mb-4">
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
            <div className="text-right">
              <button
                onClick={handleCloseTerms}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  termsButtonEnabled ? "" : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!termsButtonEnabled}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Statement Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 w-11/12 md:w-1/2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Privacy Statement</h2>
            <p className="mb-4">
              At SCC AMS, we are committed to protecting the privacy and personal information of all users, including students, faculty, and staff. This Privacy Statement outlines how we collect, use, store, and protect your data.
            </p>
            <ul className="list-disc pl-6 mb-4">
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
            <div className="text-right">
              <button
                onClick={handleClosePrivacy}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  privacyButtonEnabled ? "" : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!privacyButtonEnabled}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}