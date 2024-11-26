/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { Modal, Box, Button } from '@mui/material'
import { getRequestPayoutHistory } from 'api/get/get.api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'

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
      setError('Không thể lấy lịch sử rút tiền. Vui lòng thử lại.')
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
          Lịch Sử Rút Tiền
        </h2>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading
            ? (
              <p className="text-center text-gray-500">Đang tải...</p>
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
                        <p className="text-gray-600">Ngân hàng: {item.bankName}</p>
                        <p className="text-gray-600">Chủ thẻ: {item.cardholderName}</p>
                        <p className="text-gray-600">Số thẻ: {item.cardNumber}</p>
                        <p className="text-gray-600">Số tiền: {Number(item.payoutAmount).toLocaleString('vi-VN')} VND</p>
                        <p className="text-gray-600">Ghi chú: {item.note}</p>
                        <p className="text-gray-600">Thời điểm tất toán: {item.payoutDate ? new Date(item.payoutDate).toLocaleString('vi-VN') : 'Chưa tất toán'}</p>
                        <p className="text-gray-600">Ngày tạo: {new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        {/* Tùy chỉnh hiển thị trạng thái */}
                        {item.status === 'Success' && (
                          <span className="text-green-500 flex items-center gap-1">
                            <CheckCircleIcon /> Thành công
                          </span>
                        )}
                        {item.status === 'Fail' && (
                          <span className="text-red-500 flex items-center gap-1">
                            <ErrorIcon /> Thất bại
                          </span>
                        )}
                        {item.status === 'Pending' && (
                          <span className="text-yellow-500 flex items-center gap-1">
                            <HourglassEmptyIcon /> Đang chờ
                          </span>
                        )}
                      </div>
                    </div>
                    ))
                  )
                : (
                  <p className="text-center text-gray-500">Chưa có lịch sử rút tiền.</p>
                  )}
        </div>

        <div className="flex w-full justify-end">
          <div className="mt-4 rounded-lg border-2 border-blue-500 w-1/3">
            <Button onClick={onClose} className="w-full">
              Đóng
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default HistoryModal
