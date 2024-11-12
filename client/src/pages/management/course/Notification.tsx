/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { Search, Add } from '@mui/icons-material'
import { getAllNotification } from 'api/get/get.api'
import Pagination from '../course/components/Pagination'
import NotificationItem from '../notification/components/notificationItem'
import { createNotification } from 'api/post/post.api'

interface Notification {
  id: number
  title: string
  message: string
  url: string
}

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tempSearchQuery, setTempSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMessage, setNewMessage] = useState('')

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
    if ((newTitle.length === 0) || (newMessage.length === 0)) return
    try {
      await createNotification({ title: newTitle, message: newMessage })
      setIsCreateModalOpen(false)
      setNewTitle('')
      setNewMessage('')
      void fetchNotifications()
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />

                {/* Modal tạo thông báo */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Tạo thông báo mới</h2>
                            <input
                                type="text"
                                placeholder="Tiêu đề"
                                className="border p-2 w-full mb-4"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                            <textarea
                                placeholder="Nội dung"
                                className="border p-2 w-full mb-4"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <div className="flex justify-end gap-4">
                                <button
                                    className="bg-gray-500 text-white p-2 rounded"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="bg-blue-500 text-white p-2 rounded"
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
