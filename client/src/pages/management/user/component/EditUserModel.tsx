/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useEffect, useRef } from 'react'
import { User, Role } from 'api/get/get.interface'
import { findUserById, updateAvatar, updateUser } from 'api/post/post.api'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { getFromLocalStorage } from 'utils/functions'
import axios from 'axios'
import AvatarEditor from 'react-avatar-editor'
import CameraAltIcon from '@mui/icons-material/CameraAlt'

interface EditUserModalProps {
  user: User | null
  onClose: () => void
  roles: Role[]
  fetchUsers: () => Promise<void>
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, roles, fetchUsers }) => {
  const { t } = useTranslation()
  const [firstName, setFirstName] = useState<string>(user?.firstName ?? '')
  const [lastName, setLastName] = useState<string>(user?.lastName ?? '')
  const [email, setEmail] = useState<string>(user?.email ?? '')
  const [selectedRole, setSelectedRole] = useState<number | null>(user?.Role?.id ?? null)
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar)
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar)
  const [gender, setGender] = useState<string | undefined>(user?.gender)
  const [age, setAge] = useState<number | undefined>(user?.age ?? undefined)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user != null) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setEmail(user.email ?? '')
      setSelectedRole(user.Role?.id ?? null)
      setAvatarPreview(user.avatar ?? '')
      setGender(user?.gender === '1'
        ? 'Male'
        : user?.gender === '0'
          ? 'Female'
          : undefined)
      setAge(user.age ?? undefined)
    }
  }, [user])

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
        await updateAvatar(String(user?.id), avatarPreview!)
        await updateUser(user?.id, payload)
      }
      void fetchUsers()
      onClose()
      toast.success('Cập nhật user thành công!')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật user!')
      console.error('Lỗi khi cập nhật user:', error)
    }
  }

  const [isAvatarEditing, setIsAvatarEditing] = useState(false)
  const [avatarImage, setAvatarImage] = useState<File | null>(null)
  const [avatarScale, setAvatarScale] = useState<number>(1)
  const [editor, setEditor] = useState<AvatarEditor | null>(null)
  const [avatarRotate, setAvatarRotate] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = async (image: File): Promise<string> => {
    const formData = new FormData()
    const uniqueId = `avatar_${Date.now()}` // Generate unique ID using current date and time
    formData.append('file', image)
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')
    formData.append('folder', 'avatar')
    formData.append('public_id', uniqueId) // Add unique public_id

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/image/upload`,
      formData
    )

    return response.data.secure_url
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarImage(e.target.files[0])
      setIsAvatarEditing(true)

      // Reset giá trị của input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAvatarSave = async () => {
    setIsUploading(true)
    if (editor) {
      const canvasScaled = editor.getImageScaledToCanvas().toDataURL()
      // Chuyển đổi data URL thành Blob
      const blob = await fetch(canvasScaled).then(async (res) => await res.blob())
      const file = new File([blob], 'avatar.png', { type: 'image/png' })

      try {
        const avatarUrl = await uploadImage(file) // Tải lên Cloudinary và lấy URL
        setAvatarPreview(avatarUrl)
        setIsAvatarEditing(false)
        setAvatarRotate(0)
        setAvatarScale(1)

        // Cập nhật avatar trong localStorage
        // const tokens = getFromLocalStorage<any>('tokens')
        // tokens.avatar = updatedAvatar
        // localStorage.setItem('tokens', JSON.stringify(tokens))
        // window.dispatchEvent(new Event('storage'))
        // await findUserById(String(user?.id))
      } catch (error) {
        toast.error('Lỗi khi cập nhật avatar')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const setEditorRef = (editorInstance: AvatarEditor | null) => {
    setEditor(editorInstance)
  }

  const getAvatarUrl = (avatarPath?: string | undefined) => {
    return avatarPath ?? 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Avatar Section */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="rounded-full border-4 border-teal-400 overflow-hidden w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-32 lg:h-32 flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src={getAvatarUrl(avatarPreview ?? avatar)}
                  alt="User avatar"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-[10%] right-[10%] inline-flex items-center bg-gray-800 text-white p-1 rounded-full cursor-pointer"
              >
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <CameraAltIcon
                  sx={{
                    fontSize: {
                      xs: 10,
                      sm: 12,
                      md: 14,
                      lg: 18,
                      xl: 20
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-600 mb-2">{t('profile.basic_information')}</h4>
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
            disabled={true}
          />
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-600 mb-2">{t('profile.role')}</h4>
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
            <h4 className="text-lg font-medium text-gray-600 mb-2">{t('profile.gender')}</h4>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border rounded-md focus:border-blue-500"
            >
              <option value="">{t('profile.selectGender')}</option>
              <option value="Male">{t('profile.male')}</option>
              <option value="Female">{t('profile.female')}</option>
              <option value="Other">{t('profile.other')}</option>
            </select>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">{t('profile.age')}</h4>
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
      {/* Modal chỉnh sửa Avatar */}
      {isAvatarEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">Chỉnh sửa Avatar</h2>
            <div className="flex flex-col items-center">
              <div className="w-64 h-64 mb-4 relative">
                <AvatarEditor
                  ref={setEditorRef}
                  image={avatarImage!}
                  width={250}
                  height={250}
                  border={0}
                  borderRadius={125}
                  color={[255, 255, 255, 0.6]} // RGBA
                  scale={avatarScale}
                  rotate={avatarRotate}
                  className="editor-canvas"
                />
                <div className="absolute inset-0 rounded-full border-4 border-teal-400 pointer-events-none"></div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-2">Phóng to/Thu nhỏ</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={avatarScale}
                  onChange={(e) => setAvatarScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#14b8a6' }}
                />
              </div>
              <div className="w-full mt-4">
                <label className="block text-sm font-medium mb-2">Góc xoay: {avatarRotate}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={avatarRotate}
                  onChange={(e) => setAvatarRotate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#14b8a6' }}
                />
              </div>
              <div className="flex justify-end mt-6 w-full">
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition duration-200"
                  onClick={() => {
                    setIsAvatarEditing(false)
                    setAvatarImage(null)
                    setAvatarRotate(0)
                    setAvatarScale(1)
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  className={`bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleAvatarSave}
                  disabled={isUploading}
                >
                  {isUploading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditUserModal
