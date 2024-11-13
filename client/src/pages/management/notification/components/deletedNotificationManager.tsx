/* eslint-disable @typescript-eslint/explicit-function-return-type */
// DeletedNotificationManager.tsx
import React, { useEffect, useState } from 'react'
import { Close, Search } from '@mui/icons-material'
import Pagination from 'pages/management/course/components/Pagination'
import { getAllDeletedNotification } from 'api/get/get.api'
import DeletedNotificationItem from './deletedNotificationItem'

interface Notification {
  id: number
  title: string
  message: string
  url: string
}

interface DeletedNotificationManagerProps {
  onClose: () => void // Hàm để đóng modal
}

const DeletedNotificationManager: React.FC<DeletedNotificationManagerProps> = ({ onClose }) => {
  const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tempSearchQuery, setTempSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchArchivedNotifications = async (page = 1, search = '') => {
    try {
      const response = await getAllDeletedNotification({ page, limit: 8, search })
      setArchivedNotifications(response.data.data)
      setTotalPages(response.data.meta.totalPages)
    } catch (error) {
      console.error('Failed to fetch archived notifications:', error)
    }
  }

  useEffect(() => {
    void fetchArchivedNotifications(page, searchQuery)
  }, [page, searchQuery])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setSearchQuery(tempSearchQuery)
    setPage(1) // Đặt lại trang về 1 sau khi tìm kiếm
  }

  return (
    <div className="py-4 bg-slate-100 px-2 md:px-4 min-h-96 rounded-lg overflow-auto" style={{ maxHeight: '500px' }}>
      {/* Thanh tìm kiếm */}
      <div className="flex flex-wrap-reverse md:flex-nowrap justify-between items-center gap-2 mb-4 p-2 shadow-lg rounded-lg">
        <div className="flex items-center w-full max-w-md">
          <input
            type="text"
            className="border rounded-lg p-2 flex-grow mr-2"
            placeholder="Tìm kiếm thông báo đã lưu trữ..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="p-2 bg-white rounded-lg">
            <Search className="text-gray-500" />
          </button>
        </div>
        <div className='flex justify-end items-center w-full'>
            <h2 className="w-5/6 text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">
        Archived Notifications
        </h2>
              {/* Nút đóng modal */}
        <button className="bg-white p-2 px-3 rounded-lg" onClick={onClose}>
          <Close/>
        </button>
        </div>
      </div>

      {/* Danh sách thông báo đã lưu trữ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {archivedNotifications.map((notification) => (
          <DeletedNotificationItem key={notification.id} notification={notification}/>
        ))}
      </div>

      {/* Phân trang */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  )
}

export default DeletedNotificationManager
