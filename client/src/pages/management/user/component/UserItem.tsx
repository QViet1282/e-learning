/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// UserItem.tsx
import { User } from 'api/get/get.interface'
import React from 'react'

interface UserItemProps {
  user: User
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  // Đảm bảo giá trị không phải là undefined hoặc null
  const firstName = user?.firstName || 'N/A'
  const lastName = user?.lastName || 'N/A'
  const email = user?.email || 'N/A'
  const roleDescription = user?.Role?.description || 'N/A'

  return (
    <div className="flex items-center p-4 border border-gray-300 rounded-md shadow-sm bg-white">
      <img
        src={user.avatar}
        alt={`${firstName} ${lastName}`}
        className="w-12 h-12 rounded-full mr-4"
      />
      <div>
        <h3 className="text-lg font-semibold">{`${firstName} ${lastName}`}</h3>
        <p className="text-sm text-gray-600">Email: {email}</p>
        <p className="text-sm text-gray-600">Role: {roleDescription}</p>
      </div>
    </div>
  )
}

export default UserItem
