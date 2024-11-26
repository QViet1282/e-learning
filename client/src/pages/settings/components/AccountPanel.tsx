/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: AccountPanel
   ========================================================================== */
import React, { useEffect, useState, useRef } from 'react'
import ImageCover from '../../../assets/images/profiler/cover-image.png'
import { findUserById, updateUser, updateAvatar } from '../../../api/post/post.api'
import { getFromLocalStorage } from 'utils/functions'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import AvatarEditor from 'react-avatar-editor'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import axios from 'axios'

interface User {
  id: string
  firstName: string
  lastName: string
  gender: string
  age: string
  email: string
  username: string
  password?: string
  newPassword?: string
  currentPassword?: string
  googleId: string
  avatar?: string
}

interface PayloadType {
  firstName: string
  lastName: string
  gender: string
  age: string
  email: string
  username: string
  password?: string
  newPassword?: string
  currentPassword?: string
}

function AccountPanel () {
  const { t } = useTranslation()

  const [user, setUser] = useState<User>({
    id: '',
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    email: '',
    username: '',
    password: '',
    newPassword: '',
    currentPassword: '',
    googleId: ''
  })
  const [originalUser, setOriginalUser] = useState<User>(user)

  useEffect(() => {
    const fetchUser = async () => {
      const tokens = getFromLocalStorage<any>('tokens')
      const userId = tokens?.id
      if (userId) {
        const response = await findUserById(userId)
        const userData = {
          ...response.data,
          googleId: response.data.googleId || ''
        }
        setUser(userData)
        setOriginalUser(userData)
      } else {
        console.error('User not found')
      }
    }
    fetchUser()
  }, [])

  const [isEditing, setIsEditing] = useState(false)
  const handleEditProfile = () => {
    setIsEditing(true) // chỉ cho phép edit 1 lần
    // setIsEditing(prevIsEditing => !prevIsEditing) // cho phép edit nhiều lần
  }
  const handleCancelEdit = () => {
    setIsEditing(false)
    // Preserve the current avatar while resetting other fields
    const currentAvatar = user.avatar
    setUser({
      ...originalUser,
      avatar: currentAvatar
    })
    setObjCheckInput({ ...defaultObjCheckInput })
    setIsSettingNewPassword(false)
  }
  const handleCancelSet = () => {
    setObjCheckInput({ ...defaultObjCheckInput })
    setIsSettingNewPassword(false)
    setUser(prevUser => ({ ...prevUser, newPassword: '', currentPassword: '' }))
  }

  // validate
  const defaultObjCheckInput = {
    isValidFirstName: true,
    isValidLastName: true,
    isValidAge: true,
    isValidEmail: true,
    isValidGender: true,
    isValidPassword: true,
    isValidCurrentPassword: true
  }
  const [objCheckInput, setObjCheckInput] = useState(defaultObjCheckInput)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const ageRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const genderRef = useRef<HTMLSelectElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const currentPasswordRef = useRef<HTMLInputElement>(null)

  const [errorField, setErrorField] = useState<string>('')

  // function validate
  const isValidInputs = () => {
    setObjCheckInput(defaultObjCheckInput)
    if (user.firstName === '' || user.firstName === null) {
      toast.error('FirstName is required')
      setObjCheckInput({ ...defaultObjCheckInput, isValidFirstName: false })
      if (firstNameRef.current) {
        firstNameRef.current.focus()
      }
      return false
    }
    const regxFirstName = /^[a-zA-Z\u00C0-\u017F\u1E00-\u1EFF\s]*$/
    if (!regxFirstName.test(user.firstName)) {
      toast.error('FirstName must be a string')
      setObjCheckInput({ ...defaultObjCheckInput, isValidFirstName: false })
      if (firstNameRef.current) {
        firstNameRef.current.focus()
      }
      return false
    }
    const regxLastName = /^[a-zA-Z\u00C0-\u017F\u1E00-\u1EFF\s]*$/
    if (!regxLastName.test(user.lastName)) {
      toast.error('LastName must be a string')
      setObjCheckInput({ ...defaultObjCheckInput, isValidLastName: false })
      if (lastNameRef.current) {
        lastNameRef.current.focus()
      }
      return false
    }
    if (user.lastName === '' || user.lastName === null) {
      toast.error('LastName is required')
      setObjCheckInput({ ...defaultObjCheckInput, isValidLastName: false })
      if (lastNameRef.current) {
        lastNameRef.current.focus()
      }
      return false
    }
    if (user.gender === '' || user.gender === null) {
      toast.error('Gender is required')
      setObjCheckInput({ ...defaultObjCheckInput, isValidGender: false })
      if (genderRef.current) {
        genderRef.current.focus()
      }
      return false
    }
    if (user.age === '' || user.age === null) {
      toast.error('Age is required')
      setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
      if (ageRef.current) {
        ageRef.current.focus()
      }
      return false
    }
    if (isNaN(Number(user.age))) {
      toast.error('Age must be a number')
      setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
      if (ageRef.current) {
        ageRef.current.focus()
      }
      return false
    }
    if (Number(user.age) > 150) {
      toast.error('Invalid age')
      setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
      if (ageRef.current) {
        ageRef.current.focus()
      }
      return false
    }
    const regxs = /^[0-9]*$/
    if (!regxs.test(user.age)) {
      toast.error('Age must be a positive integer')
      setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
      if (ageRef.current) {
        ageRef.current.focus()
      }
      return false
    }
    if (user.email === '' || user.email === null) {
      toast.error('Email is required')
      setObjCheckInput({ ...defaultObjCheckInput, isValidEmail: false })
      if (emailRef.current) {
        emailRef.current.focus()
      }
      return false
    }
    const regx = /\S+@\S+\.\S+/
    if (!regx.test(user.email)) {
      toast.error('Email is invalid')
      setObjCheckInput({ ...defaultObjCheckInput, isValidEmail: false })
      if (emailRef.current) {
        emailRef.current.focus()
      }
      return false
    }
    const regxPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (user.newPassword && !regxPassword.test(user.newPassword)) {
      toast.error('Password at least 8 characters')
      setObjCheckInput({ ...defaultObjCheckInput, isValidPassword: false })
      if (passwordRef.current) {
        passwordRef.current.focus()
      }
      return false
    }
    if (isSettingNewPassword && (user.currentPassword === '' || user.currentPassword === null || user.currentPassword === undefined)) {
      toast.error('Current password is required')
      setObjCheckInput({ ...defaultObjCheckInput, isValidCurrentPassword: false })
      if (currentPasswordRef.current) {
        currentPasswordRef.current.focus()
      }
      return false
    }
    if (isSettingNewPassword && (user.newPassword === '' || user.newPassword === null || user.newPassword === undefined)) {
      toast.error('New password is required')
      setObjCheckInput({ ...defaultObjCheckInput, isValidPassword: false })
      if (passwordRef.current) {
        passwordRef.current.focus()
      }
      return false
    }
    return true
  }

  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false)

  // Handles enabling new password setting mode.
  const handleSetNewPasswordClick = () => {
    if (user.googleId) {
      toast.warning('Bạn đang dùng tài khoản Google để đăng nhập, vui lòng truy cập Google để thay đổi mật khẩu')
      return
    }
    setIsSettingNewPassword(true)
  }

  const isUserChanged = () => {
    return JSON.stringify(user) !== JSON.stringify(originalUser)
  }

  const handleSaveChanges = async () => {
    try {
      if (!isUserChanged()) {
        toast.info('No changes detected')
        return
      }
      if (isValidInputs()) {
        const { id, newPassword, password, ...payload } = user
        let finalPayload: PayloadType = payload
        if (newPassword) {
          finalPayload = { ...payload, password: newPassword }
        }
        const response = await updateUser(parseInt(id), finalPayload)
        if (response.status === 200) {
          toast.success('Update successfully')
          setIsEditing(false)
          setIsSettingNewPassword(false)
          const tokens = getFromLocalStorage<any>('tokens')
          tokens.firstName = response.data.firstName
          tokens.lastName = response.data.lastName
          tokens.email = response.data.email
          localStorage.setItem('tokens', JSON.stringify(tokens))
          window.dispatchEvent(new Event('storage'))
          setOriginalUser(user)
        } else {
          toast.error('Update failed 1')
        }
      }
    } catch (error: any) {
      toast.error(error.message)
      if (error.field) {
        setErrorField(error.field)
        if (error.field === 'currentPassword') {
          currentPasswordRef.current?.focus()
        }
      }
    }
  }

  // Thêm các biến trạng thái mới cho việc chỉnh sửa avatar
  const [isAvatarEditing, setIsAvatarEditing] = useState(false)
  const [avatarImage, setAvatarImage] = useState<File | null>(null)
  const [avatarScale, setAvatarScale] = useState<number>(1)
  const [editor, setEditor] = useState<AvatarEditor | null>(null)
  const [avatarRotate, setAvatarRotate] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

        const response = await updateAvatar(user.id, avatarUrl)
        if (response.status === 200) {
          toast.success('Cập nhật avatar thành công')
          const updatedAvatar = response.data.avatar
          setUser({ ...user, avatar: updatedAvatar })
          setIsAvatarEditing(false)
          setAvatarRotate(0)
          setAvatarScale(1)

          // Cập nhật avatar trong localStorage
          const tokens = getFromLocalStorage<any>('tokens')
          tokens.avatar = updatedAvatar
          localStorage.setItem('tokens', JSON.stringify(tokens))
          window.dispatchEvent(new Event('storage'))

          await findUserById(user.id)
        } else {
          toast.error('Cập nhật avatar thất bại')
        }
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
  const getAvatarUrl = (avatarPath?: string) => {
    return avatarPath ?? 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
  }
  const getDisplayName = () => {
    return `${originalUser?.firstName || ''} ${originalUser?.lastName || ''}`
  }
  return (
       <div className="bg-white shadow-lg rounded-sm border border-slate-200 w-full">
         <div className="relative">
           <img className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover" src={ImageCover} alt="User cover" />
           <div className="absolute left-4 sm:left-8 md:left-10 -bottom-14 sm:-bottom-16 md:-bottom-20 flex items-center">
             <div className="relative">
               <div className="rounded-full border-4 border-teal-400 overflow-hidden w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 flex-shrink-0">
                 <img
                   className="w-full h-full object-cover"
                   src={getAvatarUrl(user.avatar)}
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
             <div className="mt-16 ml-4 sm:ml-6 flex flex-col justify-center w-36 sm:w-44 md:w-64 lg:w-72 xl:w-80">
               <p className='font-semibold text-base sm:text-lg md:text-xl overflow-hidden overflow-ellipsis whitespace-nowrap'>{getDisplayName()}</p>
               <p className='text-gray-500 text-xs sm:text-sm md:text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>{user?.email}</p>
             </div>
           </div>
         </div>
         <div className="mt-8 sm:mt-12 md:mt-16 flex justify-end pr-4 sm:pr-8 md:pr-10 lg:pr-12">
           <button className="bg-gray-300 text-black rounded-md px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-400 hover:text-black flex items-center" onClick={handleEditProfile}>
             <ManageAccountsIcon className='mr-2 -mt-1' />
             <span className="hidden sm:inline">{t('profile.editProfile')}</span>
           </button>
         </div>

         <div className='p-5'>
         <div className="my-16 bg-white p-5">
           <div>
             <div className="grid gap-5 md:grid-cols-4">
               <div>
                 {/* Start */}
                 <div>
                   <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="firstName">
                     {t('profile.firstName')}
                   </label>
                   <input
                     ref={firstNameRef}
                     id="firstName"
                     className={objCheckInput.isValidFirstName ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                     type="text"
                     required
                     value={user?.firstName ?? ''}
                     onChange={(e) => {
                       setUser({ ...user, firstName: e.target.value })
                       setObjCheckInput({ ...objCheckInput, isValidFirstName: true })
                     }}
                     disabled={!isEditing}
                   />
                 </div>
                 {/* End */}
               </div>

               <div>
                 {/* Start */}
                 <div>
                   <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="lastName">
                     {t('profile.lastName')}
                   </label>
                   <input id="lastName"
                     className={objCheckInput.isValidLastName ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                     type="text"
                     required
                     value={user?.lastName ?? ''}
                     onChange={(e) => {
                       setUser({ ...user, lastName: e.target.value })
                       setObjCheckInput({ ...objCheckInput, isValidLastName: true })
                     }}
                     disabled={!isEditing}
                   />
                 </div>
                 {/* End */}
               </div>

               {/* Select */}
               <div>
                 <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="gender">
                 {t('profile.gender')}
                 </label>
                 <select id="gender"
                   className={objCheckInput.isValidGender ? `form-select w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-select w-full border p-2 rounded-md focus:outline-none border-red-500'}
                   value={user?.gender ?? ''}
                   onChange={(e) => {
                     setUser({ ...user, gender: e.target.value })
                     setObjCheckInput({ ...objCheckInput, isValidGender: true })
                   }}
                   disabled={!isEditing}
                 >
                   <option value="">{t('profile.selectGender')}</option>
                   <option value="Male">{t('profile.male')}</option>
                   <option value="Female">{t('profile.female')}</option>
                   <option value="Other">{t('profile.other')}</option>
                 </select>
               </div>

               <div>
                 {/* Start */}
                 <div className='w-1/2'>
                   <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="age">
                     {t('profile.age')}
                   </label>
                   <input id="age"
                     className={objCheckInput.isValidAge ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                     type="text"
                     required
                     value={user?.age ?? ''}
                     onChange={(e) => {
                       setUser({ ...user, age: e.target.value })
                       setObjCheckInput({ ...objCheckInput, isValidAge: true })
                     }}
                     disabled={!isEditing}
                   />
                 </div>
                 {/* End */}
               </div>
             </div>
             <div className="grid gap-5 md:grid-cols-2 mt-5">
               {/* Start */}
               <div>
                <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`}>
                  {t('profile.email')}
                </label>
                <input
                  className='form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 disabled:opacity-50 cursor-not-allowed'
                  value={user?.email ?? ''}
                  disabled={true}
                />
              </div>
               {/* End */}
             </div>
             <div className="grid gap-5 md:grid-cols-1 mt-5">
               {/* Start */}
               <div>
                 <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="password">
                   {t('profile.password')}
                 </label>
                 {isSettingNewPassword && (
                   <>
                     <div className="grid gap-5 md:grid-cols-3 mb-4">
                       <input
                         className={objCheckInput.isValidCurrentPassword ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'} ${errorField === 'currentPassword' ? 'border-red-500' : ''} ` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                         type="password"
                         id="currentPassword"
                         placeholder={t('profile.enterCurrentPassword') ?? 'Defaultplaceholder'}
                         onChange={(e) => {
                           setUser({ ...user, currentPassword: e.target.value })
                           setObjCheckInput({ ...objCheckInput, isValidCurrentPassword: true })
                           setErrorField('')
                         }}
                       />
                     </div>
                     <div className="grid gap-5 md:grid-cols-3 mb-4">
                       <input
                         className={objCheckInput.isValidPassword ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                         type="password"
                         id="newPassword"
                         placeholder={t('profile.enterNewPassword') ?? 'Defaultplaceholder'}
                         onChange={(e) => {
                           setUser({ ...user, newPassword: e.target.value })
                           setObjCheckInput({ ...objCheckInput, isValidPassword: true })
                         }}
                       />
                     </div>
                   </>
                 )}
                 {isSettingNewPassword && (
                   <div>
                     <button className="bg-white text-teal-400 px-2 py-2 rounded-md border border-gray-300 hover:bg-teal-400 hover:text-white" onClick={handleCancelSet}>{t('profile.cancelSetNewPassword')}</button>
                   </div>
                 )}
                 {!isSettingNewPassword && (
                   <div>
                     <p className={`text-gray-500 ${isEditing ? '' : 'text-neutral-400'}`}>{t('profile.title')}</p>
                     <button
                       className={`bg-white text-teal-400 px-2 py-2 rounded-md border border-gray-300 hover:bg-teal-400 hover:text-white ${isEditing ? '' : 'opacity-50 cursor-not-allowed text-neutral-400 hover:bg-white hover:text-neutral-400'}`}
                       disabled={!isEditing}
                       onClick={handleSetNewPasswordClick}
                     >
                       {t('profile.setNewPassword')}
                     </button>
                   </div>
                 )}

               </div>
               {/* End */}
             </div>
             {isEditing
               ? (
                 <div className="flex justify-end mt-6">
                   <button className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2  hover:bg-gray-400 hover:text-black" onClick={handleCancelEdit}>{t('profile.cancel')}</button>
                   <button className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white" onClick={handleSaveChanges}>{t('profile.saveChanges')}</button>
                 </div>
                 )
               : null}
           </div>
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
       </div >
  )
}

export default AccountPanel
