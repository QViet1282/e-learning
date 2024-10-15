/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Transition from '../utils/Transition'
import { getFromLocalStorage, removeAllLocalStorage } from 'utils/functions'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import LayersIcon from '@mui/icons-material/Layers'
import NewspaperIcon from '@mui/icons-material/Newspaper'
import ROUTES from 'routes/constant'
import { useTranslation } from 'services/i18n'
// import { useTheme } from 'services/styled-themes'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import CryptoJS from 'crypto-js'
import { logout } from 'api/post/post.api'
import { useDispatch } from 'react-redux'
import ChoiceModal from './ChoiceModal'
import { toast } from 'react-toastify'
import { removeAllNotificationsSlice } from '../redux/notification/notifySlice'

interface DropdownProfileProps {
  align: string
}

function DropdownProfile ({ align }: DropdownProfileProps) {
  const navigate = useNavigate()
  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  useEffect(() => {
    const handleStorageChange = () => {
      setTokens(getFromLocalStorage<any>('tokens'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  const dispatch = useDispatch()

  const userLastName = tokens?.lastName
  const userFirstName = tokens?.firstName
  const userEmail = tokens?.email
  const userAvatar = tokens?.avatar
  const { t, i18n } = useTranslation()
  // const { theme, setTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdown = useRef<HTMLDivElement | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })
  const [choiceModalOpen, setChoiceModalOpen] = useState(false)
  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }) => {
      if (!dropdown.current) return
      if (!dropdownOpen || dropdown.current?.contains(target as Node) || trigger.current?.contains(target as Node)) return
      setDropdownOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }) => {
      if (!dropdownOpen || keyCode !== 27) return
      setDropdownOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  const handleLogout = useCallback(async () => {
    try {
      const response = await logout()
      if (response) {
        removeAllLocalStorage()
        navigate(ROUTES.login)
        dispatch(removeAllNotificationsSlice())
        toast.success(t('homepage.logout_success'))
      }
    } catch (error) {
      console.error(error)
    }
  }, [dispatch, navigate])
  const handleOpenLogOutModal = useCallback(() => {
    setChoiceModalOpen(true)
  }, [])
  const languageOptions = useMemo(() => {
    return [
      { label: 'EN', value: 'en', flag: getUnicodeFlagIcon('GB') },
      { label: 'FR', value: 'fr', flag: getUnicodeFlagIcon('FR') },
      { label: 'JP', value: 'jp', flag: getUnicodeFlagIcon('JP') },
      { label: 'VN', value: 'vi', flag: getUnicodeFlagIcon('VN') }
    ]
  }, [])

  const handleChange = useCallback(
    async (e) => {
      try {
        const newLanguage = e.target.value
        await i18n.changeLanguage(newLanguage)
        setSelectedLanguage(newLanguage)
        localStorage.setItem('selectedLanguage', newLanguage)
      } catch (error) {
        console.log(error)
      }
    },
    [i18n]
  )
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage, i18n])

  const userRole = tokens?.key
  let data: string | undefined
  if (userRole) {
    try {
      const giaiMa = CryptoJS.AES.decrypt(userRole, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
      data = giaiMa.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption error:', error)
    }
  }

  const activateLink = useCallback((isLastItem?: boolean) => {
    return ({ isActive }: { isActive: boolean }) => ({
      marginRight: (isLastItem ?? false) ? 0 : 20,
      color: isActive ? 'green' : ''
    })
  }, [])
  return (
       <div className="relative inline-flex">
         <button
           ref={trigger}
           className="inline-flex justify-center items-center group"
           aria-haspopup="true"
           onClick={() => setDropdownOpen(!dropdownOpen)}
           aria-expanded={dropdownOpen}
         >
           <img className="w-8 h-8 rounded-full" src={userAvatar} width="32" height="32" alt="User" />
         </button>

         <Transition
           className={`origin-top-right absolute top-full min-w-44 bg-white border border-slate-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
           show={dropdownOpen}
           enter="transition ease-out duration-200 transform"
           enterStart="opacity-0 -translate-y-2"
           enterEnd="opacity-100 translate-y-0"
           leave="transition ease-out duration-200"
           leaveStart="opacity-100"
           leaveEnd="opacity-0"
         >
           <div
             ref={dropdown}
             onFocus={() => setDropdownOpen(true)}
             onBlur={() => setDropdownOpen(false)}
           >
             <div className="flex items-center py-1 px-3">
               <img className="w-12 h-12 rounded-full -mt-2" src={userAvatar} width="44" height="44" alt="User" />
               <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-slate-200 w-32">
                 <p className='font-bold text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>
                   {`${userFirstName || ''} ${userLastName || ''}`}
                 </p>
                 <p className='text-gray-500 text-xs overflow-hidden overflow-ellipsis whitespace-nowrap'>{userEmail}</p>
               </div>
             </div>
             <div className='px-2 py-1'>
               <select
                 className="w-full px-4 py-2 rounded-lg font-bold text-gray-700 border border-gray-300 focus:border-indigo-500 focus:outline-none shadow"
                 onChange={handleChange}
                 value={selectedLanguage}
               >
                 {languageOptions.map((option) => (
                   <option key={option.value} value={option.value} className="font-bold py-2">
                     {option.flag}&nbsp;&nbsp;&nbsp;{option.label}&nbsp;&nbsp;{option.value === selectedLanguage && '✔'}
                   </option>
                 ))}
               </select>
             </div>
             <ul>
               <li>
                 <Link
                   className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                   to="/settings/profile"
                   onClick={() => setDropdownOpen(!dropdownOpen)}
                 >
                   <AccountCircleIcon className="mr-2" />
                   {t('dropdown.profile')}
                 </Link>
               </li>

               {/* {(data === 'ADMIN' || data === 'MANAGER') && (

                 <li>
                   <Link
                     className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                     to={ROUTES.userDashboard}
                     onClick={() => setDropdownOpen(!dropdownOpen)}
                   >
                     <QueryStatsRoundedIcon className="mr-2" />
                     {t('dropdown.userDashboard')}
                   </Link>
                 </li>
               )} */}
               <li>
                 <Link
                   className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                   to="/mycourses"
                   onClick={() => setDropdownOpen(!dropdownOpen)}
                 >
                   <LayersIcon className="mr-2" />
                   {t('dropdown.mycourse')}
                 </Link>
               </li>
               <li>
                 <Link
                   className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                   to="/blog"
                   onClick={() => setDropdownOpen(!dropdownOpen)}
                 >
                   <NewspaperIcon className="mr-2" />
                   {t('dropdown.blog')}
                 </Link>
               </li>
               <li>
                 <Link
                   className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                   to="/settings"
                   onClick={() => setDropdownOpen(!dropdownOpen)}
                 >
                   <SettingsIcon className="mr-2" />
                   {t('dropdown.setting')}
                 </Link>
               </li>
               {/* {renderThemeSwitcher} */}
               <li>
                 <button
                   className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                   onClick={handleOpenLogOutModal}
                 >
                   <LogoutIcon className="mr-2" />
                   {t('dropdown.logout')}
                 </button>
               </li>
               <hr className="bg-slate-200 my-2" />
               {(data === 'ADMIN' || data === 'MANAGER') && (
                 <li>
                   {/* <Link
                     className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                     to={ROUTES.userDashboard}
                     onClick={() => setDropdownOpen(!dropdownOpen)}
                   >
                     <AdminPanelSettingsIcon className="mr-2" />
                     {t('dropdown.gottoadmin')}
                   </Link> */}
                 </li>
               )}
             </ul>
           </div>
         </Transition>
         <ChoiceModal
           title={t('homepage.logout')}
           modalOpen={choiceModalOpen}
           setModalOpen={setChoiceModalOpen}
         >
           <div className="text-sm mb-5">
             <div className="space-y-2">
               <p className='text-gray-500 font-bold'>{t('homepage.logout_confirm')}</p>
             </div>
           </div>
           <div className="flex flex-wrap justify-end space-x-2">
             <div className='space-x-2 flex'>
               <button className="flex-1 border rounded-lg btn-sm border-slate-300 hover:border-slate-400 text-slate-600 p-2 font-bold text-sm" onClick={(e) => { e.stopPropagation(); setChoiceModalOpen(false) }}>{t('homepage.decline')}</button>
               <button className="flex-1 border rounded-lg btn-sm bg-indigo-500 hover:bg-indigo-600 text-white p-2 font-bold text-sm" onClick={handleLogout}>{t('homepage.continue')}</button>
             </div>
           </div>
         </ChoiceModal>
       </div>
  )
}

export default DropdownProfile
