/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ContentCopyOutlined } from '@mui/icons-material'
import { processPayoutRequest } from 'api/put/put.api'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

interface PayoutCardProps {
  id?: number
  instructorId?: number
  totalRevenue?: number
  serviceFee?: number
  payoutAmount?: number
  status?: string
  bankName?: string
  cardholderName?: string
  cardNumber?: string
  payoutDate?: Date | null
  note?: string | null
  fetchAllPayoutData: () => Promise<void>
}

const PayoutCard: React.FC<PayoutCardProps> = React.memo(({
  id,
  totalRevenue,
  serviceFee,
  payoutAmount,
  status,
  bankName,
  cardholderName,
  cardNumber,
  payoutDate,
  note,
  fetchAllPayoutData
}) => {
  const [noteText, setNoteText] = useState(note ?? '')

  const statusColor = status === 'Pending' ? 'yellow' : status === 'Success' ? 'green' : 'red'
  const isProcress = status === 'Pending'

  const handleCopyCardNumber = (): void => {
    void navigator.clipboard.writeText(cardNumber ?? '')
  }

  const handleCopyPayoutAmount = (): void => {
    void navigator.clipboard.writeText(Number(payoutAmount)?.toString() ?? '')
  }

  const handleAction = async (result: boolean) => {
    if (!id) {
      console.error('ID payout request không xác định.')
      return
    }

    try {
      const payload = {
        result,
        note: noteText,
        payoutDate: result ? new Date() : null
      }

      await processPayoutRequest(id, payload)
      toast.success(result ? 'Duyệt thành công' : 'Từ chối thành công') // trans
      void fetchAllPayoutData()
    } catch (error) {
      toast.error('Xử lý thất bại, vui lòng thử lại.') // trans
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:-translate-y-2 transform transition-all duration-300 group">
      {/* ID và Trạng Thái */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold text-blue-600">ID: {id}</p>
        <span
          className={`px-3 py-1 rounded-lg text-white ${statusColor === 'yellow' ? 'bg-yellow-500' : statusColor === 'green' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {status}
        </span>
      </div>

      {/* Thông tin tổng doanh thu và phí dịch vụ */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Doanh Thu</p>
          <p className="text-xl font-semibold">{Number(totalRevenue).toLocaleString('vi-VN')} VND</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phí Dịch Vụ</p>
          <p className="text-xl font-semibold">{serviceFee}%</p>
        </div>
      </div>

      {/* Số tiền chuyển khoản */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">Số Tiền Chuyển Khoản</p>
          <button
            onClick={handleCopyPayoutAmount}
            className="active:scale-95"
          >
            <ContentCopyOutlined fontSize='inherit' />
          </button>
        </div>
        <p className="text-xl font-bold text-gray-900">{Number(payoutAmount).toLocaleString('vi-VN')} VND</p>
      </div>

      {/* Ngân hàng và Chủ thẻ */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Ngân Hàng</p>
          <p className="text-lg font-semibold">{bankName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Chủ Thẻ</p>
          <p className="text-lg font-semibold">{cardholderName}</p>
        </div>
      </div>

      {/* Số thẻ (Ẩn một phần cho bảo mật) */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">Số Thẻ</p>
          <button
            onClick={handleCopyCardNumber}
            className="active:scale-95"
          >
            <ContentCopyOutlined fontSize='inherit' />
          </button>
        </div>
        <p className="text-lg font-semibold">{cardNumber}</p>
      </div>

      {/* Ngày chuyển khoản */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">Thời Điểm Chuyển Khoản</p>
        <p className="text-lg font-semibold">{payoutDate ? new Date(payoutDate).toLocaleString('vi-VN') : 'Chưa có'}</p>
      </div>

      {/* Ghi chú */}
      <div className="">
        <p className="text-sm text-gray-500">Ghi Chú</p>
        <textarea
          placeholder="Nhập ghi chú..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        ></textarea>
      </div>

      {/* Hành động */}
      {isProcress && (
        <div className="flex gap-4 mt-4">
          <button
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all"
            onClick={async () => await handleAction(true)} // Duyệt
          >
            Duyệt
          </button>
          <button
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all"
            onClick={async () => await handleAction(false)} // Từ Chối
          >
            Từ Chối
          </button>
        </div>
      )}
    </div>
  )
})

export default PayoutCard
