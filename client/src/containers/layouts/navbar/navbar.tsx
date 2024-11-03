/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prefer-regex-literals */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* LAYOUT NAVBAR COMPONENT
   ========================================================================== */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Notifications from '../../../components/DropdownNotifications'
import UserMenu from '../../../components/DropdownProfile'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFromLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { useSelector, useDispatch } from 'react-redux'
import logoImg from '../../../assets/images/navbar/logo.png'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import imgFlagUK from '../../../assets/images/login/Flag_of_the_United_Kingdom.png'
import imgFlagVN from '../../../assets/images/login/Flag_of_Vietnam.png'
import {
  selectCartItems,
  fetchCart
} from '../../../redux/cart/cartSlice'
import { AppDispatch } from '../../../redux/store'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Navbar: FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { pathname } = location
  const navigate = useNavigate()
  const tokens = getFromLocalStorage<any>('tokens')
  const isAuthenticated = !!tokens?.accessToken
  const userRole = tokens?.key
  const userId = tokens?.id
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })
  let data
  if (userRole) {
    try {
      const giaiMa = CryptoJS.AES.decrypt(userRole, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
      data = giaiMa.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption error:', error)
    }
  }

  const dispatch: AppDispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const totalItems = cartItems.length

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart({ userId, forceReload: true }))
    }
  }, [dispatch, userId, isAuthenticated])

  const pathRegEx = new RegExp('^/lesson/edit/[^/]+$')
  const isPathMatch = pathRegEx.test(location.pathname)
  const isAdmin = data?.toUpperCase() === 'ADMIN'
  const alwaysShowHamburgerPaths = [
    '/permission',
    '/user',
    '/settings/profile',
    '/lesson',
    '/lesson/add',
    '/dashboard/enrollment_dashboard'
  ]
  const showHamburgerButton = (alwaysShowHamburgerPaths.includes(location.pathname) && isAdmin) || (isPathMatch && isAdmin)

  const handleLoginClick = () => {
    // Nếu `from` không tồn tại, lưu `location.pathname`
    if (!location.state?.from) {
      sessionStorage.setItem('redirectPath', location.pathname)
    }
    navigate('/login', { state: { from: location } })
  }

  const handleRegisterClick = () => {
    navigate('signup')
  }
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage, i18n])

  const languageOptions = useMemo(
    () => [
      { label: 'En', value: 'en', flagUrl: imgFlagUK },
      { label: 'Vi', value: 'vi', flagUrl: imgFlagVN }
    ],
    []
  )

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
        console.log('Error during language change or validation', error)
      }
    },
    [i18n, t]
  )
  return (
    <header className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-bottom">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">

          {/* Header: Left side */}
          <div className="flex">
            {/* Hamburger button */}
            {showHamburgerButton && (
              <button
                className="text-slate-500 hover:text-slate-600 lg:hidden"
                aria-controls="sidebar"
                aria-expanded={sidebarOpen}
                onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen) }}
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="5" width="16" height="2" />
                  <rect x="4" y="11" width="16" height="2" />
                  <rect x="4" y="17" width="16" height="2" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <a href="/" className="flex-shrink-0 flex items-center">
              <img src={logoImg} alt="logo" className="h-10" /> <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 ml-2">VIETCODE</span>
            </a>
          </div>

          {/* Header: Center */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:space-x-2">
            {/* Links */}
            <a href="/" className={`block ${pathname === '/' ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/' && 'hover:text-slate-200'} rounded px-2`}>
              {t('navbar.homepage')}
            </a>
            <a href="/about" className={`block ${pathname.includes('about') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('about') && 'hover:text-slate-200'} rounded px-2`}>
              {t('navbar.about_us')}
            </a>
            <a href="/contact" className={`block ${pathname.includes('contact') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('contact') && 'hover:text-slate-200'} rounded px-2`}>
              {t('navbar.contact_us')}
            </a>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/cart')}
                className="items-center block text-gray-500 hover:text-neutral-400 truncate transition duration-150 rounded px-2 relative"
              >
                {t('navbar.cart')}
                <ShoppingCartOutlinedIcon sx={{ color: 'teal' }} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-block h-4 w-4 text-xs font-semibold text-white bg-red-600 rounded-full text-center">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {!isAuthenticated ? (
              <>
                {/* Language Selector */}
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
                <button
                  onClick={handleRegisterClick}
                  className="text-xs sm:text-sm md:text-base hover:bg-teal-600 font-medium border border-teal-400 bg-teal-400 text-white px-1 sm:px-1.5 md:px-2.5 py-1 rounded-full"
                >
                  {t('navbar.signup')}
                </button>
                <button
                  onClick={handleLoginClick}
                  className="text-xs sm:text-sm md:text-base hover:bg-teal-600 hover:text-white font-medium border border-teal-400 bg-white text-teal-400 px-1 sm:px-1.5 md:px-2.5 py-1 rounded-full"
                >
                  {t('navbar.login')}
                </button>
              </>
            )
              : (
                <>
                  <Notifications align="right" />
                  <hr className="w-px h-6 bg-slate-200 mx-3" />
                  <UserMenu align="right" />
                </>
                )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
