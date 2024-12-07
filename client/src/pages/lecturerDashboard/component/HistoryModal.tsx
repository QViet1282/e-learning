/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { Modal, Box, Button } from '@mui/material'
import { getRequestPayoutHistory } from 'api/get/get.api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { useTranslation } from 'react-i18next'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PayoutHistoryItem {
  createdAt: Date
  id: number
  createdDate: string
  bankName: string
  cardholderName: string
  cardNumber: string
  note: string
  payoutDate: Date | null
  payoutAmount: number
  status: 'Success' | 'Fail' | 'Pending'
}

function HistoryModal ({ isOpen, onClose }: HistoryModalProps) {
  const { t } = useTranslation()
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const fetchPayoutHistory = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getRequestPayoutHistory()
      setPayoutHistory(response.data)
    } catch (error) {
      const errorMes = t('lectureDashboard.error_fetching_payout_history')
      setError(errorMes)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      void fetchPayoutHistory()
    }
  }, [isOpen])

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box className="bg-white w-full max-w-lg mx-auto mt-20 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-yellow-500 mb-4 flex items-center gap-2">
          <span className="text-yellow-500">📝</span>
          {t('lectureDashboard.payout_history')}
        </h2>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading
            ? (
              <p className="text-center text-gray-500">{t('lectureDashboard.loading')}</p>
              )
            : error
              ? (
                <p className="text-center text-red-500">{error}</p>
                )
              : payoutHistory.length > 0
                ? (
                    payoutHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between p-4 bg-gray-100 rounded-md shadow-sm"
                    >
                      <div>
                        <p className="font-semibold text-lg text-gray-600">#{item.id}</p>
                        <p className="text-gray-600">{t('lectureDashboard.bank')}: {item.bankName}</p>
                        <p className="text-gray-600">{t('lectureDashboard.cardholder')}: {item.cardholderName}</p>
                        <p className="text-gray-600">{t('lectureDashboard.card_number')}: {item.cardNumber}</p>
                        <p className="text-gray-600">{t('lectureDashboard.amount')}: {Number(item.payoutAmount).toLocaleString('vi-VN')} VND</p>
                        <p className="text-gray-600">{t('lectureDashboard.note')}: {item.note}</p>
                        <p className="text-gray-600">{t('lectureDashboard.payout_date')}: {item.payoutDate ? new Date(item.payoutDate).toLocaleString('vi-VN') : t('lectureDashboard.pending')}</p>
                        <p className="text-gray-600">{t('lectureDashboard.created_at')}: {new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        {/* Tùy chỉnh hiển thị trạng thái */}
                        {item.status === 'Success' && (
                          <span className="text-green-500 flex items-center gap-1">
                            <CheckCircleIcon /> {t('lectureDashboard.success')}
                          </span>
                        )}
                        {item.status === 'Fail' && (
                          <span className="text-red-500 flex items-center gap-1">
                            <ErrorIcon /> {t('lectureDashboard.fail')}
                          </span>
                        )}
                        {item.status === 'Pending' && (
                          <span className="text-yellow-500 flex items-center gap-1">
                            <HourglassEmptyIcon /> {t('lectureDashboard.pending')}
                          </span>
                        )}
                      </div>
                    </div>
                    ))
                  )
                : (
                  <p className="text-center text-gray-500">{t('lectureDashboard.noPayoutHistory')}</p>
                  )}
        </div>

        <div className="flex w-full justify-end">
          <div className="mt-4 rounded-lg border-2 border-blue-500 w-1/3">
            <Button onClick={onClose} className="w-full">
              {t('lectureDashboard.close')}
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default HistoryModal
