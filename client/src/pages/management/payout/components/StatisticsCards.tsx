/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react'
import { AttachMoney, TrendingUp, HourglassEmpty, DoneAll } from '@mui/icons-material'
import { getPayoutStatistics } from 'api/get/get.api'

const StatisticsCards: React.FC = () => {
  const [systemBudget, setSystemBudget] = useState<number>(0)
  const [totalPending, setTotalPending] = useState<number>(0)
  const [totalPaid, setTotalPaid] = useState<number>(0)
  const [totalRevenue, setTotalRevenue] = useState<number>(0)

  const fetchStatistics = async () => {
    try {
      const response = await getPayoutStatistics()

      setSystemBudget(response.data.systemBudget ?? 0)
      setTotalPending(response.data.totalPending ?? 0)
      setTotalPaid(response.data.totalPaid ?? 0)
      setTotalRevenue(response.data.totalRevenue ?? 0)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  useEffect(() => {
    void fetchStatistics()
  }, [])

  const stats = useMemo(() => {
    return [
      {
        id: 1,
        icon: <AttachMoney className="text-green-500" style={{ fontSize: '32px' }} />,
        title: 'Ngân Sách Hệ Thống',
        value: `${(totalRevenue + totalPending).toLocaleString()} VND`,
        color: 'green'
      },
      {
        id: 2,
        icon: <TrendingUp className="text-blue-500" style={{ fontSize: '32px' }} />,
        title: 'Doanh Thu Hệ Thống',
        value: `${systemBudget.toLocaleString()} VND`,
        color: 'blue'
      },
      {
        id: 3,
        icon: <HourglassEmpty className="text-yellow-500" style={{ fontSize: '32px' }} />,
        title: 'Số Tiền Chưa Chi Trả',
        value: `${totalPending.toLocaleString()} VND`,
        color: 'yellow'
      },
      {
        id: 4,
        icon: <DoneAll className="text-red-500" style={{ fontSize: '32px' }} />,
        title: 'Số Tiền Đã Chi',
        value: `${totalPaid.toLocaleString()} VND`,
        color: 'red'
      }
    ]
  }, [systemBudget, totalRevenue, totalPending, totalPaid])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
        >
          <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-4 bg-${stat.color}-100`}>
            {stat.icon}
          </div>
          <p className="text-lg font-semibold mb-2 text-gray-700">{stat.title}</p>
          <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

export default StatisticsCards
