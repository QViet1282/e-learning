/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Transition from '../utils/Transition'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { setNotification, deleteNotification, selectNotifications, selectTotalNotifications, updateStatus, updateAllStatus, removeAllNotificationsSlice, setTotal } from '../redux/notification/notifySlice'
import { getNotifications, readNotification, readAllNotification, markUnread, markAllUnread, removeNotification, removeAllNotification } from 'api/post/post.api'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { PulseLoader } from 'react-spinners'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import LensIcon from '@mui/icons-material/Lens'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { toast } from 'react-toastify'
import AppImage17 from '../assets/images/homePage/noise.png'
import { useTheme } from 'services/styled-themes'

interface DropdownNotificationProps {
  align: string
}

function DropdownNotification ({ align }: DropdownNotificationProps) {
  const { theme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdown = useRef<HTMLDivElement | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false)
  const { t } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })
  useEffect(() => {
    setSelectedLanguage(localStorage.getItem('selectedLanguage') ?? 'en')
  }, [localStorage.getItem('selectedLanguage')])

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id)
    setIsMainMenuOpen(false)
  }
  const toggleMainMenu = () => {
    setIsMainMenuOpen(!isMainMenuOpen)
    setOpenMenuId(null)
  }
  const dispatch = useDispatch()
  const notifications = useSelector((state: any) => selectNotifications(state))
  const total = useSelector((state: any) => selectTotalNotifications(state))

  const handleDeleteNotification = (id: string) => {
    dispatch(deleteNotification(id))
  }
  const handleUpdateUnreadStatus = (id: string) => {
    dispatch(updateStatus({ id, status: false }))
  }
  const handleUpdateMarkAsReadStatus = (id: string) => {
    dispatch(updateStatus({ id, status: true }))
  }
  const loadNotifications = async (isScroll: boolean = false) => {
    if (isScroll) {
      setIsLoading(true)
    }
    try {
      const res = await getNotifications(5, offset)
      if (res.data.notifications.length < 5) {
        setHasMore(false)
      }
      dispatch(setTotal(res.data.total))

      const notifications = res.data.notifications.map((notification: { id: any, notificationId: any, status: any, userId: any, createdAt: any, updatedAt: any, Notification: { id: any, title: any, message: any, url: any, notifyAt: any, createdAt: any, updatedAt: any } }) => ({
        id: notification.id,
        notificationId: notification.notificationId,
        status: notification.status,
        userId: notification.userId,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        notificationDetails: {
          id: notification.Notification.id,
          title: notification.Notification.title,
          message: notification.Notification.message,
          url: notification.Notification.url,
          notifyAt: notification.Notification.notifyAt,
          createdAt: notification.Notification.createdAt,
          updatedAt: notification.Notification.updatedAt
        }
      }))

      notifications.forEach((data: any) => {
        dispatch(setNotification(data))
      })

      setOffset((prevOffset) => prevOffset + 5)
    } catch (err) {
      console.error(err)
    } finally {
      if (isScroll) {
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }
    }
  }

  useEffect(() => {
    loadNotifications(true)
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight
    if (bottom && hasMore) {
      loadNotifications(true)
    }
  }

  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }) => {
      if (!dropdown.current) return
      if (!dropdownOpen || dropdown.current?.contains(target as Node) || trigger.current?.contains(target as Node)) return
      setDropdownOpen(false)
      setIsMainMenuOpen(false)
      setOpenMenuId(null)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }) => {
      if (!dropdownOpen || keyCode !== 27) return
      setDropdownOpen(false)
      setIsMainMenuOpen(false)
      setOpenMenuId(null)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await readNotification({ recipientsId: id })
      if (response) {
        handleUpdateMarkAsReadStatus(id)
        await loadNotifications()
        setOpenMenuId(null)
      } else {
        console.error('Failed to mark as read')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      const response = await markUnread({ recipientsId: id })
      if (response) {
        handleUpdateUnreadStatus(id)
        await loadNotifications()
        setOpenMenuId(null)
      } else {
        console.error('Failed to mark as unread')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveNotification = async (id: string) => {
    try {
      console.log('id', id)
      const response = await removeNotification({ recipientsId: id })
      if (response) {
        console.log('response', response)
        handleDeleteNotification(id)
        await loadNotifications()
        setOpenMenuId(null)
      } else {
        console.error('Failed to remove notification')
      }
    } catch (err) {
      console.error(err)
    }
  }
  const handleRemoveAllNotifications = async () => {
    try {
      await removeAllNotification()
      dispatch(removeAllNotificationsSlice())
      loadNotifications()
      setIsMainMenuOpen(false)
      setDropdownOpen(false)
      toast.success(t('notification.toast_removed_all_notifications'))
    } catch (err) {
      console.error(err)
    }
  }
  const handleMarkAllAsRead = async () => {
    try {
      await readAllNotification()
      dispatch(updateAllStatus(true))
      setIsMainMenuOpen(false)
      loadNotifications()
      toast.success(t('notification.toast_mark_all_as_read'))
    } catch (err) {
      console.error(err)
    }
  }
  const handleMarkAllAsUnread = async () => {
    try {
      await markAllUnread()
      dispatch(updateAllStatus(false))
      loadNotifications()
      setIsMainMenuOpen(false)
      toast.success(t('notification.toast_mark_all_as_unread'))
    } catch (err) {
      console.error(err)
    }
  }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const handleOpenModal = (notification: any) => {
    setDropdownOpen(false)
    setSelectedNotification(notification)
    setIsModalOpen(true)
  }

  return (
       <div className="relative inline-flex">
         <button
           ref={trigger}
           // className={`mx-2 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition duration-150 rounded-full ${dropdownOpen && 'bg-slate-200'}`}
           className={`mx-2 w-8 h-8 flex items-center justify-center ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : ''} transition duration-150 rounded-full ${dropdownOpen && theme === 'light' ? 'bg-slate-200' : ''}`}
           aria-haspopup="true"
           onClick={() => setDropdownOpen(!dropdownOpen)}
           aria-expanded={dropdownOpen}
         >
           <span className="sr-only">{t('homepage.notifications')}</span>
           {total > 0 && (
             <div className="absolute -top-1.5 left-7 w-auto px-1.5 bg-rose-500 font-bold border-2 border-white rounded-lg flex justify-center items-center text-xs text-white">
               {total}<br />
             </div>
           )}
           <NotificationsNoneOutlinedIcon sx={{ color: 'teal' }} />
         </button>

         <Transition
           className={`origin-top-right z-10 absolute top-full -mr-14 sm:mr-0 w-96 bg-white border border-slate-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
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
             <div className="text-xs font-semibold text-slate-400 uppercase pt-1.5 pb-2 px-4 flex items-center justify-between">
               <div>{t('notification.notifications')}</div>
               <div className="relative">
                 <MoreHorizIcon
                   className="cursor-pointer rounded-full hover:bg-slate-200 mx-4"
                   onClick={toggleMainMenu}
                 />
                 {isMainMenuOpen && (
                   <div className="absolute right-0 mt-2 sm:w-72 w-40 bg-teal-200 shadow-2xl rounded-2xl border z-30">
                     <div className="absolute -top-2 right-5 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-teal-200"></div>
                     <ul className='m-2 text-xs text-slate-800 normal-case'>
                       <li className="px-4 py-2 hover:bg-slate-100 cursor-pointer font-bold rounded-2xl" onClick={async () => {
                         await handleMarkAllAsRead()
                       }}>
                         <CheckIcon className='mr-2' />{t('notification.mark_all_as_read')}
                       </li>
                       <li className="px-4 py-2 hover:bg-slate-100 cursor-pointer font-bold rounded-2xl" onClick={async () => {
                         await handleMarkAllAsUnread()
                       }}>
                         <NotificationsIcon className='mr-2' />{t('notification.mark_all_as_unread')}
                       </li>
                       <li className="px-4 py-2 hover:bg-slate-100 cursor-pointer font-bold rounded-2xl" onClick={async () => {
                         await handleRemoveAllNotifications()
                       }}>
                         <CloseIcon className='mr-2' />{t('notification.removed_all_notifications')}
                       </li>
                     </ul>
                   </div>
                 )}
               </div>
             </div>
             <ul className="h-128 overflow-y-auto" onScroll={handleScroll}>
               {
               notifications.length === 0
                 ? (
                <li className="text-center py-4 my-auto">{t('notification.no_notifications')}</li>
                   )
                 : (
                     notifications.map((notification) => (
                 <li key={notification.id} className={`duration-300 border-b border-slate-200  ${isLoading ? '' : 'last:border-0'} flex items-center ${notification.status ? 'bg-white hover:bg-slate-100' : 'bg-slate-100'}`}>
                   <div
                     className='block py-2 px-4 transition w-5/6 space-y-2'
                     onClick={async () => {
                       handleOpenModal(notification)
                       if (!notification.status) {
                         await handleMarkAsRead(notification.id)
                       }
                       console.log('notification', notification.notificationDetails.url)
                     }}
                   >
                     <div className='flex justify-between'>
                       <div className='flex space-x-2 items-center'>
                         <img className='w-10 h-10' src={AppImage17}></img>
                         <span className="block font-bold text-black mb-2">{notification.notificationDetails.title}</span>
                       </div>
                     </div>
                     <span className="block text-sm mb-2 truncate">🪴 {notification.notificationDetails.message}</span>
                     {selectedLanguage === 'en'
                       ? <span className="block text-xs font-medium text-slate-400">
                         {new Date(notification.createdAt).toLocaleDateString('en-US', {
                           year: 'numeric',
                           month: 'short',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </span>
                       : <span className="block text-xs font-medium text-slate-400">
                         {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                           year: 'numeric',
                           month: 'short',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </span>
                     }

                   </div>
                   {notification.status ? <div></div> : <LensIcon className='text-blue-300' fontSize='small' />}
                   {notification.status ? <div></div> : <div className='rounded-full bg-teal-300'></div>}
                   <div className="relative">
                     <MoreHorizIcon
                       className="cursor-pointer rounded-full hover:bg-slate-200 mx-4"
                       onClick={() => toggleMenu(parseInt(notification.id))}
                     />
                     {openMenuId === parseInt(notification.id) && (
                       <div className="absolute right-0 mt-2 w-72 bg-teal-200 shadow-2xl rounded-2xl border z-30">
                         <div className="absolute -top-2 right-5 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-teal-200"></div>
                         <ul className='m-2 text-xs text-slate-800'>
                           <li
                             className={`px-4 py-2 cursor-pointer font-bold rounded-2xl ${notification.status ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-100'}`}
                             onClick={async () => {
                               if (!notification.status) {
                                 console.log('notification.id', notification.id)
                                 await handleMarkAsRead(notification.id)
                               }
                             }}
                           >
                             <CheckIcon className='mr-2' />{t('notification.mark_as_read')}
                           </li>
                           <li
                             className={`px-4 py-2  cursor-pointer font-bold rounded-2xl ${notification.status ? 'hover:bg-slate-100' : 'cursor-not-allowed opacity-50'}`}
                             onClick={async () => {
                               if (notification.status) {
                                 await handleMarkAsUnread(notification.id)
                               }
                             }}
                           >
                             <NotificationsIcon className='mr-2' />{t('notification.mark_as_unread')}
                           </li>
                           <li
                             className='px-4 py-2 hover:bg-slate-100 cursor-pointer font-bold rounded-2xl'
                             onClick={async () => {
                               await handleRemoveNotification(notification.id)
                             }}
                           >
                             <CloseIcon className='mr-2' />{t('notification.removed_notification')}
                           </li>
                         </ul>
                       </div>
                     )}
                   </div>
                 </li>
                     ))
                   )}
             </ul>
             {isLoading && (
               <PulseLoader
                 className="flex justify-center items-center w-full mt-20 text-center"
                 color="#000000"
                 cssOverride={{
                   display: 'block',
                   margin: '0 auto',
                   borderColor: 'blue'
                 }}
                 loading
                 speedMultiplier={1}
                 size={10}
               />
             )}
           </div>
         </Transition>
        {isModalOpen && selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>

              {/* Email Header */}
              <div className="mb-4 border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-800">{t('notification.modal.notification_details')}</h2>
                <p className="text-sm text-gray-500">
                  {selectedNotification.notificationDetails.title}
                </p>
              </div>

              {/* Email Body */}
              <div className="mb-6">
                <p className="text-md text-gray-700 leading-relaxed">
                  {selectedNotification.notificationDetails.message}
                </p>
              </div>

              {/* Email Footer */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(selectedNotification.notificationDetails.notifyAt).toLocaleString(
                    selectedLanguage === 'en' ? 'en-US' : 'vi-VN',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }
                  )}
                </span>
                <div className="flex space-x-2">
                  {selectedNotification.notificationDetails.url && (
                    <a
                      href={selectedNotification.notificationDetails.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow"
                    >
                    {t('notification.modal.view')}
                    </a>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                   {t('notification.modal.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
       </div>
  )
}

export default DropdownNotification
