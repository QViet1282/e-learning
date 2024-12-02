/* eslint-disable multiline-ternary */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import SidebarLinkGroup from './SidebarLinkGroup'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined'
import logoImg from '../assets/images/navbar/logo.png'
import notiImg from '../assets/images/sidebar/notification.png'
import userImg from '../assets/images/sidebar/group.png'
import payoutImg from '../assets/images/sidebar/payout.png'
import courseImg from '../assets/images/sidebar/catalogue.png'
import statisticalImg from '../assets/images/sidebar/statistics.png'
import settingImg from '../assets/images/sidebar/settings.png'
import profileImg from '../assets/images/sidebar/admin.png'
import dashboardImg from '../assets/images/sidebar/data-visualization.png'
import { getFromLocalStorage, removeLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'
import { useMediaQuery } from 'react-responsive'
import imgFlagUK from '../assets/images/login/Flag_of_the_United_Kingdom.png'
import imgFlagVN from '../assets/images/login/Flag_of_Vietnam.png'
import Select from 'react-select'
import ROUTES from 'routes/constant'

import { useTranslation } from 'react-i18next'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage, i18n])
  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  // const isAuthenticated = !!tokens?.accessToken
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
    setSidebarOpen(false)
    removeLocalStorage('tokens')
    navigate(ROUTES.homePage)
  }, [navigate])

  const isAdmin = data?.toUpperCase() === 'ADMIN'
  const isTeacher = data?.toUpperCase() === 'TEACHER'

  const pathsToHide = ['/management', '/management/course', '/management/notification', '/management/statistical', '/management/user', '/management/payout', '/management/detail-course', '/settings/profile', 'dashboard/lectuter']
  const shouldShowDefaultLinks = !pathsToHide.some(path => pathname.includes(path))
  const isUser = data?.toUpperCase() === 'USER'
  const isOnProfilePage = pathname === '/settings/profile'

  // Điều kiện để hiển thị các liên kết Home, Cart, Contact và Teaching
  const shouldShowLinks =
          (shouldShowDefaultLinks && !isAdmin && !isTeacher) || (isUser && isOnProfilePage)
  const shouldShowOnlyOneLink = shouldShowLinks && shouldShowDefaultLinks

  const isMobile = useMediaQuery({ query: '(max-width: 1024px)' })
  /**
         *
         * @description
         * Trên thiết bị di động (isMobile là true):
         *  Bất kể đường dẫn nào, khi người dùng nhấn vào liên kết, setSidebarOpen(false) sẽ được gọi
         * Trên màn hình lớn (isMobile là false):
         *  Nếu đường dẫn nằm trong pathsToHideB, sidebar sẽ mở
         *  Nếu đường dẫn không nằm trong pathsToHideB, sidebar sẽ đóng
         */
  const handleLinkClick = (path: string) => {
    if (isMobile) {
      // Trên thiết bị di động, bất kể đường dẫn nào, sidebar sẽ đóng
      setSidebarOpen(false)
      // } else {
      //   // Trên màn hình lớn
      //   if (pathsToHideB.includes(path)) {
      //     // Nếu đường dẫn nằm trong pathsToHideB, sidebar sẽ mở
      //     setSidebarOpen(true)
      //   } else {
      //     // Nếu đường dẫn không nằm trong pathsToHideB, sidebar sẽ đóng
      //     setSidebarOpen(false)
      //   }
    }
  }
  const languageOptions = useMemo(() => [
    { label: 'En', value: 'en', flagUrl: imgFlagUK },
    { label: 'Vi', value: 'vi', flagUrl: imgFlagVN }
  ], [])

  const formatOptionLabel = ({ label, flagUrl }: any) => (
       <div className="flex items-center">
         <img src={flagUrl} alt="" className="w-6 h-4" />
       </div>
  )

  const handleChange = useCallback(
    async (selectedOption) => {
      const newLanguage = selectedOption.value
      try {
        await i18n.changeLanguage(newLanguage)
        setSelectedLanguage(newLanguage)
        localStorage.setItem('selectedLanguage', newLanguage)
      } catch (error) {
        console.log(error)
      }
    },
    [i18n]
  )

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
                  <NavLink end to="/" className="flex items-center" onClick={() => handleLinkClick('/')}>
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
                   {((isAdmin && !shouldShowDefaultLinks) || (isTeacher && !shouldShowDefaultLinks)) && (
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
                    {shouldShowOnlyOneLink ? (
                       <>
                       <ul className="mt-3">
                         {/* Home */}
                         <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/' && 'bg-teal-300 text-blue-500'}`}>
                           <NavLink
                             end
                             to="/"
                             className={`block ${pathname === '/' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/' && 'hover:text-slate-200'}`}
                             onClick={() => handleLinkClick('/')}
                           >
                             <div className="flex items-center">
                               <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                 {t('navbar.homepage')}
                               </span>
                             </div>
                           </NavLink>
                         </li>
                         {/* Teaching */}
                         <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') && 'bg-teal-300 text-blue-500'}`}>
                           <NavLink
                             end
                             to={isAdmin ? '/management/course' : isTeacher ? '/dashboard/lectuter' : '/teaching'}
                             className={`block ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') && 'hover:text-slate-200'} rounded`}
                             onClick={ () => handleLinkClick(isAdmin ? '/management/course' : isTeacher ? '/dashboard/lectuter' : '/teaching')}
                           >
                             <div className="flex items-center">
                               <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                 {isAdmin ? t('navbar.admin') : isTeacher ? t('navbar.teacher') : t('navbar.teaching')}
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
                             onClick={() => handleLinkClick('/contact')}
                           >
                             <div className="flex items-center">
                               <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                 {t('navbar.contact_us')}
                               </span>
                             </div>
                           </NavLink>
                         </li>
                         {/* Cart */}
                         {/* {isAuthenticated && (
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
                         )} */}
                       </ul>
                     </>
                    ) : (
                        <>
                        {shouldShowLinks && (
                      <>
                        <ul className="mt-3">
                          {/* Home */}
                          <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/' && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to="/"
                              className={`block ${pathname === '/' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/' && 'hover:text-slate-200'}`}
                              onClick={() => handleLinkClick('/')}
                            >
                              <div className="flex items-center">
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('navbar.homepage')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                          {/* Teaching */}
                          <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to={isAdmin ? '/management/course' : isTeacher ? '/dashboard/lectuter' : '/teaching'}
                              className={`block ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') && 'hover:text-slate-200'} rounded`}
                              onClick={ () => handleLinkClick(isAdmin ? '/management/course' : isTeacher ? '/dashboard/lectuter' : '/teaching')}
                            >
                              <div className="flex items-center">
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {isAdmin ? t('navbar.admin') : isTeacher ? t('navbar.teacher') : t('navbar.teaching')}
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
                              onClick={() => handleLinkClick('/contact')}
                            >
                              <div className="flex items-center">
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('navbar.contact_us')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                          {/* Cart */}
                          {/* {isAuthenticated && (
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
                          )} */}
                        </ul>
                      </>
                        )}
                    {shouldShowDefaultLinks && (
                      <>
                        <ul className="mt-3">
                          {/* Home */}
                          <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/' && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to="/"
                              className={`block ${pathname === '/' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/' && 'hover:text-slate-200'}`}
                              onClick={() => handleLinkClick('/')}
                            >
                              <div className="flex items-center">
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('navbar.homepage')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                          {/* Teaching */}
                          <li className={`py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to={isAdmin ? '/management/course' : isTeacher ? '/dashboard/lectuter' : '/teaching'}
                              className={`block ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes(isAdmin ? 'management/course' : isTeacher ? 'dashboard/lectuter' : 'teaching') && 'hover:text-slate-200'} rounded`}
                              onClick={ () => handleLinkClick(isAdmin ? '/management/course' : isTeacher ? '/dashboard/lectuter' : '/teaching')}
                            >
                              <div className="flex items-center">
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {isAdmin ? t('navbar.admin') : isTeacher ? t('navbar.teacher') : t('navbar.teaching')}
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
                              onClick={() => handleLinkClick('/contact')}
                            >
                              <div className="flex items-center">
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('navbar.contact_us')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                          {/* Cart */}
                          {/* {isAuthenticated && (
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
                          )} */}
                        </ul>
                      </>
                    )}
                    </>
                    )
                    }
                    {(isTeacher && !shouldShowDefaultLinks) && (
                      <>
                        <ul className="mt-3">
                          {/* dashboard/lectuter */}
                          <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('dashboard/lectuter') && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to="/dashboard/lectuter"
                              className={`block ${pathname.includes('dashboard/lectuter') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('dashboard/lectuter') && 'hover:text-slate-200'}`}
                              onClick={() => handleLinkClick('/dashboard/lectuter')}
                            >
                              <div className="flex items-center">
                                <img src={dashboardImg} alt="dashboard" className="w-6 h-6" />
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('sidebar.dashboard_lecturer')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                        </ul>
                      </>
                    )}
                    {(isAdmin && !shouldShowDefaultLinks) && (
                      <>
                        <ul className="mt-3">
                          {/* /management/course */}
                          <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('management/course') && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to="/management/course"
                              className={`block ${pathname.includes('management/course') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('management/course') && 'hover:text-slate-200'}`}
                              onClick={() => handleLinkClick('/management/course')}
                            >
                              <div className="flex items-center">
                                <img src={courseImg} alt="course" className="w-6 h-6" />
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('sidebar.management_course')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                          {/* /management/notification */}
                          <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('management/notification') && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to="/management/notification"
                              className={`block ${pathname.includes('management/notification') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('management/notification') && 'hover:text-slate-200'}`}
                              onClick={() => handleLinkClick('/management/notification')}
                            >
                              <div className="flex items-center">
                                <img src={notiImg} alt="notification" className="w-6 h-6" />
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('sidebar.management_notification')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                          {/* /management/statistical */}
                          <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('management/statistical') && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to="/management/statistical"
                              className={`block ${pathname.includes('management/statistical') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('management/statistical') && 'hover:text-slate-200'}`}
                              onClick={() => handleLinkClick('/management/statistical')}
                            >
                              <div className="flex items-center">
                               <img src={statisticalImg} alt="statistical" className="w-6 h-6" />
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('sidebar.management_statistical')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                           {/* /management/user */}
                           <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('management/user') && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to="/management/user"
                              className={`block ${pathname.includes('management/user') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('management/user') && 'hover:text-slate-200'}`}
                              onClick={() => handleLinkClick('/management/user')}
                            >
                              <div className="flex items-center">
                               <img src={userImg} alt="user" className="w-6 h-6" />
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('sidebar.management_user')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                          {/* /management/payout */}
                          <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('management/payout') && 'bg-teal-300 text-blue-500'}`}>
                            <NavLink
                              end
                              to="/management/payout"
                              className={`block ${pathname.includes('management/payout') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('management/payout') && 'hover:text-slate-200'}`}
                              onClick={() => handleLinkClick('/management/payout')}
                            >
                              <div className="flex items-center">
                               <img src={payoutImg} alt="user" className="w-6 h-6" />
                                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                  {t('sidebar.management_payout')}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                        </ul>
                      </>
                    )}
                     {((isAdmin && !shouldShowDefaultLinks) || (isTeacher && !shouldShowDefaultLinks)) && (
                      <>
                     <ul className="mt-3">
                       {/* management */}
                       {/* <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('management') && 'bg-teal-300 text-blue-500'}`}>
                         <NavLink
                           end
                           to="/management"
                           className={`block ${pathname.includes('management') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('management') && 'hover:text-slate-200'}`}
                           onClick={() => handleLinkClick('/management')}
                         >
                           <div className="flex items-center">
                             <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                               <path
                                 className={`fill-current text-slate-600 ${pathname.includes('management') && 'text-indigo-500'}`}
                                 d="M20 7a.75.75 0 01-.75-.75 1.5 1.5 0 00-1.5-1.5.75.75 0 110-1.5 1.5 1.5 0 001.5-1.5.75.75 0 111.5 0 1.5 1.5 0 001.5 1.5.75.75 0 110 1.5 1.5 1.5 0 00-1.5 1.5A.75.75 0 0120 7zM4 23a.75.75 0 01-.75-.75 1.5 1.5 0 00-1.5-1.5.75.75 0 110-1.5 1.5 1.5 0 001.5-1.5.75.75 0 111.5 0 1.5 1.5 0 001.5 1.5.75.75 0 110 1.5 1.5 1.5 0 00-1.5 1.5A.75.75 0 014 23z"
                               />
                               <path
                                 className={`fill-current text-slate-400 ${pathname.includes('management') && 'text-white'}`}
                                 d="M17 23a1 1 0 01-1-1 4 4 0 00-4-4 1 1 0 010-2 4 4 0 004-4 1 1 0 012 0 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-1 1zM7 13a1 1 0 01-1-1 4 4 0 00-4-4 1 1 0 110-2 4 4 0 004-4 1 1 0 112 0 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-1 1z"
                               />
                             </svg>
                             <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                               {t('sidebar.management')}
                             </span>
                           </div>
                         </NavLink>
                       </li> */}
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
                                     <img src={settingImg} alt="setting" className="w-6 h-6" />
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
                                       onClick={() => handleLinkClick('/settings/profile')}
                                     >
                                       <div className="flex items-center">
                                         <img src={profileImg} alt="profile" className="w-6 h-6" />
                                         <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                           {t('sidebar.myAccount')}
                                         </span>
                                       </div>
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
                           onClick={() => handleLinkClick('/')}
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
                     <div className="ml-3 mt-2">
                       <Select
                         value={languageOptions.find(option => option.value === selectedLanguage)}
                         onChange={handleChange}
                         options={languageOptions}
                         formatOptionLabel={formatOptionLabel}
                         className="!w-12"
                         classNamePrefix="select"
                         isSearchable={false}
                         styles={{
                           control: (base) => ({
                             ...base,
                             minHeight: '24px',
                             height: '24px',
                             padding: 0,
                             border: 'none',
                             boxShadow: 'none',
                             '&:hover': {
                               border: 'none'
                             }
                           }),
                           valueContainer: (base) => ({
                             ...base,
                             height: '24px',
                             padding: 0,
                             margin: 0
                           }),
                           dropdownIndicator: (base) => ({
                             ...base,
                             padding: 0
                           }),
                           option: (base) => ({
                             ...base,
                             padding: '2px 4px'
                           })
                         }}
                       />
                     </div>
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
