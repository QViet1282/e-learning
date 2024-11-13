/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useState } from 'react'
import { AddCircle, Close, FolderDelete, Search } from '@mui/icons-material'
import { getAllNotification } from 'api/get/get.api'
import Pagination from '../course/components/Pagination'
import NotificationItem from './components/notificationItem'
import { createAndReplicateNotification } from 'api/post/post.api'
import { deleteNotification } from 'api/put/put.api'
import DeletedNotificationManager from './components/deletedNotificationManager'
import { IconButton } from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Notification {
  id?: number
  title: string
  message: string
  url: string
  notifyAt: Date | null
}

const NotificationManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tempSearchQuery, setTempSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false) // Modal tạo thông báo
  const [showArchiveModal, setShowArchiveModal] = useState(false) // Modal lưu trữ
  const [newNotification, setNewNotification] = useState<Notification>({
    title: '',
    message: '',
    url: '',
    notifyAt: null
  })

  // Gọi API lấy thông báo với phân trang
  const fetchNotifications = async (page = 1, search = '') => {
    try {
      const response = await getAllNotification({ page, limit: 9, search })
      setNotifications(response.data.data)
      setTotalPages(response.data.meta.totalPages)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleDelete = async (notificationId: number | undefined) => {
    try {
      await deleteNotification(notificationId)
      void fetchNotifications(page, searchQuery)
    } catch (error) {
      console.error('Error deleting notification:', error)
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
    try {
      const response = await createAndReplicateNotification(newNotification)
      response.status === 201 ? alert('Thành công') : alert('Thất bại')
      void fetchNotifications(page)
      setNewNotification({ title: '', message: '', url: '', notifyAt: null })
      handleCloseCreateModal()
    } catch (error) {
      console.error('Failed to create notification:', error)
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
    <div className="ml-0 md:ml-14 py-8 md:px-8 px-2 bg-slate-100 min-h-96 flex flex-wrap justify-center items-center">
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 mb-4">
        Notification Management
      </h2>
      <div className="flex justify-between items-center mb-4 w-full flex-wrap-reverse lg:flex-nowrap">
        <div className="flex items-center w-full max-w-md shadow-lg rounded-lg p-2">
          <input
            type="text"
            className="border rounded-lg p-2 flex-grow mr-2"
            placeholder="Tìm kiếm thông báo..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="p-2">
            <Search className="text-gray-500" />
          </button>
        </div>
        <div className="flex gap-2 shadow-lg rounded-lg p-2">
          <button
            onClick={handleShowArchiveModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FolderDelete className="mr-2" /> Lưu trữ
          </button>
          <button
            onClick={handleShowCreateModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <AddCircle className="mr-2" /> Tạo Thông Báo
          </button>
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr w-full">
  {notifications.map((notification) => (
    <NotificationItem
      key={notification.id}
      notification={notification}
      handleDelete={handleDelete}
    />
  ))}
</div>

      {/* Phân trang */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal tạo thông báo */}
      {showCreateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-1/3">
      <h2 className="text-2xl font-semibold mb-4">Tạo Thông Báo Mới</h2>
      <div className="mb-4">
        <label className="block mb-2">Tiêu đề</label>
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
        <label className="block mb-2">Nội dung</label>
        <textarea
          className="border rounded-lg p-2 w-full"
          value={newNotification.message}
          onChange={(e) =>
            setNewNotification({ ...newNotification, message: e.target.value })
          }
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Liên kết (URL)</label>
        <input
          type="text"
          className="border rounded-lg p-2 w-full"
          value={newNotification.url}
          onChange={(e) =>
            setNewNotification({ ...newNotification, url: e.target.value })
          }
        />
      </div>
      {/* Thêm trường hẹn giờ */}
      <div className="mb-4">
          <label className="block mb-2">Hẹn giờ thông báo</label>
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
            placeholderText="Chọn ngày và giờ"
            className="border rounded-lg p-2 w-full"
          />
        </div>
      <div className="flex justify-end">
        <button
          className="bg-gray-300 px-4 py-2 rounded-lg mr-2"
          onClick={handleCloseCreateModal}
        >
          Hủy
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={handleCreateNotification}
        >
          Tạo
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
