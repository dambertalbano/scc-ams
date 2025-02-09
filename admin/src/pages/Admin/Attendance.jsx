import React from "react";
import { AttendanceAdministratorCard, AttendanceStudentCard, AttendanceTeacherCard, AttendanceUtilityCard } from "../../components/UserCard";

function Attendance() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <AttendanceStudentCard />
      <AttendanceTeacherCard />
      <AttendanceAdministratorCard />
      <AttendanceUtilityCard />
    </div>
  );
}

export default Attendance;
