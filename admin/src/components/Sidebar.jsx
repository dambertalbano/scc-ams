import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { StudentContext } from '../context/StudentContext';

const linksConfig = {
  admin: [
    { path: '/admin-dashboard', label: 'Dashboard', icon: assets.home_icon },
    { path: '/add-users', label: 'Add Users', icon: assets.add_icon },
    { path: '/all-users', label: 'All Users', icon: assets.people_icon },
    { path: '/rfid-scan', label: 'Scan RFID', icon: assets.list_icon },
    { path: '/attendance', label: 'Attendance', icon: assets.appointment_icon },
  ],
  teacher: [
    { path: '/teacher-dashboard', label: 'Dashboard', icon: assets.home_icon },
    { path: '/teacher-appointments', label: 'Attendance', icon: assets.appointment_icon },
  ],
};

const Sidebar = () => {
  const { dToken } = useContext(StudentContext);
  const { aToken } = useContext(AdminContext);

  const roleLinks = aToken ? linksConfig.admin : dToken ? linksConfig.teacher : [];

  return (
    <div className='min-h-screen border-r'>
      <ul className='text-gray mt-5'>
        {roleLinks.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? 'bg-[#F2F3FF] border-r-4 border-customRed' : ''
              }`
            }
          >
            <img className='min-w-5' src={icon} alt='' />
            <p className='hidden md:block'>{label}</p>
          </NavLink>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
