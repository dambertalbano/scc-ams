import React from 'react';
import { useNavigate } from 'react-router-dom';

// Generic Card Component
const Card = ({ title, buttonText, navigateTo }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(navigateTo);
  };

  return (
    <div className='p-4'>
      <div className="p-4 border rounded-lg shadow-lg w-full">
        <h5 className="text-xl font-semibold text-black mb-5 p-3 mr-10">
          {title}
        </h5>
        <div className="border-t pt-5">
          <button
            className="bg-customRed text-white text-sm font-medium py-2 px-4 rounded hover:bg-customRed-600"
            onClick={handleNavigate}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Specific Components (Cards)
export const StudentCard = () => (
  <Card title="Students" buttonText="Student List" navigateTo="/student-list" />
);

export const TeacherCard = () => (
  <Card title="Teachers" buttonText="Teacher List" navigateTo="/teacher-list" />
);

export const UtilityCard = () => (
  <Card title="Utility" buttonText="Utility List" navigateTo="/utility-list" />
);

export const AdministratorCard = () => (
  <Card title="Administrator" buttonText="Administrator List" navigateTo="/administrator-list" />
);

export const AddStudentCard = () => (
  <Card title="Student" buttonText="Add Student" navigateTo="/add-student" />
);

export const AddAdministratorCard = () => (
  <Card title="Administrator" buttonText="Add Administrator" navigateTo="/add-administrator" />
);

export const AddUtilityCard = () => (
  <Card title="Utility" buttonText="Add Utility" navigateTo="/add-utility" />
);

export const AddTeachersCard = () => (
  <Card title="Teacher" buttonText="Add Teacher" navigateTo="/add-teacher" />
);

// Card Container Component with CSS Grid Layout
const CardContainer = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <StudentCard />
      <TeacherCard />
      <AdministratorCard />
      <UtilityCard />
    </div>
  );
};

export default CardContainer;

