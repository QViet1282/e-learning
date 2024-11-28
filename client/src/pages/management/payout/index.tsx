/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useState, useEffect } from 'react'
import PayoutCard from './components/PayoutCard'
import StatisticsCards from './components/StatisticsCards'
import { getAllPayout } from 'api/get/get.api'
import { AxiosResponse } from 'axios'
import { PacmanLoader } from 'react-spinners'
import { Search } from '@mui/icons-material'
import Pagination from '../component/Pagination'

interface Payout {
  id: number
  instructorId: number
  totalRevenue: string
  serviceFee: number
  payoutAmount: string
  status: string
  bankName: string
  cardholderName: string
  cardNumber: string
  payoutDate: Date | null
  note: string | null
  createdAt: string
  updatedAt: string
}

interface Meta {
  currentPage: number
  totalItems: number
  totalPages: number
  itemsPerPage: number
}

interface PayoutResponse {
  data: Payout[]
  meta: Meta
}

const PayoutPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [payoutData, setPayoutData] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const ITEMS_PER_PAGE = 9

  const fetchAllPayoutData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response: AxiosResponse<PayoutResponse> = await getAllPayout(searchQuery, statusFilter, currentPage, ITEMS_PER_PAGE)
      setPayoutData(response.data.data)
      setTotalPages(response.data.meta.totalPages)
      setTotalItems(response.data.meta.totalItems)
    } catch (err) {
      setError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAllPayoutData()
  }, [statusFilter, currentPage])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="bg-sky-100 p-8 border-x-2">
      {/* Header */}
      <h1 className="text-4xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 mb-8">
        Quản Lý Yêu Cầu Trả Tiền
      </h1>

      {/* Thông tin ngân sách */}
      <StatisticsCards />

      {/* Tìm kiếm và lọc */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className='lg:w-2/3 w-full gap-2 flex'>
          <div className='p-2 border-2 rounded-lg shadow-sm bg-white flex items-center'>
            <p>{totalItems} yêu cầu</p>
          </div>
          <select
            className="p-2 border-2 rounded-md shadow-sm w-full md:w-1/4 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Success">Đã Hoàn Thành</option>
            <option value="Pending">Đang Xử Lý</option>
            <option value="Fail">Thất Bại</option>
          </select>
        </div>
        <div className='w-full lg:w-1/3 gap-2 flex'>
          <input
            type="text"
            placeholder="Tìm kiếm theo id hoặc số thẻ..."
            className="p-2 border-2 rounded-md shadow-sm w-full focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={async () => await fetchAllPayoutData()} className="p-2 bg-white rounded-md border-2 active:scale-95 hover:bg-slate-50">
            <Search className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Danh sách yêu cầu */}
      <div className="mt-10">
        {loading
          ? (
            <div className="flex justify-center items-center w-full min-h-72 mt-15">
              <PacmanLoader
                className='flex justify-center items-center w-full mt-20'
                color='#5EEAD4'
                cssOverride={{
                  display: 'block',
                  margin: '0 auto',
                  borderColor: 'blue'
                }}
                loading
                margin={10}
                speedMultiplier={3}
                size={40}
              /></div>
          )
          : error
            ? (
              <div className="w-full flex items-center justify-center min-h-72">{error}</div>
            )
            : payoutData.length === 0
              ? (
                <div className="w-full flex items-center justify-center min-h-72">
                  Không có dữ liệu để hiển thị.
                </div>
              )
              : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-96">
                  {payoutData.map((payout) => (
                    <PayoutCard key={payout.id} {...payout} fetchAllPayoutData={fetchAllPayoutData} />
                  ))}
                </div>
              )}
      </div>

      {/* Phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default PayoutPage
