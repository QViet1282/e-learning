/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Search, AddCircle, AddCircleOutline } from '@mui/icons-material'
import { getAllNotification } from 'api/get/get.api'
import Pagination from '../component/Pagination'
import NotificationItem from '../notification/components/notificationItem'
import { createAndReplicateNotification } from 'api/post/post.api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { PacmanLoader } from 'react-spinners'
import { deleteNotification } from 'api/put/put.api'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

interface Notification {
  id: number
  title: string
  message: string
  url: string
  notifyAt: Date
  courseId: number | null
}

interface NewNotification {
  title: string
  message: string
  url: string
  notifyAt: Date | null
  courseId: number | null
}

const Notification = ({ courseId }: { courseId: number }) => {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tempSearchQuery, setTempSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNotification, setNewNotification] = useState<NewNotification>({
    title: '',
    message: '',
    url: `/courses/${courseId}`,
    notifyAt: null,
    courseId
  })
  const [loading, setLoading] = useState(false)
  const searchTitle = t('notificationManagement.searchTitle')

  // Gọi API lấy thông báo theo khóa học
  const fetchNotifications = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const response = await getAllNotification({ page, limit: 9, search, courseId })
      setNotifications(response.data.data)
      setTotalPages(response.data.meta.totalPages)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchNotifications(page, searchQuery)
  }, [page, searchQuery, courseId])

  // Tạo mới thông báo
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

      setShowCreateModal(false)
      setNewNotification({ title: '', message: '', url: `/courses/${courseId}`, notifyAt: null, courseId })
      void fetchNotifications(page, searchQuery)
    } catch (error) {
      console.error('Failed to create notification:', error)
      toast.error(t('notificationManagement.errors.SERVER_ERROR'), {
        position: toast.POSITION.TOP_CENTER
      })
    }
  }

  const handleSearch = () => {
    setSearchQuery(tempSearchQuery)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
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

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="w-full border-b-2">
        <div className="text-3xl font-bold p-2">{t('notificationManagement.title')}</div>
      </div>
      <div className="w-full shadow-2xl mt-6 bg-gradient-to-r from-gray-50 to-gray-100 md:px-8 px-4 py-4 rounded-lg">
        <div className="flex lg:justify-between justify-center items-center mb-4 w-full lg:flex-nowrap flex-wrap min-h-16">
          <h2 className="text-4xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-teal-400 to-blue-500">
            {/* Quản lý Thông Báo */}
          </h2>
          <div className="flex w-full lg:w-8/12">
            <div className="flex items-center w-full gap-2 justify-end flex-wrap lg:flex-nowrap">
              <div className="flex w-full lg:w-1/2 gap-2 justify-end items-center">
                <div className="p-2 border-2 rounded-md shadow-sm bg-white flex items-center">
                  <p>{notifications.length} {t('notificationManagement.item')}</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-teal-300 hover:bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-1"
                >
                  <AddCircleOutline className="" /><p>{t('notificationManagement.create')}</p>
                </button>
              </div>

              <div className="flex w-full lg:w-1/2 gap-2">
                <input
                  type="text"
                  className="border-2 rounded-md p-2 w-full focus:outline-none"
                  placeholder={searchTitle}
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch} className="p-2 border-2 bg-white rounded-md">
                  <Search />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading
          ? (
            <div className="flex justify-center items-center w-full min-h-80 mt-15">
              <PacmanLoader
                className='flex justify-center items-center w-full mt-20 min-h-96'
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
          : (
            <div className="">
              {notifications.length === 0
                ? (
                  <div className="w-full text-center text-gray-500 mt-4 flex justify-center items-center min-h-96">Không tìm thấy thông báo nào.</div>
                  )
                : (
                  <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 w-full">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        handleDelete={handleDelete}
                      />
                    ))}
                  </div>
                  )}
            </div>
            )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Modal tạo thông báo */}
        {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
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
            {/* <div className="mb-4">
              <label className="block mb-2">{t('notificationManagement.createModal.fields.url')}</label>
              <input
                type="text"
                className="border rounded-lg p-2 w-full"
                value={newNotification.url}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, url: e.target.value })
                }
              />
            </div> */}
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
                onClick={() => setShowCreateModal(false)}
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
      </div>
    </div>
  )
}

export default Notification
