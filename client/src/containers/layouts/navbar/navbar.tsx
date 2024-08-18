/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* LAYOUT NAVBAR COMPONENT
   ========================================================================== */

import React, { FC } from 'react'
import UserMenu from '../../../components/DropdownProfile'
import { useLocation } from 'react-router-dom'
import { getFromLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Navbar: FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen
}) => {
  const location = useLocation()
  const { pathname } = location

  const tokens = getFromLocalStorage<any>('tokens')
  const userRole = tokens?.key
  let data
  if (userRole) {
    try {
      const giaiMa = CryptoJS.AES.decrypt(userRole, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
      data = giaiMa.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption error:', error)
    }
  }

  // eslint-disable-next-line prefer-regex-literals
  const pathRegEx = new RegExp('^/lesson/edit/[^/]+$')
  const isPathMatch = pathRegEx.test(location.pathname)
  const isAdmin = data?.toUpperCase() === 'ADMIN'
  const alwaysShowHamburgerPaths = ['/permission', '/user', '/settings/profile', '/lesson', '/lesson/add', '/dashboard/enrollment_dashboard']
  const showHamburgerButton = (alwaysShowHamburgerPaths.includes(location.pathname) && isAdmin) || (isPathMatch && isAdmin)

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
              <p className="sm:text-sm md:text-base lg:text-xl xl:text-xl text-teal-600 font-bold">E-du</p>
            </a>
          </div>
          {/* Header: Center */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:space-x-2">
            {/* Home */}
            <a href="/" className={`block ${pathname === '/' ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/' && 'hover:text-slate-200'} rounded px-2`}>
              Home
            </a>
            {/* About */}
            <a href="/about" className={`block ${pathname.includes('about') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('about') && 'hover:text-slate-200'} rounded px-2`}>
              About
            </a>
            {/* Contact us */}
            <a href="/contact" className={`block ${pathname.includes('contact') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('contact') && 'hover:text-slate-200'} rounded px-2`}>
              Contact us
            </a>
            {/* Cart */}
            <a href="/cart" className={`flex items-center block ${pathname.includes('cart') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('cart') && 'hover:text-slate-200'} rounded px-2`}>
              Cart
              <ShoppingCartOutlinedIcon sx={{ color: 'teal' }} />
            </a>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <div className='lg:hidden'>
              <a href="/cart">
                <ShoppingCartOutlinedIcon className="w-4 h-4" sx={{ color: 'teal' }} />
              </a>
            </div>
            {/*  Divider */}
            <hr className="w-px h-6 bg-slate-200 mx-3" />
            <UserMenu align="right" />

          </div>

        </div>
      </div>
    </header>
  )
}

export default Navbar