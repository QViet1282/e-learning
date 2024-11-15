/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import SidebarLinkGroup from './SidebarLinkGroup'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined'
import logoImg from '../assets/images/navbar/logo.png'
import { getFromLocalStorage, removeLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'

import ROUTES from 'routes/constant'

import { useTranslation } from 'react-i18next'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  const isAuthenticated = !!tokens?.accessToken
  useEffect(() => {
    const handleStorageChange = () => {
      setTokens(getFromLocalStorage<any>('tokens'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  const userRole = tokens?.key
  const userLastName = tokens?.lastName
  const userFirstName = tokens?.firstName
  const userEmail = tokens?.email
  const userAvatar = tokens?.avatar

  let data: string | undefined
  if (userRole) {
    try {
      const giaiMa = CryptoJS.AES.decrypt(userRole, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
      data = giaiMa.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption error:', error)
    }
  }

  const location = useLocation()
  const { pathname } = location

  const sidebar = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded')
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true')

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }) => {
      if (!sidebar.current || !trigger.current) return
      if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return
      setSidebarOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }) => {
      if (!sidebarOpen || keyCode !== 27) return
      setSidebarOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString())
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded')
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded')
    }
  }, [sidebarExpanded])

  const handleLogout = useCallback(async () => {
    removeLocalStorage('tokens')
    navigate(ROUTES.homePage)
  }, [navigate])

  const isAdmin = data?.toUpperCase() === 'ADMIN'
  const isManager = data?.toUpperCase() === 'MANAGER'
  return (
       <div>
         {/* Sidebar backdrop (mobile only) */}
         <div
           className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
             }`}
           aria-hidden="true"
         ></div>

         {/* Sidebar */}
         <div
           id="sidebar"
           ref={sidebar}
           className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-white shadow-right p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'
             }`}
         >
           {/* Sidebar header */}
           <div className="flex justify-between mb-10 pr-3 sm:px-2">
             {/* Close button */}
             <button
               ref={trigger}
               className="lg:hidden text-slate-500 hover:text-slate-400"
               onClick={() => setSidebarOpen(!sidebarOpen)}
               aria-controls="sidebar"
               aria-expanded={sidebarOpen}
             >
               <span className="sr-only">Close sidebar</span>
               <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
               </svg>
             </button>
            {/* Logo */}
            <NavLink end to="/" className="flex items-center">
              <img src={logoImg} alt="logo" className="h-10" />
              <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 ml-2">
                VIETCODE
              </span>
            </NavLink>
           </div>

           {/* Links */}
           <div className="space-y-8">
             {/* Pages group */}
             <div>
             {(isAdmin || isManager) && (
                <>
               <div>
                 <div className="flex items-center">
                   <div className="flex-shrink-0">
                     <img className="rounded-full object-cover w-10 h-10" src={userAvatar} alt="User upload" />
                   </div>
                   <div className="w-36 ml-4 flex flex-col justify-center lg:hidden lg:sidebar-expanded:block 2xl:block">
                     <p className='font-semibold text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>
                       {`${userFirstName || ''} ${userLastName || ''}`}
                     </p>
                     <p className='text-gray-500 text-xs overflow-hidden overflow-ellipsis whitespace-nowrap'>{userEmail}</p>
                   </div>
                 </div>
                 <div className=" ml-1 text-gray-500 text-base font-mono">
                   <p>{data}</p>
                 </div>
               </div>
               <h3 className="text-xs uppercase text-slate-500 font-semibold pl-3 mt-3">
                 <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">
                   •••
                 </span>
                 <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">{t('sidebar.pages')}</span>
               </h3>
                </>
             )}
              {(!isAdmin && !isManager) && (
                <>
                  <ul className="mt-3">
                    {/* Home */}
                    <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/' && 'bg-teal-300 text-blue-500'}`}>
                      <NavLink
                        end
                        to="/"
                        className={`block ${pathname === '/' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/' && 'hover:text-slate-200'}`}
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            {t('navbar.homepage')}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                    {/* Teaching */}
                    <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes(isAdmin ? 'admin' : isManager ? 'management' : 'teaching') && 'bg-teal-300 text-blue-500'}`}>
                      <NavLink
                        end
                        to={isAdmin ? '/admin' : isManager ? '/management' : '/teaching'}
                        className={`block ${pathname.includes(isAdmin ? 'admin' : isManager ? 'management' : 'teaching') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes(isAdmin ? 'admin' : isManager ? 'management' : 'teaching') && 'hover:text-slate-200'} rounded`}
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            {isAdmin ? t('navbar.admin') : isManager ? t('navbar.teacher') : t('navbar.teaching')}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                    {/* Contact */}
                    <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('contact') && 'bg-teal-300 text-blue-500'}`}>
                      <NavLink
                        end
                        to="/contact"
                        className={`block ${pathname.includes('contact') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('contact') && 'hover:text-slate-200'}`}
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            {t('navbar.contact_us')}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                    {/* Cart */}
                    {isAuthenticated && (
                      <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('cart') && 'bg-teal-300 text-blue-500'}`}>
                        <NavLink
                          end
                          to="/cart"
                          className={`block ${pathname.includes('cart') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('cart') && 'hover:text-slate-200'}`}
                        >
                          <div className="flex items-center">
                            <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              {t('navbar.cart')}
                            </span>
                          </div>
                        </NavLink>
                      </li>
                    )}
                  </ul>
                </>
              )}
               {(isAdmin || isManager) && (
                <>
               <ul className="mt-3">
                 {/* users */}
                 <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('user') && 'bg-teal-300 text-blue-500'}`}>
                   <NavLink
                     end
                     to="/user"
                     className={`block ${pathname.includes('user') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('user') && 'hover:text-slate-200'}`}
                   >
                     <div className="flex items-center">
                       <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                         <path
                           className={`fill-current text-slate-600 ${pathname.includes('user') && 'text-indigo-500'}`}
                           d="M20 7a.75.75 0 01-.75-.75 1.5 1.5 0 00-1.5-1.5.75.75 0 110-1.5 1.5 1.5 0 001.5-1.5.75.75 0 111.5 0 1.5 1.5 0 001.5 1.5.75.75 0 110 1.5 1.5 1.5 0 00-1.5 1.5A.75.75 0 0120 7zM4 23a.75.75 0 01-.75-.75 1.5 1.5 0 00-1.5-1.5.75.75 0 110-1.5 1.5 1.5 0 001.5-1.5.75.75 0 111.5 0 1.5 1.5 0 001.5 1.5.75.75 0 110 1.5 1.5 1.5 0 00-1.5 1.5A.75.75 0 014 23z"
                         />
                         <path
                           className={`fill-current text-slate-400 ${pathname.includes('user') && 'text-white'}`}
                           d="M17 23a1 1 0 01-1-1 4 4 0 00-4-4 1 1 0 010-2 4 4 0 004-4 1 1 0 012 0 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-1 1zM7 13a1 1 0 01-1-1 4 4 0 00-4-4 1 1 0 110-2 4 4 0 004-4 1 1 0 112 0 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-1 1z"
                         />
                       </svg>
                       <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                         {t('sidebar.users')}
                       </span>
                     </div>
                   </NavLink>
                 </li>
                 {/* Settings */}
                 <SidebarLinkGroup activecondition={pathname.includes('settings')}>
                   {(handleClick, open) => {
                     return (
                       <React.Fragment>
                         <a
                           href="#0"
                           className={`block ${pathname.includes('settings') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('settings') && 'hover:text-slate-200'}`}
                           onClick={(e) => {
                             e.preventDefault()
                             sidebarExpanded ? handleClick() : setSidebarExpanded(true)
                           }}
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex items-center">
                               <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                                 <path
                                   className={`fill-current text-slate-600 ${pathname.includes('settings') && 'text-indigo-500'}`}
                                   d="M19.714 14.7l-7.007 7.007-1.414-1.414 7.007-7.007c-.195-.4-.298-.84-.3-1.286a3 3 0 113 3 2.969 2.969 0 01-1.286-.3z"
                                 />
                                 <path
                                   className={`fill-current text-slate-400 ${pathname.includes('settings') && 'text-indigo-300'}`}
                                   d="M10.714 18.3c.4-.195.84-.298 1.286-.3a3 3 0 11-3 3c.002-.446.105-.885.3-1.286l-6.007-6.007 1.414-1.414 6.007 6.007z"
                                 />
                                 <path
                                   className={`fill-current text-slate-600 ${pathname.includes('settings') && 'text-indigo-500'}`}
                                   d="M5.7 10.714c.195.4.298.84.3 1.286a3 3 0 11-3-3c.446.002.885.105 1.286.3l7.007-7.007 1.414 1.414L5.7 10.714z"
                                 />
                                 <path
                                   className={`fill-current text-slate-400 ${pathname.includes('settings') && 'text-indigo-300'}`}
                                   d="M19.707 9.292a3.012 3.012 0 00-1.415 1.415L13.286 5.7c-.4.195-.84.298-1.286.3a3 3 0 113-3 2.969 2.969 0 01-.3 1.286l5.007 5.006z"
                                 />
                               </svg>
                               <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                 {t('sidebar.settings')}
                               </span>
                             </div>
                             {/* Icon */}
                             <div className="flex shrink-0 ml-2">
                               <svg
                                 className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 ${open && 'rotate-180'}`}
                                 viewBox="0 0 12 12"
                               >
                                 <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                               </svg>
                             </div>
                           </div>
                         </a>
                         <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                           <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                             <li className="mb-1 last:mb-0">
                               <NavLink
                                 end
                                 to="/settings/profile"
                                 className={({ isActive }) =>
                                   'block text-balack hover:text-slate-200 transition duration-150 truncate ' + (isActive ? '!text-teal-500' : '')
                                 }
                               >
                                 <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                   {t('sidebar.myAccount')}
                                 </span>
                               </NavLink>
                             </li>
                           </ul>
                         </div>
                       </React.Fragment>
                     )
                   }}
                 </SidebarLinkGroup>
                 <hr className="bg-slate-200 my-5" />
                 {/* Return to User */}
                 <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0  ${pathname === '/' && 'bg-teal-300 text-blue-500'}`}>
                   <NavLink
                     end
                     to="/"
                     className={`block ${pathname === '/' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/' && 'hover:text-slate-200'}`}
                   >
                     <div className="flex items-center">
                       <KeyboardReturnOutlinedIcon />
                       <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                         {t('sidebar.returnToUser')}
                       </span>
                     </div>
                   </NavLink>
                 </li>
                 {/* Log out */}
                 <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('logout') && 'bg-teal-300 text-blue-500'}`}>
                   <NavLink
                     end
                     to="/"
                     onClick={handleLogout}
                     className={`block ${pathname.includes('logout') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('logout') && 'hover:text-slate-200'}`}
                   >
                     <div className="flex items-center">
                       <LogoutOutlinedIcon />
                       <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                         {t('sidebar.logOut')}
                       </span>
                     </div>
                   </NavLink>
                 </li>
               </ul>
                </>
               )}
             </div>
           </div>

           {/* Expand / collapse button */}
           <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
             <div className="px-3 py-2">
               <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
                 <span className="sr-only">Expand / collapse sidebar</span>
                 <svg className="w-6 h-6 fill-current sidebar-expanded:rotate-180" viewBox="0 0 24 24">
                   <path className="text-slate-400" d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z" />
                   <path className="text-slate-600" d="M3 23H1V1h2z" />
                 </svg>
               </button>
             </div>
           </div>
         </div>
       </div>
  )
}

export default Sidebar
