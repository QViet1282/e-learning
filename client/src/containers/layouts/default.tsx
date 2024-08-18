/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* LAYOUT DEFAULT COMPONENT
   ========================================================================== */

import Footer from './footer/footer'
import Header from '../layouts/navbar/navbar'
import Sidebar from '../../components/Sidebar'
import { Outlet, useLocation } from 'react-router-dom'
import Styled from './default.style'
import { getFromLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'
import React, { useEffect, useRef, useState, createContext, RefObject } from 'react'
export const ShowButtonTopContext = createContext({
  showButtonTop: false,
  setShowButtonTop: (value: boolean) => {}
})
export const DivRefContext = createContext<RefObject<HTMLDivElement> | null>(null)
const Default = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showButtonTop, setShowButtonTop] = useState(false)
  const divRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('overflow-y-hidden')
    return () => {
      document.body.classList.remove('overflow-y-hidden')
    }
  }, [])

  useEffect(() => {
    const divElement = divRef.current
    if (divElement) {
      const divElement = divRef.current as unknown as HTMLDivElement

      const scrollFunction = () => {
        if (divElement.scrollTop > 200) {
          setShowButtonTop(true)
        } else {
          setShowButtonTop(false)
        }
      }

      divElement.addEventListener('scroll', scrollFunction)

      return () => {
        divElement.removeEventListener('scroll', scrollFunction)
      }
    }
  }, [])
  const location = useLocation()

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
  const alwaysShowSidebarPaths = ['/permission', '/user', '/settings/profile', '/lesson', '/lesson/add', '/dashboard/enrollment_dashboard']
  const showSidebar = (alwaysShowSidebarPaths.includes(location.pathname) && isAdmin) || (isPathMatch && isAdmin)
  const showFooter = !location.pathname.startsWith('/learning')

  useEffect(() => {
    const divElement = divRef.current
    if (divElement) {
      const divElement = divRef.current as unknown as HTMLDivElement
      divElement.scrollTop = 0
    }
  }, [location.pathname])

  return (
          <DivRefContext.Provider value={divRef}>
          <ShowButtonTopContext.Provider value={{ showButtonTop, setShowButtonTop }}>
            <div className="flex h-screen overflow-hidden">
              {showSidebar && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
              <div className={`relative flex flex-col flex-1 overflow-x-hidden ${showFooter ? 'overflow-y-auto' : 'overflow-y-hidden'}`} ref={divRef}>
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Styled.Main>
                  <Outlet />
                </Styled.Main>
                <Footer />
              </div>
            </div>
          </ShowButtonTopContext.Provider>
          </DivRefContext.Provider>
  )
}

export default Default
