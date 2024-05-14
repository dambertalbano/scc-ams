import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AddDept from "./Components/AddDept";
import AddStudent from "./Components/AddStudent";
import AddTeacher from "./Components/AddTeacher";
import Dashboard from "./Components/Dashboard";
import Department from "./Components/Department";
import EditStudent from "./Components/EditStudent";
import EditTeacher from "./Components/EditTeacher";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Start from "./Components/Start";
import Student from "./Components/Student";
import StudentDetail from "./Components/StudentDetail";
import StudentLogin from "./Components/StudentLogin";
import StudentRegister from "./Components/StudentRegister";
import Teacher from "./Components/Teacher";
import TeacherDetail from "./Components/TeacherDetail";
import TeacherLogin from "./Components/TeacherLogin";
import TeacherRegister from "./Components/TeacherRegister";
import "./index.css";

function Main() {
  ReactDOM.render(
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/admin_login" element={<Login />} />
          <Route path="/student_login" element={<StudentLogin />} />
          <Route path="/student_detail/:id" element={<StudentDetail />} />
          <Route path="/teacher_login" element={<TeacherLogin />} />
          <Route path="/teacher_detail/:id" element={<TeacherDetail />} />
          <Route path="/teacher_register" element={<TeacherRegister />} />
          <Route path="/student_register" element={<StudentRegister />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="" element={<Home />} />
            <Route path="student" element={<Student />} />
            <Route path="teacher" element={<Teacher />} />
            <Route path="department" element={<Department />} />
            <Route path="add_department" element={<AddDept />} />
            <Route path="add_student" element={<AddStudent />} />
            <Route path="add_teacher" element={<AddTeacher />} />
            <Route path="edit_student/:id" element={<EditStudent />} />
            <Route path="edit_teacher/:id" element={<EditTeacher />} />
          </Route>
        </Routes>
      </Router>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export default Main;
