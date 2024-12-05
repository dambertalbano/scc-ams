import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';

const AdministratorsList = () => {
  const { administrators, aToken, getAllAdministrators, updateAdministrator } = useContext(AdminContext);

  const [isEditing, setIsEditing] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  useEffect(() => {
    if (aToken) {
      getAllAdministrators();
    }
  }, [aToken]);

  const handleEditClick = (admin) => {
    setCurrentAdmin(admin);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateAdministrator(currentAdmin); // Assuming `updateAdministrator` is a function in your context to update admin details
    setIsEditing(false);
    setCurrentAdmin(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Administrators</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {administrators.map((item, index) => (
          <div
            className="border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            key={index}
          >
            <img
              className="bg-[#EAEFFF] group-hover:bg-primary transition-all duration-500"
              src={item.image}
              alt=""
            />
            <div className="p-4">
              <p className="text-[#262626] text-lg font-medium">{item.name}</p>
              <p className="text-[#5C5C5C] text-sm">{item.email}</p>
              <p className="text-[#5C5C5C] text-sm">{item.number}</p>
              <p className="text-[#5C5C5C] text-sm">{item.position}</p>
              <p className="text-[#5C5C5C] text-sm">{item.address.line1}</p>
              <p className="text-[#5C5C5C] text-sm">{item.address.line2}</p>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => handleEditClick(item)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-lg font-medium">Edit Administrator</h2>
            <div className="mt-4">
              <label className="block">Name</label>
              <input
                className="border w-full p-2 rounded"
                name="name"
                value={currentAdmin.name}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Email</label>
              <input
                className="border w-full p-2 rounded"
                name="email"
                value={currentAdmin.email}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Number</label>
              <input
                className="border w-full p-2 rounded"
                name="number"
                value={currentAdmin.number}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Position</label>
              <select onChange={(e) => setProfileData(prev => ({...prev,level: e.target.value}))} className='border rounded'>
              <option value="Academic Coordinator">Academic Coordinator</option>
              <option value="Academic Adviser">Academic Adviser</option>
              <option value="Guidance Counselor">Guidance Counselor</option>
              <option value="Principal">Principal</option>
              <option value="Vice Principal">Vice Principal</option>
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

export default AdministratorsList;
