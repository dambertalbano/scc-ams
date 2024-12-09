import React from "react";
import { AdministratorCard, StudentCard, TeacherCard, UtilityCard } from "../../components/UserCard";

function AllUsers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StudentCard />
      <TeacherCard />
      <AdministratorCard />
      <UtilityCard />
    </div>
  );
}

export default AllUsers;
