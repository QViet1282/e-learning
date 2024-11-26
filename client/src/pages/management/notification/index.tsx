/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { AddCircle, AddCircleOutline, Close, FolderDelete, Search } from '@mui/icons-material'
import { getAllNotification } from 'api/get/get.api'
import Pagination from '../component/Pagination'
import NotificationItem from './components/notificationItem'
import { createAndReplicateNotification } from 'api/post/post.api'
import { deleteNotification } from 'api/put/put.api'
import DeletedNotificationManager from './components/deletedNotificationManager'
import { IconButton } from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { PacmanLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

interface Notification {
  id: number
  title: string
  message: string
  url: string
  notifyAt: Date
}

interface NewNotification {
  title: string
  message: string
  url: string
  notifyAt: Date | null
}

const NotificationManager = () => {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tempSearchQuery, setTempSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [newNotification, setNewNotification] = useState<NewNotification>({
    title: '',
    message: '',
    url: '',
    notifyAt: null
  })
  const [loading, setLoading] = useState(false)
  const searchTitle = t('notificationManagement.searchTitle')

  const fetchNotifications = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const response = await getAllNotification({ page, limit: 16, search })
      setNotifications(response.data.data)
      setTotalPages(response.data.meta.totalPages)
      setTotalItems(response.data.meta.totalItems)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (notificationId: number | undefined): Promise<void> => {
    if (!notificationId) {
      toast.error(t('notificationManagement.error.NO_NOTIFICATION_ERROR'))
      return
    }

    try {
      await deleteNotification(notificationId)
      void fetchNotifications(page, searchQuery)

      toast.success(t('notificationManagement.toast.delete_success'))
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error(t('notificationManagement.error.DELETE_ERROR'))
    }
  }

  useEffect(() => {
    void fetchNotifications(page, searchQuery)
  }, [page, searchQuery])

  const handleShowCreateModal = () => setShowCreateModal(true)
  const handleCloseCreateModal = () => setShowCreateModal(false)

  const handleShowArchiveModal = () => setShowArchiveModal(true)
  const handleCloseArchiveModal = () => setShowArchiveModal(false)

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error(t('notificationManagement.errors.TITLE_AND_CONTENT_REQUIRED'))
      return
    }

    try {
      const response = await createAndReplicateNotification(newNotification)

      if (response.status === 201) {
        toast.success(t('notificationManagement.toast.create_success'))
      } else {
        toast.error(t('notificationManagement.errors.CREATE_ERROR'))
      }

      void fetchNotifications(page)
      setNewNotification({ title: '', message: '', url: '', notifyAt: null })
      handleCloseCreateModal()
    } catch (error) {
      console.error('Failed to create notification:', error)
      toast.error(t('notificationManagement.errors.SERVER_ERROR'), {
        position: toast.POSITION.TOP_CENTER
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Xử lý khi người dùng bấm tìm kiếm
  const handleSearch = () => {
    setSearchQuery(tempSearchQuery)
    setPage(1)
  }

  return (
    <div className="ml-0 md:py-8 md:px-8 px-2 py-2 bg-sky-100 flex flex-wrap justify-center items-center border-x-2">
      <div className="flex lg:justify-between justify-center items-center mb-4 w-full lg:flex-nowrap flex-wrap">
        <h2 className="text-4xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-teal-400 to-blue-500">
          {t('notificationManagement.title')}
        </h2>
        <div className='flex w-full lg:w-8/12'>
          <div className="flex items-center w-full gap-2 justify-end flex-wrap lg:flex-nowrap">
            <div className='flex w-full lg:w-1/2 gap-2 justify-end items-center'>
              <div className='p-2 border-2 rounded-md shadow-sm bg-white flex items-center'>
                <p>{totalItems} {t('notificationManagement.item')}</p>
              </div>
              <button
                onClick={handleShowCreateModal}
                className="bg-teal-300 hover:bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 active:scale-95"
              >
                <AddCircleOutline className="" /><p>{t('notificationManagement.create')}</p>
              </button>
            </div>

            <div className='flex w-full lg:w-1/2 gap-2'>
              <input
                type="text"
                className="border-2 rounded-md p-2 w-full focus:outline-none"
                placeholder={searchTitle}
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
              />
              <button onClick={handleSearch} className="p-2 border-2 bg-white rounded-md active:scale-95 hover:bg-slate-50">
                <Search className="text-gray-500 " />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nếu đang loading, hiển thị spinner */}
      {loading
        ? (
          <div className="flex justify-center items-center w-full min-h-80 mt-15">
            <PacmanLoader
              className='flex justify-center items-center w-full mt-20'
              color='#5EEAD4'
              cssOverride={{
                display: 'block',
                margin: '0 auto',
                borderColor: 'blue'
              }}
              loading
              margin={10}
              speedMultiplier={3}
              size={40}
            />
          </div>
          )
        : notifications.length === 0
          ? (
            <div className="w-full text-center text-gray-500 mt-4 flex justify-center items-center min-h-80">{t('notificationManagement.empty')}</div>
            )
          : (
            <div className="grid grid-cols-1 grid-rows-12 md:grid-cols-4 md:grid-rows-4 min-h-80 gap-4 auto-rows-fr w-full">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
            )}

      {/* Phân trang */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal tạo thông báo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-4">
              {t('notificationManagement.createModal.title')}
            </h2>
            <div className="mb-4">
              <label className="block mb-2">{t('notificationManagement.createModal.fields.title')}</label>
              <input
                type="text"
                className="border rounded-lg p-2 w-full"
                value={newNotification.title}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, title: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('notificationManagement.createModal.fields.message')}</label>
              <textarea
                className="border rounded-lg p-2 w-full"
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, message: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('notificationManagement.createModal.fields.url')}</label>
              <input
                type="text"
                className="border rounded-lg p-2 w-full"
                value={newNotification.url}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, url: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('notificationManagement.createModal.fields.notifyAt')}</label>
              <DatePicker
                selected={newNotification.notifyAt}
                onChange={(date) =>
                  setNewNotification({ ...newNotification, notifyAt: date })
                }
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                minDate={new Date()}
                className="border rounded-lg p-2 w-full focus:outline-none"
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg mr-2"
                onClick={handleCloseCreateModal}
              >
                {t('notificationManagement.createModal.cancelButton')}
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={handleCreateNotification}
              >
                {t('notificationManagement.createModal.createButton')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal lưu trữ */}
      {showArchiveModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white shadow-lg rounded-lg w-7/12 border-2 border-gray-500">
            <DeletedNotificationManager onClose={handleCloseArchiveModal} />
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationManager
