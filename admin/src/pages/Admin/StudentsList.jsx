import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';

const StudentsList = () => {
  const { students, aToken, getAllStudents, updateStudent, deleteStudent } = useContext(AdminContext);

  const [isEditing, setIsEditing] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  useEffect(() => {
    if (aToken) {
      getAllStudents();
    }
  }, [aToken]); // Removed getAllStudents from dependencies

  const handleEditClick = (admin) => {
    if (!admin._id) {
      console.error("Student ID is missing for the selected student.");
      return;
    }
    setCurrentAdmin(admin); // Set the selected student's data for editing
    setIsEditing(true);
  };
  
  const handleSave = async () => {
    if (!currentAdmin._id) {
      console.error("Student ID is missing for the current student.");
      return;
    }
  
    // Pass the updated student data to the context update function
    updateStudent(currentAdmin); 
    setIsEditing(false); // Close the modal
    setCurrentAdmin(null); // Clear the form
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin((prev) => ({
      ...prev,
      [name]: value, // Update the specific field of currentAdmin
    }));
  };
  

  const handleDelete = async (studentId) => {
    try {
      await deleteStudent(studentId); // Call the delete function from context
      getAllStudents(); // Refresh the student list after deletion
    } catch (error) {
      console.error("Failed to delete student:", error.message);
    }
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Students</h1>

      {/* Table Layout */}
      <table className="min-w-full table-auto border-collapse mt-5">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Image</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Number</th>
            <th className="px-4 py-2 text-left">Level</th>
            <th className="px-4 py-2 text-left">Address</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((item, index) => (
            <tr key={index} className="border-b hover:bg-gray-100">
              {/* Image Column */}
              <td className="px-4 py-2">
                <img
                  className="w-16 h-16 object-cover rounded-full"
                  src={item.image ?? '/default-image.png'} // Fallback to a default image
                  alt="Student"
                />
              </td>
              <td className="px-4 py-2">{item.name ?? 'No Name'}</td>
              <td className="px-4 py-2">{item.email ?? 'No Email'}</td>
              <td className="px-4 py-2">{item.number ?? 'No Number'}</td>
              <td className="px-4 py-2">{item.level ?? 'No Level'}</td>
              <td className="px-4 py-2">{item.address?.line1 ?? 'No Address Line 1'}</td>
              <td className="px-4 py-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                  onClick={() => handleEditClick(item)}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => handleDelete(item._id)} // Call the delete function
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Student Modal */}
      {isEditing && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-lg font-medium">Edit Student</h2>
            <div className="mt-4">
              <label className="block">Name</label>
              <input
                className="border w-full p-2 rounded"
                name="name"
                value={currentAdmin.name || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Email</label>
              <input
                className="border w-full p-2 rounded"
                name="email"
                value={currentAdmin.email || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Number</label>
              <input
                className="border w-full p-2 rounded"
                name="number"
                value={currentAdmin.number || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Level</label>
              <select
                className="border rounded px-2 py-2 w-full"
                name="level"
                value={currentAdmin.level || ''}
                onChange={handleChange}
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="High School">High School</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded mr-2"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
