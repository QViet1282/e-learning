/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react'
import { Bar, Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { getStatisticsEnrollmentAndRevenueByCourse, getCourseStatistics, getRatingByCourse } from 'api/get/get.api'
import GroupIcon from '@mui/icons-material/Group'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StarIcon from '@mui/icons-material/Star'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Statistics = ({ courseId }: { courseId: number }) => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [monthlyData, setMonthlyData] = useState<any>({})
  const [courseStats, setCourseStats] = useState<any>({})
  const [ratings, setRatings] = useState<any>({})
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)

  // Fetch dữ liệu thống kê khóa học
  const fetchCourseStatistics = async () => {
    try {
      const response = await getCourseStatistics({ courseId })
      setCourseStats(response.data)
    } catch (error) {
      console.error('Error fetching course statistics:', error)
    }
  }

  const fetchRatings = async () => {
    try {
      const response = await getRatingByCourse({ courseId })
      setRatings(response.data)
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  useEffect(() => {
    void fetchCourseStatistics()
    void fetchRatings()
  }, [courseId])

  // Fetch dữ liệu đăng ký và doanh thu theo năm
  useEffect(() => {
    const fetchYearlyData = async () => {
      try {
        const response = await getStatisticsEnrollmentAndRevenueByCourse({ year: selectedYear, courseId, month: selectedMonth, type: selectedMonth ? 'day' : 'month' })
        setMonthlyData(response.data)
      } catch (error) {
        console.error('Error fetching yearly data:', error)
      }
    }

    if (selectedYear) {
      void fetchYearlyData()
    }
  }, [selectedYear, selectedMonth, courseId])

  // const chartOptions: ChartOptions<'bar'> = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'bottom'
  //     }
  //   },
  //   scales: {
  //     x: {
  //       stacked: false
  //     },
  //     y: {
  //       stacked: false,
  //       position: 'left', // Đặt trục Y bên trái
  //       title: {
  //         display: true,
  //         text: 'Lượt Đăng Ký'
  //       }
  //     },
  //     y2: {
  //       stacked: false,
  //       position: 'right', // Đặt trục Y2 bên phải
  //       title: {
  //         display: true,
  //         text: 'Doanh Thu (VNĐ)'
  //       },
  //       grid: {
  //         drawOnChartArea: false // Tắt lưới của trục Y2
  //       }
  //     }
  //   }
  // }

  const chartOptions = {
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
          text: selectedMonth ? 'Ngày trong tháng' : 'Tháng trong năm'
        },
        grid: {
          display: false // Tắt grid để nhìn gọn hơn
        },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          callback: (value: any, index: number) => {
            if (selectedMonth) {
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

  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 40,
          padding: 15,
          font: {
            size: 14
          }
        }
      }
    }
  }

  const combinedData = {
    labels: monthlyData.labels ?? [],
    datasets: [
      {
        label: 'Doanh Thu (VNĐ)',
        data: monthlyData.revenue ?? [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y1',
        tension: 0,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Lượt Đăng Ký',
        data: monthlyData.registrations ?? [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y2',
        tension: 0,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  }

  // Dữ liệu cho biểu đồ tròn
  const pieData = {
    labels: ['1 sao', '2 sao', '3 sao', '4 sao', '5 sao'],
    datasets: [
      {
        label: 'Đánh giá',
        data: [ratings[1] || 0, ratings[2] || 0, ratings[3] || 0, ratings[4] || 0, ratings[5] || 0],
        backgroundColor: ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#4caf50']
      }
    ]
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = e.target.value ? Number(e.target.value) : currentYear
    setSelectedYear(selectedYear)
    if (!selectedYear) setSelectedMonth(currentMonth)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = e.target.value ? Number(e.target.value) : currentMonth
    setSelectedMonth(selectedMonth)
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="w-full border-b-2 mb-4">
        <div className="text-3xl font-bold p-2">Thống kê</div>
      </div>
      {/* Biểu đồ kết hợp */}
      <div className="w-full bg-white md:p-6 p-4 rounded-lg shadow-lg">
        {/* Thẻ hiển thị thông tin */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg shadow-md flex items-center">
            <GroupIcon className="text-blue-600 mr-4" fontSize="large" />
            <div>
              <div className="text-xl font-bold">{courseStats.totalStudents ?? 0}</div>
              <div className="text-gray-600">Học Viên Đăng Kí</div>
            </div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow-md flex items-center">
            <CheckCircleIcon className="text-green-600 mr-4" fontSize="large" />
            <div>
              <div className="text-xl font-bold">{courseStats.completedEnrollments ?? 0}</div>
              <div className="text-gray-600">Hoàn Thành khóa học</div>
            </div>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg shadow-md flex items-center">
            <StarIcon className="text-yellow-600 mr-4" fontSize="large" />
            <div>
              <div className="text-xl font-bold">{courseStats.averageRating ?? 'N/A'}</div>
              <div className="text-gray-600">Đánh Giá Trung Bình</div>
            </div>
          </div>

          <div className="bg-orange-100 p-4 rounded-lg shadow-md flex items-center">
            <AttachMoneyIcon className="text-orange-600 mr-4" fontSize="large" />
            <div>
              <div className="text-xl font-bold">{courseStats.totalRevenue?.toLocaleString('vi-VN') ?? 0}₫</div>
              <div className="text-gray-600">Tổng Doanh Thu</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between w-full">
          <div className="w-full md:w-8/12">
            <div className="flex justify-between items-center mb-4 flex-wrap">
              <h3 className="text-xl font-semibold">Lượt đăng ký và Doanh thu</h3>
              <div className="flex items-center justify-center">
                <label className="mr-4 font-semibold">Chọn năm:</label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {[2025, 2024, 2023, 2022].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {selectedYear && (
                  <>
                    <label className="ml-6 mr-4 font-semibold">Tháng:</label>
                    <select
                      value={selectedMonth ?? undefined}
                      onChange={handleMonthChange}
                      className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value={undefined}>Tháng 1-12</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Tháng {i + 1}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
            <Bar data={combinedData} options={chartOptions} />
          </div>
          <div className="w-full md:w-4/12 flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Phân tích đánh giá</h3>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
