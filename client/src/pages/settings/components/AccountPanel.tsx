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
import { findUserById, updateUser } from '../../../api/post/post.api'
import { getFromLocalStorage } from 'utils/functions'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

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
    currentPassword: ''
  })
  const [originalUser, setOriginalUser] = useState<User>(user)

  useEffect(() => {
    const fetchUser = async () => {
      const tokens = getFromLocalStorage<any>('tokens')
      const userId = tokens?.id
      if (userId) {
        const response = await findUserById(userId)
        setUser(response.data)
        setOriginalUser(response.data)
        console.log(response.data)
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
    setUser(originalUser)
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

  const handleSetNewPasswordClick = () => {
    setIsSettingNewPassword(true)
  }

  const handleSaveChanges = async () => {
    try {
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
  return (
       <div className="bg-white shadow-lg rounded-sm border border-slate-200 w-full">
         <div className="relative">
           <img className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover" src={ImageCover} alt="User cover" />
           <div className="absolute left-4 sm:left-8 md:left-10 -bottom-14 sm:-bottom-16 md:-bottom-20 flex items-center">
             <div className="rounded-full border-4 border-teal-400 overflow-hidden w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 flex-shrink-0">
               <img className="w-full h-full object-cover" src={'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'} alt="User upload" />
             </div>
             <div className="mt-16 ml-4 sm:ml-6 flex flex-col justify-center w-36 sm:w-44 md:w-64 lg:w-72 xl:w-80">
               <p className='font-semibold text-base sm:text-lg md:text-xl overflow-hidden overflow-ellipsis whitespace-nowrap'>{user?.firstName + ' ' + user?.lastName}</p>
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
         <div className="my-16 bg-white border border-gray-200 rounded-lg shadow p-5">
           <div>
             <h2 className="text-2xl text-slate-800 font-bold mb-6">{t('profile.myProfile')}</h2>
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
                 <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="email">
                   {t('profile.email')}
                 </label>
                 <input id="email"
                   className={objCheckInput.isValidEmail ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                   type="email"
                   required
                   value={user?.email ?? ''}
                   onChange={(e) => {
                     setUser({ ...user, email: e.target.value })
                     setObjCheckInput({ ...objCheckInput, isValidEmail: true })
                   }}
                   disabled={!isEditing}
                 />
               </div>
               {/* End */}
             </div>
             {user?.password && (
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
             )}
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
       </div >
  )
}

export default AccountPanel
