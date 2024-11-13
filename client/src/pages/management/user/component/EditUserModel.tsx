/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useEffect, useRef } from 'react'
import { User, Role } from 'api/get/get.interface'
import { updateUser } from 'api/post/post.api'

interface EditUserModalProps {
  user: User | null
  onClose: () => void
  roles: Role[]
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, roles }) => {
  const [firstName, setFirstName] = useState<string>(user?.firstName ?? '')
  const [lastName, setLastName] = useState<string>(user?.lastName ?? '')
  const [email, setEmail] = useState<string>(user?.email ?? '')
  const [selectedRole, setSelectedRole] = useState<number | null>(user?.Role?.id ?? null)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar ?? '')
  const [gender, setGender] = useState<number>(user?.gender ?? 0) // 0 for Male, 1 for Female
  const [age, setAge] = useState<number>(user?.age ?? 18) // Default to 18

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user != null) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setEmail(user.email ?? '')
      setSelectedRole(user.Role?.id ?? null)
      setAvatarPreview(user.avatar ?? '')
      setGender(user.gender ?? 0)
      setAge(user.age ?? 18)
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file != null) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    try {
      const payload = {
        roleId: selectedRole,
        firstName,
        lastName,
        email,
        gender,
        age,
        avatar
      }

      if (user?.id !== undefined) {
        await updateUser(user?.id, payload)
      }

      onClose()
    } catch (error) {
      console.error('Lỗi khi cập nhật user:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Avatar Section */}
        <div className="mb-6">
          <div className="flex justify-center">
            {(avatarPreview != null)
              ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full mb-2 cursor-pointer object-cover ring-2 ring-blue-500"
                onClick={handleAvatarClick}
              />
                )
              : (
              <div
                className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer mb-2 ring-2 ring-gray-300"
                onClick={handleAvatarClick}
              >
                <span className="text-gray-400">No Avatar</span>
              </div>
                )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              ref={fileInputRef}
            />
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-600 mb-2">Thông tin cơ bản</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full p-2 mb-2 border rounded-md focus:border-blue-500"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="w-full p-2 mb-2 border rounded-md focus:border-blue-500"
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 mb-2 border rounded-md focus:border-blue-500"
          />
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-600 mb-2">Vai trò</h4>
          <select
            value={selectedRole ?? ''}
            onChange={(e) => setSelectedRole(Number(e.target.value))}
            className="w-full p-2 mb-2 border rounded-md focus:border-blue-500"
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.description}</option>
            ))}
          </select>
        </div>

        {/* Gender and Age Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">Giới tính</h4>
            <select
              value={gender}
              onChange={(e) => setGender(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:border-blue-500"
            >
              <option value={0}>Male</option>
              <option value={1}>Female</option>
            </select>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">Tuổi</h4>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Math.min(Math.max(Number(e.target.value), 8), 100))}
              placeholder="Age"
              className="w-full p-2 border rounded-md focus:border-blue-500"
              min={8}
              max={100}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditUserModal
