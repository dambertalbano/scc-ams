import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { StudentContext } from '../context/StudentContext';

const Navbar = () => {
  const { dToken, setDToken } = useContext(StudentContext);
  const { aToken, setAToken } = useContext(AdminContext);

  const navigate = useNavigate();

  const logout = () => {
    if (dToken) {
      setDToken('');
      localStorage.removeItem('dToken');
    }
    if (aToken) {
      setAToken('');
      localStorage.removeItem('aToken');
    }
    navigate('/');
  };

  const userRole = aToken ? 'Admin' : dToken ? 'Teacher' : null;

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-black'>
      <div className='flex items-center gap-2 text-xs'>
        <img
          onClick={() => navigate(aToken ? '/admin-dashboard' : '/teacher-dashboard')}
          className='w-36 sm:w-40 cursor-pointer'
          src={assets.admin_logo}
          alt=''
        />
      </div>
      {userRole && (
        <button
          onClick={logout}
          className='bg-customRed text-white text-sm px-5 py-2 rounded'
        >
          {`${userRole} | Sign Out`}
        </button>
      )}
    </div>
  );
};

export default Navbar;
