// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// /* eslint-disable @typescript-eslint/strict-boolean-expressions */
// /* LAYOUT DEFAULT COMPONENT
//    ========================================================================== */

// import Footer from './footer/footer'
// import Header from '../layouts/navbar/navbar'
// import Sidebar from '../../components/Sidebar'
// import { Outlet, useLocation } from 'react-router-dom'
// import Styled from './default.style'
// import { getFromLocalStorage } from 'utils/functions'
// import CryptoJS from 'crypto-js'
// import React, { useEffect, useRef, useState, createContext, RefObject } from 'react'
// export const ShowButtonTopContext = createContext({
//   showButtonTop: false,
//   setShowButtonTop: (value: boolean) => {}
// })
// export const DivRefContext = createContext<RefObject<HTMLDivElement> | null>(null)
// const Default = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [showButtonTop, setShowButtonTop] = useState(false)
//   const divRef = useRef(null)

//   useEffect(() => {
//     document.body.classList.add('overflow-y-hidden')
//     return () => {
//       document.body.classList.remove('overflow-y-hidden')
//     }
//   }, [])

//   useEffect(() => {
//     const divElement = divRef.current
//     if (divElement) {
//       const divElement = divRef.current as unknown as HTMLDivElement

//       const scrollFunction = () => {
//         if (divElement.scrollTop > 200) {
//           setShowButtonTop(true)
//         } else {
//           setShowButtonTop(false)
//         }
//       }

//       divElement.addEventListener('scroll', scrollFunction)

//       return () => {
//         divElement.removeEventListener('scroll', scrollFunction)
//       }
//     }
//   }, [])
//   const location = useLocation()

//   const tokens = getFromLocalStorage<any>('tokens')

//   const userRole = tokens?.key
//   let data
//   if (userRole) {
//     try {
//       const giaiMa = CryptoJS.AES.decrypt(userRole, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
//       data = giaiMa.toString(CryptoJS.enc.Utf8)
//     } catch (error) {
//       console.error('Decryption error:', error)
//     }
//   }
//   // eslint-disable-next-line prefer-regex-literals
//   const pathRegEx = new RegExp('^/lesson/edit/[^/]+$')
//   const isPathMatch = pathRegEx.test(location.pathname)
//   const isAdmin = data?.toUpperCase() === 'ADMIN'
//   const isTeacher = data?.toUpperCase() === 'MANAGER'
//   const alwaysShowSidebarPaths = ['/permission', '/user', '/settings/profile', '/lesson', '/lesson/add', '/dashboard/enrollment_dashboard']
//   const showSidebar = (alwaysShowSidebarPaths.includes(location.pathname) && isAdmin) || (isPathMatch && isAdmin) || (isPathMatch && isTeacher) || (alwaysShowSidebarPaths.includes(location.pathname) && isTeacher)
//   const showFooter = !location.pathname.startsWith('/learning')

//   useEffect(() => {
//     const divElement = divRef.current
//     if (divElement) {
//       const divElement = divRef.current as unknown as HTMLDivElement
//       divElement.scrollTop = 0
//     }
//   }, [location.pathname])

//   return (
//           <DivRefContext.Provider value={divRef}>
//           <ShowButtonTopContext.Provider value={{ showButtonTop, setShowButtonTop }}>
//             <div className="flex h-screen overflow-hidden">
//             {(showSidebar || sidebarOpen) && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
//               <div className={`relative flex flex-col flex-1 overflow-x-hidden ${showFooter ? 'overflow-y-auto' : 'overflow-y-hidden'}`} ref={divRef}>
//                 <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//                 <Styled.Main>
//                   <Outlet />
//                 </Styled.Main>
//                 <Footer />
//               </div>
//             </div>
//           </ShowButtonTopContext.Provider>
//           </DivRefContext.Provider>
//   )
// }

// export default Default

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
const HamburgerButton: React.FC<{ sidebarOpen: boolean, setSidebarOpen: (open: boolean) => void }> = ({ sidebarOpen, setSidebarOpen }) => (
  <button
    className="text-slate-500 hover:text-slate-600 lg:hidden"
    onClick={() => setSidebarOpen(!sidebarOpen)}
    aria-controls="sidebar"
    aria-expanded={sidebarOpen}
  >
    <span className="sr-only">Open sidebar</span>
    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="2" />
      <rect x="4" y="11" width="16" height="2" />
      <rect x="4" y="17" width="16" height="2" />
    </svg>
  </button>
)
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
  const isTeacher = data?.toUpperCase() === 'MANAGER'
  const alwaysShowSidebarPaths = ['/permission', '/user', '/settings/profile', '/lesson', '/lesson/add', '/dashboard/enrollment_dashboard']
  const showSidebar = (alwaysShowSidebarPaths.includes(location.pathname) && isAdmin) || (isPathMatch && isAdmin) || (isPathMatch && isTeacher) || (alwaysShowSidebarPaths.includes(location.pathname) && isTeacher)
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
          {(showSidebar || sidebarOpen) && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
          <div className={`relative flex flex-col flex-1 overflow-x-hidden ${showFooter ? 'overflow-y-auto' : 'overflow-y-hidden'}`} ref={divRef}>
            {/* Hiển thị nút Hamburger khi Header bị ẩn */}
            {showSidebar && (
              <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                <HamburgerButton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              </div>
            )}
            {/* Hiển thị Header khi cần */}
            {!showSidebar && <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
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
