/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: COURSEPAGE
   ========================================================================== */
// AdminPage.tsx
import React, { useState } from 'react'
import { BiHomeAlt, BiInfoCircle, BiMoviePlay } from 'react-icons/bi'
import NavItem from './NavItem'
import CourseManagementPage from './course/CourseManagement'
import NotificationManager from './notification'
import UserManagementPage from './user'
import StatisticsPage from './statistics'

const defaultIconSize = '1.875rem'

const items = [
  { label: 'Course Management', icon: <BiHomeAlt size={defaultIconSize} />, path: '/course' },
  { label: 'Notification Management', icon: <BiMoviePlay size={defaultIconSize} />, path: '/exam' },
  { label: 'Statistical Management', icon: <BiInfoCircle size={defaultIconSize} />, path: '/statistical' },
  { label: 'User Management', icon: <BiInfoCircle size={defaultIconSize} />, path: '/user' }
]

const ManagementPage = () => {
  const [selectedPath, setSelectedPath] = useState<string>('/course')

  const handleNavItemClick = (path?: string) => {
    if (path) {
      setSelectedPath(path)
    }
  }

  const renderContent = () => {
    switch (selectedPath) {
      case '/':
        return <><CourseManagementPage/></>
      case '/course':
        return <><CourseManagementPage/></>
      case '/exam':
        return <><NotificationManager/></>
      case '/statistical':
        return <><StatisticsPage /></>
      case '/user':
        return <><UserManagementPage/></>
      default:
        return <div>Content</div>
    }
  }

  return (
        <div className='relative grid grid-cols-1 md:grid-cols-12'>
            <nav className='absolute hidden w-14 md:block group h-full bg-gray-900 font-bold flex-col justify-between items-center transition-all duration-300 hover:w-72 z-10 col-span-1 md:col-span-2'>
                <ul className={'hover:w-72 fixed  transition-all duration-300 md:block'}>
                    {items.map((item, index) => (
                        <NavItem
                            key={index}
                            item={{ ...item, active: item.path === selectedPath }}
                            onClick={handleNavItemClick}
                        />
                    ))}
                </ul>
            </nav>
            <main className='col-span-1 md:col-span-12 md:ml-0'>
                    {renderContent()}
            </main>
        </div>
  )
}

export default ManagementPage
