/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState } from 'react'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import HistoryIcon from '@mui/icons-material/History'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import WithdrawRequestModal from './WithdrawRequestModal'
import HistoryModal from './HistoryModal'
import { useTranslation } from 'react-i18next'

const LecturerRevenue = ({ totalRevenue = 0, pendingRevenue = 0 }: { totalRevenue: number, pendingRevenue: number }) => {
  const { t } = useTranslation()
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false)
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false)

  const handleOpenHistoryModal = () => setHistoryModalOpen(true)
  const handleCloseHistoryModal = () => setHistoryModalOpen(false)

  const handleOpenWithdrawModal = () => setWithdrawModalOpen(true)
  const handleCloseWithdrawModal = () => setWithdrawModalOpen(false)

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <AccountBalanceWalletIcon className="text-green-500" />
        {t('lectureDashboard.revenue_header')}
      </h2>
      {/* Tổng doanh thu */}
      <div className="mb-6 flex items-center gap-4">
        <AttachMoneyIcon className="text-green-500 text-3xl" />
        <div>
          <p className="text-gray-600 text-sm">{t('lectureDashboard.total_revenue')}</p>
          <p className="text-2xl font-semibold text-green-500">{Number(totalRevenue).toLocaleString('vi-VN')} VND</p>
        </div>
      </div>
      {/* Số dư khả dụng */}
      <div className="mb-6 flex items-center gap-4">
        <AttachMoneyIcon className="text-blue-500 text-3xl" />
        <div>
          <p className="text-gray-600 text-sm">{t('lectureDashboard.pending_revenue')}</p>
          <p className="text-2xl font-semibold text-blue-500">{Number(pendingRevenue).toLocaleString('vi-VN')} VND</p>
        </div>
      </div>
      {/* Nút hành động */}
      <div className="flex gap-4">
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
          onClick={handleOpenWithdrawModal}
        >
          <AttachMoneyIcon />
          {t('lectureDashboard.withdraw_request')}
        </button>
        <button
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
          onClick={handleOpenHistoryModal}
        >
          <HistoryIcon />
          {t('lectureDashboard.view_history')}
        </button>
      </div>

      <HistoryModal isOpen={isHistoryModalOpen} onClose={handleCloseHistoryModal}/>

      <WithdrawRequestModal isOpen={isWithdrawModalOpen} onClose={handleCloseWithdrawModal} pendingRevenue={pendingRevenue}/>
    </div>
  )
}

export default LecturerRevenue
