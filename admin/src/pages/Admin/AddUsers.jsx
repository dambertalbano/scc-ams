import React from 'react'
import { AddAdministratorCard, AddStudentCard, AddTeachersCard, AddUtilityCard } from '../../components/UserCard'

const AddUsers = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <AddStudentCard />
      <AddTeachersCard />
      <AddAdministratorCard />
      <AddUtilityCard />
    </div>
  )
}

export default AddUsers
