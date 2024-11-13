/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { Search, Add } from '@mui/icons-material'
import { getAllNotification } from 'api/get/get.api'
import Pagination from '../course/components/Pagination'
import NotificationItem from '../notification/components/notificationItem'
import { createNotification } from 'api/post/post.api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Notification {
  id?: number
  title: string
  message: string
  url: string
  notifyAt: Date | null
  courseId: number | null
}

const Notification = ({ courseId }: { courseId: number }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tempSearchQuery, setTempSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newNotification, setNewNotification] = useState<Notification>({
    title: '',
    message: '',
    url: `/courses/${courseId}`,
    notifyAt: null,
    courseId: null
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

  useEffect(() => {
    void fetchNotifications(page, searchQuery)
  }, [page, searchQuery])

  // Xử lý khi người dùng bấm tìm kiếm
  const handleSearch = () => {
    setSearchQuery(tempSearchQuery)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Xử lý tạo thông báo mới
  const handleCreateNotification = async () => {
    if ((newNotification.title.length === 0) || (newNotification.message.length === 0)) return
    try {
      await createNotification({
        title: newNotification.title,
        message: newNotification.message,
        url: newNotification.url,
        notifyAt: newNotification.notifyAt,
        courseId: newNotification.courseId
      })
      setIsCreateModalOpen(false)
      setNewNotification({
        title: '',
        message: '',
        url: `/courses/${courseId}`,
        notifyAt: null,
        courseId: null
      })
      void fetchNotifications()
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  // Đóng modal
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      {/* Tiêu đề trang */}
      <div className="w-full border-b-2">
        <div className="text-3xl font-bold p-2">Thông báo</div>
      </div>

      <div className="w-full shadow-2xl mt-6 bg-slate-100 px-8 py-4 rounded-lg">
        {/* Thanh tìm kiếm và nút tạo thông báo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center w-full max-w-md shadow-lg rounded-lg p-2 bg-white">
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
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 text-white p-2 rounded-lg flex items-center"
          >
            <Add className="mr-2" /> Tạo thông báo
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full justify-start">
          {notifications.length > 0
            ? (
                notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
                ))
              )
            : (
            <p className="text-center col-span-full">Không có thông báo nào.</p>
              )}
        </div>

        {/* Phân trang */}
        <div className="w-full">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>

        {/* Modal tạo thông báo */}
        {isCreateModalOpen && (
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
              {/* <div className="mb-4">
                <label className="block mb-2">Liên kết (URL)</label>
                <input
                  type="text"
                  className="border rounded-lg p-2 w-full"
                  value={newNotification.url}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, url: e.target.value })
                  }
                />
              </div> */}
              {/* Thêm trường hẹn giờ */}
              <div className="mb-4">
                <label className="block mb-2">Hẹn giờ thông báo</label>
                <DatePicker
                  selected={newNotification.notifyAt}
                  onChange={(date: Date | null) =>
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
      </div>
    </div>
  )
}

export default Notification
