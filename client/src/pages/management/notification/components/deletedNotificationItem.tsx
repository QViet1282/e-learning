/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { FC, useMemo, useState } from 'react'

// NotificationItem.types.ts
export interface Notification {
  id: number
  title: string
  message: string
  url?: string // Cho phép url là optional
}

interface NotificationItemProps {
  notification: Notification
}

const DeletedNotificationItem: FC<NotificationItemProps> = ({ notification }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = (): void => setIsExpanded((prev) => !prev)

  // Kiểm tra xem có cần hiện nút "Xem thêm" hay không dựa trên độ dài của message
  const isLongMessage = notification.message.length > 100

  const displayedMessage = useMemo(() => {
    return isExpanded || !isLongMessage
      ? notification.message
      : notification.message.slice(0, 100) + '...'
  }, [isExpanded, notification.message, isLongMessage])

  return (
    <div key={notification.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{notification.title}</h2>
      </div>

      <p onClick={toggleExpand} className={`cursor-pointer text-gray-600 min-h-12 ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {displayedMessage}
      </p>

      {/* Chỉ hiển thị link nếu có URL */}
      {(notification.url != null) && (
        <a
          href={notification.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline block mt-1"
        >
          Truy cập ngay ({notification.url}) {/* Hiển thị đường link */}
        </a>
      )}
    </div>
  )
}

export default DeletedNotificationItem
