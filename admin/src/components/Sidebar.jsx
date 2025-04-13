import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { StudentContext } from '../context/StudentContext';
import { TeacherContext } from '../context/TeacherContext';

const Sidebar = () => {
    const { aToken } = useContext(AdminContext);
    const { dToken } = useContext(TeacherContext);
    const { sToken } = useContext(StudentContext);

    return (
        <div className="min-h-screen border-r w-16 hover:w-64 transition-all duration-300 overflow-hidden bg-white group flex flex-col items-start">
            {/* Admin Links */}
            {aToken && (
                <ul className="mt-5 text-black w-full">
                    <SidebarItem to="/rfid-scan" icon={assets.list_icon} text="Scan" />
                    <SidebarItem to="/admin-dashboard" icon={assets.home_icon} text="Dashboard" />
                    <SidebarItem to="/add-users" icon={assets.add_icon} text="Add Users" />
                    <SidebarItem to="/all-users" icon={assets.people_icon} text="All Users" />
                    <SidebarItem to="/attendance" icon={assets.appointment_icon} text="Attendance" />
                </ul>
            )}

            {/* Teacher Links */}
            {dToken && (
                <ul className="mt-5 text-black w-full">
                    <SidebarItem to="/teacher-dashboard" icon={assets.home_icon} text="Dashboard" />
                    <SidebarItem to="/teacher-profile" icon={assets.profile_icon} text="Profile" />
                </ul>
            )}

            {/* Student Links */}
            {sToken && (
                <ul className="mt-5 text-black w-full">
                    <SidebarItem to="/student-dashboard" icon={assets.home_icon} text="Dashboard" />
                    <SidebarItem to="/student-profile" icon={assets.profile_icon} text="Profile" />
                </ul>
            )}
        </div>
    );
};

const SidebarItem = ({ to, icon, text }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-4 cursor-pointer transition-all duration-300
       ${isActive ? 'bg-[#F2F3FF] border-r-4 border-customRed' : ''}
       group-hover:px-6`
        }
    >
        <img className="w-6" src={icon} alt="" />
        <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{text}</p>
    </NavLink>
);

export default Sidebar;