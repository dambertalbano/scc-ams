import React, { useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'

const Dashboard = () => {

  const { aToken, getDashData, dashData } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  return dashData && (
    <div className='m-5'>

      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.people_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.students}</p>
            <p className='text-gray-400'>Students</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.people_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.teachers}</p>
            <p className='text-gray-400'>Teachers</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.people_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.utilitys}</p>
            <p className='text-gray-400'>Utilities</p></div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.people_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.students}</p>
            <p className='text-gray-400'>Administrators</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard