import React from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

const Start = () => {
  const navigate = useNavigate();
  
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="loginForm">
        <h2 className="text-center">Sign In as</h2>
        <div className="d-flex justify-content-center mt-1 mb-1">
          <button
            type="button"
            className="btn btn-custom"
            onClick={() => {
              navigate("/teacher_login");
            }}
          >
            Teacher
          </button>
        </div>
        <div className="d-flex justify-content-center mt-1 mb-3">
          <button
            type="button"
            className="btn btn-custom"
            onClick={() => {
              navigate("/student_login");
            }}
          >
            Student
          </button>
        </div>
        <div className="d-flex justify-content-center mt-3 mb-2">
          <button
            type="button"
            className="btn btn-custom"
            onClick={() => {
              navigate("/admin_login");
            }}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Start;
