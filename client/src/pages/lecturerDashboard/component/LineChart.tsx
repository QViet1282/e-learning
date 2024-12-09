/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { getStatisticsEnrollmentAndRevenueByTeacher } from 'api/get/get.api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface LineChartProps {
  type: 'day' | 'month'
  year: number
  month: number | undefined
  teacherId?: number
}

const LineChart = ({ type = 'day', year = 2024, month = 1, teacherId }: LineChartProps) => {
  const [dataChart, setDataChart] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await getStatisticsEnrollmentAndRevenueByTeacher({ month, year, type })
        const { labels, totalRevenueData, totalStudentsData } = response.data

        console.log('Labels:', labels)
        console.log('Revenue Data:', totalRevenueData)
        console.log('Registration Data:', totalStudentsData)
        setDataChart({
          labels,
          datasets: [
            {
              label: 'Doanh thu (VNĐ)',
              data: totalRevenueData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              yAxisID: 'y1',
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 2
            },
            {
              label: 'Lượt đăng ký',
              data: totalStudentsData,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              yAxisID: 'y2',
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 3
            }
          ]
        })
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [month, year, teacherId, type])

  if (loading) {
    return <div>Loading...</div>
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: type === 'day' ? 'Ngày trong tháng' : 'Tháng trong năm'
        },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          callback: (value: any, index: number) => {
            if (type === 'day') {
              return index % 5 === 0 ? ++value : ''
            } else {
              return index % 1 === 0 ? ++value : ''
            }
          }
        }
      },
      y1: {
        stacked: false,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)'
        },
        ticks: {
          callback: (value: number | string) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value)
            return `${numValue.toLocaleString()} VNĐ`
          }
        }
      },
      y2: {
        id: 'y2',
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Lượt đăng ký'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }

  return (
    <div className="w-full md:w-12/12 mx-auto p-4">
      {/* <h2 className="text-2xl font-bold text-center mb-6">Thống kê Doanh thu & Lượt đăng ký</h2> */}
      <Line data={dataChart} options={options} />
    </div>
  )
}

export default LineChart
