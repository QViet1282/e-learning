/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { FC, useMemo, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import { AccessTime, DeleteOutline, Link } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import DeleteModal from 'pages/management/component/DeleteModal'
import { useTranslation } from 'react-i18next'

export interface Notification {
  id: number
  title: string
  message: string
  url?: string
  notifyAt: Date
}

interface NotificationItemProps {
  notification: Notification
  handleDelete: (notificationId: number) => Promise<void>
}

const NotificationItem: FC<NotificationItemProps> = ({ notification, handleDelete }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalDeleteOpen, setModaDeletelOpen] = useState(false)
  const toggleExpand = (): void => setIsExpanded((prev) => !prev)
  const now = new Date()
  const isLongMessage = notification.message.length > 100

  const displayedMessage = useMemo(() => {
    return isExpanded || !isLongMessage
      ? notification.message
      : notification.message.slice(0, 100) + '...'
  }, [isExpanded, notification.message, isLongMessage])

  const formattedDate = (notification.notifyAt != null) ? new Date(notification.notifyAt).toLocaleString() : ''
  const notifyAtTime = new Date(notification.notifyAt)
  const isPast = notifyAtTime <= now

  return (
    <div key={notification.id} className="bg-white shadow-sm rounded-lg p-3 mb-2 hover:shadow-md transition-shadow duration-200 relative flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {!isPast && (<Tooltip title={'Đã lên lịch gửi'} arrow>
            <AccessTime className="text-teal-400 mr-1" />
          </Tooltip>)}
          <Tooltip title={notification.title} arrow>
            <span>{notification.title}</span>
          </Tooltip>
        </h2>

        <IconButton
          onClick={() => {
            if (handleDelete != null) {
              setModaDeletelOpen(true)
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

      <p
        onClick={toggleExpand}
        className={`cursor-pointer text-gray-700 ${!isExpanded ? 'line-clamp-2' : ''} mb-2 text-sm`}
      >
        <span className="mr-2 btext-lg text-yellow-500">
          📣
        </span>
        {displayedMessage}
      </p>

      <div className="flex justify-between items-center text-xs">
        <p className="text-gray-500">{formattedDate}</p>

        {(notification.url != null) && (
          <a
            href={notification.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-700 transition-colors duration-300"
            aria-label="Open link"
          >
            <IconButton size="small" className="hover:text-blue-500">
              <Link fontSize="small" />
            </IconButton>
          </a>
        )}
      </div>
      <DeleteModal
        isOpen={isModalDeleteOpen}
        onClose={() => setModaDeletelOpen(false)}
        onDelete={async () => await handleDelete(notification.id)}
        warningText={t('notificationManagement.warningText')}
      />
    </div>
  )
}

export default NotificationItem
