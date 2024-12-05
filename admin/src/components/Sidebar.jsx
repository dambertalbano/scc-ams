import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { StudentContext } from '../context/StudentContext'

const Sidebar = () => {

  const { dToken } = useContext(StudentContext)
  const { aToken } = useContext(AdminContext)

  return (
    <div className='min-h-screen bg-white border-r'>
      {aToken && <ul className='text-[#515151] mt-5'>

        <NavLink to={'/admin-dashboard'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-customRed' : ''}`}>
          <img className='min-w-5' src={assets.home_icon} alt='' />
          <p className='hidden md:block'>Dashboard</p>
        </NavLink>
        <NavLink to={'/add-users'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-customRed' : ''}`}>
          <img className='min-w-5' src={assets.add_icon} alt='' />
          <p className='hidden md:block'>Add Users</p>
        </NavLink>
        <NavLink to={'/all-users'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-customRed' : ''}`}>
          <img className='min-w-5' src={assets.people_icon} alt='' />
          <p className='hidden md:block'>All Users</p>
        </NavLink>
      </ul>}

      {dToken && <ul className='text-[#515151] mt-5'>
        <NavLink to={'/student-dashboard'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
          <img className='min-w-5' src={assets.home_icon} alt='' />
          <p className='hidden md:block'>Dashboard</p>
        </NavLink>
        <NavLink to={'/student-appointments'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
          <img className='min-w-5' src={assets.appointment_icon} alt='' />
          <p className='hidden md:block'>Attendance</p>
        </NavLink>
        <NavLink to={'/student-profile'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
          <img className='min-w-5' src={assets.people_icon} alt='' />
          <p className='hidden md:block'>Profile</p>
        </NavLink>
      </ul>}
    </div>
  )
}

export default Sidebar