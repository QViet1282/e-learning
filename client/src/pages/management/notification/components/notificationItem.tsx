/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { FC, useMemo, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import { DeleteOutline, ArrowForward } from '@mui/icons-material'

// NotificationItem.types.ts
export interface Notification {
  id?: number
  title: string
  message: string
  url?: string // Cho phép url là optional
  notifyAt: Date | null
}

interface NotificationItemProps {
  notification: Notification
  handleDelete?: (notificationId?: number) => Promise<void>
}

const NotificationItem: FC<NotificationItemProps> = ({ notification, handleDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = (): void => setIsExpanded((prev) => !prev)

  // Kiểm tra xem có cần hiện nút "Xem thêm" hay không dựa trên độ dài của message
  const isLongMessage = notification.message.length > 100

  const displayedMessage = useMemo(() => {
    return isExpanded || !isLongMessage
      ? notification.message
      : notification.message.slice(0, 100) + '...'
  }, [isExpanded, notification.message, isLongMessage])

  // Chuyển đổi thời gian thành định dạng dễ đọc
  const formattedDate = (notification.notifyAt != null) ? new Date(notification.notifyAt).toLocaleString() : 'Chưa có thời gian'

  return (
    <div key={notification.id} className="bg-white shadow-sm rounded-lg p-3 mb-2 hover:shadow-md transition-shadow duration-200 relative flex flex-col justify-between">
      {/* Header with title and delete button */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800 truncate">{notification.title}</h2>

        {/* Nút xóa thông báo với màu icon đẹp */}
        <IconButton
          onClick={() => {
            if (handleDelete != null) {
              void handleDelete(notification.id)
            } else {
              console.error('handleDelete is undefined')
            }
          }}
          aria-label="Delete notification"
          className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm"
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      </div>

      {/* Notification message with expand option */}
      <p
        onClick={toggleExpand}
        className={`cursor-pointer text-gray-700 ${!isExpanded ? 'line-clamp-2' : ''} mb-2 text-sm`}
      >
        {displayedMessage}
      </p>

      {/* Footer with time and arrow link */}
      <div className="flex justify-between items-center text-xs">
        {/* Hiển thị thời gian thông báo */}
        <p className="text-gray-500">{formattedDate}</p>

        {/* Link to open URL if exists */}
        {(notification.url != null) && (
          <a
            href={notification.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-700 transition-colors duration-300"
            aria-label="Open link"
          >
            <IconButton size="small">
              <ArrowForward fontSize="small" />
            </IconButton>
          </a>
        )}
      </div>
    </div>
  )
}

export default NotificationItem
