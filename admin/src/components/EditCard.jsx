import React from 'react';
import { useNavigate } from 'react-router-dom';


export const EditCard = () => {
    const navigate = useNavigate();
  
    const handleNavigate = () => {
      navigate('/student-list');
    };
  
    return (
      <div className='m-5 max-h-[90vh] overflow-y-scroll'>
        <div className="p-4">
          <h5 className="text-xl font-semibold text-blue-gray-700 mb-2">
            Students
          </h5>
        </div>
        <div className="p-4 border-t">
          <button
            className="bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-blue-600"
            onClick={handleNavigate}
          >
          Student List
          </button>
        </div>
      </div>
    );
  };

export const EditAdministratorCard = () => {
    const navigate = useNavigate();
  
    const handleNavigate = () => {
      navigate('/edit-administrators');
    };
  
    return (
      <div className='m-5 max-h-[90vh] overflow-y-scroll'>
        <div className="p-4">
          <h5 className="text-xl font-semibold text-blue-gray-700 mb-2">
          Administrator
          </h5>
        </div>
        <div className="p-4 border-t">
          <button
            className="bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-blue-600"
            onClick={handleNavigate}
          >
          Edit Administrator
          </button>
        </div>
      </div>
    );
  };

export default EditCard
