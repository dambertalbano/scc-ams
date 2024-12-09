import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { StudentContext } from '../context/StudentContext'

const Navbar = () => {

  const { dToken, setDToken } = useContext(StudentContext)
  const { aToken, setAToken } = useContext(AdminContext)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-black'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/admin-dashboard')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
      </div>
      <button onClick={() => logout()} className='bg-customRed text-white text-sm px-5 py-2 rounded'>{aToken ? 'Admin | Sign Out' : 'Teacher | Sign Out'}</button>
    </div>
  )
}

export default Navbar