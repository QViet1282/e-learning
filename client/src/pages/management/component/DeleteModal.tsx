/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { FaExclamationTriangle } from 'react-icons/fa'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => Promise<void>
  warningText: string
}

const DeleteModal: FC<DeleteModalProps> = ({ isOpen, onClose, onDelete, warningText }) => {
  const { t } = useTranslation()
  if (!isOpen) return null

  const handleDelete = async (): Promise<void> => {
    await onDelete()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
        {/* Phần tiêu đề được cải tiến */}
        <div className="flex flex-col items-center justify-center mb-2">
          <FaExclamationTriangle className="h-8 w-8 text-red-500 mr-2" />
          <h2 className="text-xl font-bold text-black-600">{t('deleteModal.title')}</h2>
        </div>
        <p className="text-gray-700 mb-4 text-center">{warningText}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors duration-200"
          >
            {t('deleteModal.no')}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            {t('deleteModal.yes')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
