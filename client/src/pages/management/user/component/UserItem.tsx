/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { User } from 'api/get/get.interface'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaMale, FaFemale, FaBirthdayCake, FaEnvelope, FaQuestion } from 'react-icons/fa' // Import các icon từ react-icons

interface UserItemProps {
  user: User
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  const { t } = useTranslation()
  const firstName = user?.firstName ?? 'N/A'
  const lastName = user?.lastName ?? 'N/A'
  const email = user?.email ?? 'N/A'
  const roleDescription = user?.Role?.description ?? 'N/A'
  const avatar = user?.avatar ?? 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
  const age = user?.age ?? 'N/A'
  const gender = user?.gender

  return (
    <div className="flex items-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:shadow-md transition-all">
      {/* Avatar */}
      <img
        src={avatar}
        alt={`${firstName} ${lastName}`}
        className="w-14 h-14 rounded-full mr-4 border-2 border-indigo-500"
      />

      {/* User info */}
      <div className="flex flex-col space-y-2 w-full">
        {/* Name and Role */}
        <div className="flex items-center w-full justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{`${firstName} ${lastName}`}</h3>
          <span className="text-sm py-1 rounded-full bg-indigo-100 text-indigo-600 font-semibold w-24 justify-center items-center flex">
            {roleDescription}
          </span>
        </div>

        {/* Email */}
        <div className="flex items-center text-sm text-gray-600 space-x-2">
          <FaEnvelope className="text-indigo-500" />
          <p>{email}</p>
        </div>

        {/* Age */}
        <div className="flex items-center text-sm text-gray-600 space-x-2">
          <FaBirthdayCake className="text-yellow-500" />
          <p>{age} years old</p>
        </div>

        {/* Gender */}
        <div className="flex items-center space-x-2">
          {gender === 'Male'
            ? (
              <FaMale className="text-blue-500" />
              )
            : gender === 'Female'
              ? (
                <FaFemale className="text-pink-500" />
                )
              : (
                <span className="text-gray-500"><FaQuestion /></span>
                )}
          <p>{gender
            ? t(`profile.${gender.toLowerCase()}`)
            : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

export default React.memo(UserItem)
