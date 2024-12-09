/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import { Modal, Tooltip } from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { toast } from 'react-toastify'
import { requestPayout } from 'api/post/post.api'
import { useTranslation } from 'react-i18next'

const WithdrawRequestModal = ({ isOpen, onClose, pendingRevenue }: { isOpen: boolean, onClose: () => void, pendingRevenue: number }) => {
  const { t } = useTranslation()
  const [banks, setBanks] = useState<any[]>([])
  const [selectedBank, setSelectedBank] = useState<any>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const handleBankSelect = (bank: any) => {
    setSelectedBank(bank)
    setIsDropdownOpen(false)
    setSearchKeyword('') // Reset từ khóa sau khi chọn
  }

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    bank.shortName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    bank.code.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch('https://api.vietqr.io/v2/banks')
        const data = await response.json()
        setBanks(data.data) // API trả về danh sách ngân hàng trong `data`
      } catch (error) {
        toast.error(t('withdrawRequest.error.fetchBanks')) // Lỗi khi fetch danh sách ngân hàng
      }
    }
    void fetchBanks()
  }, [t])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedBank || !accountName || !accountNumber) {
      toast.error(t('withdrawRequest.error.missingFields')) // Vui lòng điền đầy đủ thông tin
      return
    }

    if (pendingRevenue === 0) {
      toast.error(t('withdrawRequest.error.noRevenue')) // Bạn chưa có doanh thu để rút
      return
    }

    const payload = {
      totalRevenue: pendingRevenue,
      serviceFee: 30,
      payoutAmount: pendingRevenue * 0.7,
      bankName: selectedBank.shortName,
      cardholderName: accountName,
      cardNumber: accountNumber
    }

    requestPayout(payload)
      .then((response) => {
        console.log('Response:', response)

        if (response.status === 201) {
          toast.success(t('withdrawRequest.success.requestCreated')) // Yêu cầu thanh toán thành công
          onClose()
        } else if (response.status === 409) {
          toast.error(t('withdrawRequest.error.pendingRequest')) // Bạn đã có yêu cầu thanh toán đang chờ xử lý
        } else {
          console.log(response.status)
          toast.error(t('withdrawRequest.error.requestError')) // Đã có lỗi xảy ra trong quá trình yêu cầu
        }
      })
      .catch((error) => {
        console.error('Catch Error:', error)
        toast.error(t('withdrawRequest.error.requestError')) // Đã có lỗi xảy ra trong quá trình yêu cầu
      })
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-white w-full max-w-lg mx-auto mt-20 p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <AttachMoneyIcon className="text-blue-500" />
          <h2 className="text-xl font-bold text-gray-800">{t('withdrawRequest.title')}</h2>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ngân hàng */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">{t('withdrawRequest.selectBank')}</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between focus:ring focus:ring-blue-300 focus:outline-none"
              >
                {selectedBank ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedBank.logo}
                      alt={selectedBank.name}
                      className="w-10 h-8 object-contain"
                    />
                    <span>{selectedBank.code} - {selectedBank.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">{t('withdrawRequest.selectBankPlaceholder')}</span>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 bg-white w-full border border-gray-300 rounded-lg shadow-lg mt-2">
                  {/* Ô tìm kiếm */}
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder={t('withdrawRequest.searchBankPlaceholder').toString()}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none"
                  />
                  {/* Danh sách ngân hàng */}
                  <ul className="max-h-60 overflow-y-auto">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank) => (
                        <li
                          key={bank.id}
                          onClick={() => handleBankSelect(bank)}
                          className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <img
                            src={bank.logo}
                            alt={bank.name || 'Logo ngân hàng'}
                            className="w-10 h-10 object-contain"
                          />
                          <span>{bank.shortName} ({bank.code}) - {bank.name} </span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-400">
                        {t('withdrawRequest.noBankFound')}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Số tài khoản */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">{t('withdrawRequest.accountNumber')}</label>
            <input
              type="text"
              placeholder={t('withdrawRequest.enterAccountNumber').toString()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          {/* Tên tài khoản */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">{t('withdrawRequest.accountName')}</label>
            <input
              type="text"
              placeholder={t('withdrawRequest.enterAccountName').toString()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
            />
          </div>

          {/* Số tiền muốn rút */}
          <div>
            <Tooltip title={t('withdrawRequest.tooltipAmount')} arrow>
              <label className="block text-gray-600 text-sm mb-1">{t('withdrawRequest.withdrawAmount')}</label>
            </Tooltip>
            <input
              type="text"
              placeholder={t('withdrawRequest.enterWithdrawAmount').toString()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300 focus:outline-none bg-slate-100"
              value={pendingRevenue.toLocaleString('vi-Vi') + ' VND'}
              min={0}
              step={1}
              disabled={true}
            />
          </div>

          <div>
            <Tooltip title={t('withdrawRequest.tooltipRealAmount')} arrow>
              <label className="block text-gray-600 text-sm mb-1">{t('withdrawRequest.realAmount')}</label>
            </Tooltip>
            <input
              type="text"
              placeholder={t('withdrawRequest.enterRealAmount').toString()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300 focus:outline-none bg-slate-100"
              value={(pendingRevenue * 0.7).toLocaleString('vi-Vi') + ' VND'}
              min={0}
              step={1}
              disabled={true}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-lg mt-4"
          >
            {t('withdrawRequest.submit')}
          </button>
        </form>
      </div>
    </Modal>
  )
}

export default WithdrawRequestModal
