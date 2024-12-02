/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { getTopEarningCourses, getTopEnrollmentCourses, getTopRatedCourses, getAllRegistrationsAndRevenue, getStatistics, getTopEarningTeachers, getUserCourseGrowthStatistics } from 'api/get/get.api'
import { AttachMoney, EventNote, Group, School } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [allRegistrationsAndRevenue, setAllRegistrationsAndRevenue] = useState<any>({})
  const [userCourseGrowthStatistics, setUserCourseGrowthStatistics] = useState<any>({})
  const [selectedYearTop, setSelectedYearTop] = useState<number | undefined>(undefined)
  const [selectedMonthTop, setSelectedMonthTop] = useState<number | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  // const chartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'bottom' as const
  //     }
  //   }
  // }

  const crownIcons = ['👑', '🥈', '🥉']
  const [topRatedCourses, setTopRatedCourses] = useState<any[]>([])
  const [topEnrollmentCourses, setTopEnrollmentCourses] = useState<any[]>([])
  const [topEarningCourses, setTopEarningCourses] = useState<any[]>([])
  const [topEarningTeachers, setTopEarningTeachers] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>({
    totalCourses: 0,
    totalUsers: 0,
    totalEarnings: 0,
    totalRegistrations: 0
  })

  useEffect(() => {
    // Lấy dữ liệu thống kê chung khi component mount
    const fetchGeneralStatistics = async () => {
      try {
        const response = await getStatistics()
        const data = response.data
        const totalRevenue = parseFloat(data.totalRevenue)
        setStatistics({
          totalCourses: data.totalCourses,
          totalUsers: data.totalUsers,
          totalEarnings: totalRevenue,
          totalRegistrations: data.totalEnrollments
        })

        const ratedCoursesResponse = await getTopRatedCourses({ limit: 10 })
        setTopRatedCourses(ratedCoursesResponse.data)
      } catch (error) {
        console.error('Error fetching general statistics:', error)
      }
    }
    void fetchGeneralStatistics()
  }, [])

  useEffect(() => {
    // Lấy dữ liệu khóa học theo năm và tháng
    const fetchTopCourses = async () => {
      try {
        const enrollmentCoursesResponse = await getTopEnrollmentCourses({ limit: 10, year: selectedYearTop, month: selectedMonthTop })
        setTopEnrollmentCourses(enrollmentCoursesResponse.data)

        const earningCoursesResponse = await getTopEarningCourses({ limit: 10, year: selectedYearTop, month: selectedMonthTop })
        setTopEarningCourses(earningCoursesResponse.data)

        const earningTeachersResponse = await getTopEarningTeachers({ limit: 10, year: selectedYearTop, month: selectedMonthTop })
        setTopEarningTeachers(earningTeachersResponse.data)
      } catch (error) {
        console.error('Error fetching top courses:', error)
      }
    }
    void fetchTopCourses()
  }, [selectedYearTop, selectedMonthTop]) // Chạy khi `selectedYearTop` hoặc `selectedMonthTop` thay đổi

  useEffect(() => {
    // Lấy dữ liệu đăng ký và doanh thu theo năm
    const fetchStatisticsData = async () => {
      try {
        const monthlyRegistrationsResponse = await getAllRegistrationsAndRevenue({ year: selectedYear, type: selectedMonth ? 'day' : 'month', month: selectedMonth })
        setAllRegistrationsAndRevenue(monthlyRegistrationsResponse.data)

        const revenueResponse = await getUserCourseGrowthStatistics({ year: selectedYear, type: selectedMonth ? 'day' : 'month', month: selectedMonth })
        setUserCourseGrowthStatistics(revenueResponse.data)
      } catch (error) {
        console.error('Error fetching yearly data:', error)
      }
    }

    if (selectedYear) {
      void fetchStatisticsData()
    }
  }, [selectedYear, selectedMonth])

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
          text: selectedMonth ? `${t('statisticManagement.dayInMonth')}` : `${t('statisticManagement.monthInYear')}`
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
          text: `${t('statisticManagement.revenue')}`
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
          text: `${t('statisticManagement.registrations')}`
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }

  const combinedData = {
    labels: allRegistrationsAndRevenue.labels ?? [],
    datasets: [
      {
        label: `${t('statisticManagement.revenue')}`,
        data: allRegistrationsAndRevenue.totalRevenueData ?? [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y1',
        tension: 0,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: `${t('statisticManagement.registrations')}`,
        data: allRegistrationsAndRevenue.totalRegistrationsData ?? [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y2',
        tension: 0,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  }

  const options2 = {
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
          text: selectedMonth ? `${t('statisticManagement.dayInMonth')}` : `${t('statisticManagement.monthInYear')}`
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
          text: `${t('statisticManagement.courses')}`
        },
        ticks: {
          callback: (value: number | string) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value)
            return `${numValue.toLocaleString()}`
          }
        }
      },
      y2: {
        id: 'y2',
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: `${t('statisticManagement.users')}`
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }

  const combinedData2 = {
    labels: userCourseGrowthStatistics.labels ?? [],
    datasets: [
      {
        label: `${t('statisticManagement.courses')}`,
        data: userCourseGrowthStatistics.courseGrowthData ?? [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y1',
        tension: 0,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: `${t('statisticManagement.users')}`,
        data: userCourseGrowthStatistics.userGrowthData ?? [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y2',
        tension: 0,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  }

  useEffect(() => {
    if (!selectedYearTop) {
      setSelectedMonthTop(undefined)
    }
  }, [selectedYearTop])

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = e.target.value ? Number(e.target.value) : currentYear
    setSelectedYear(selectedYear)
    if (!selectedYear) setSelectedMonthTop(currentMonth)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = e.target.value ? Number(e.target.value) : currentMonth
    setSelectedMonth(selectedMonth)
  }

  return (
    <div className="ml-0 py-8 md:px-8 px-2 min-h-screen bg-sky-100 border-x-2">
      <h2 className="text-4xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-teal-400 to-blue-500 mb-8">
        {t('statisticManagement.title')}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        {/* Thẻ tổng số khóa học */}
        <div className="bg-teal-600 p-6 rounded-lg shadow-md text-center text-white hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
          <div className="mb-4 mx-auto">
            <School fontSize="large" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('statisticManagement.totalCourses')}</h3>
          <p className="text-3xl font-bold">{statistics.totalCourses}</p>
        </div>

        {/* Thẻ tổng số người dùng */}
        <div className="bg-blue-600 p-6 rounded-lg shadow-md text-center text-white hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
          <div className="mb-4 mx-auto">
            <Group fontSize="large" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('statisticManagement.totalUsers')}</h3>
          <p className="text-3xl font-bold">{statistics.totalUsers}</p>
        </div>

        {/* Thẻ tổng doanh thu */}
        <div className="bg-blue-700 p-6 rounded-lg shadow-md text-center text-white hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
          <div className="mb-4 mx-auto">
            <AttachMoney fontSize="large" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('statisticManagement.totalRevenue')}</h3>
          <p className="text-3xl font-bold">{statistics.totalEarnings.toLocaleString('vi-VN')} VNĐ</p>
        </div>

        {/* Thẻ tổng lượt đăng ký */}
        <div className="bg-orange-600 p-6 rounded-lg shadow-md text-center text-white hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
          <div className="mb-4 mx-auto">
            <EventNote fontSize="large" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('statisticManagement.totalRegistrations')}</h3>
          <p className="text-3xl font-bold">{statistics.totalRegistrations}</p>
        </div>
      </div>

      {/* Charts and top rated courses section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-center">
            <label className="mr-4 font-semibold">{t('statisticManagement.chartLabels.year')}:</label>
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
                <label className="ml-6 mr-4 font-semibold">{t('statisticManagement.chartLabels.month')}:</label>
                <select
                  value={selectedMonth ?? undefined}
                  onChange={handleMonthChange}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value={undefined}>{t('statisticManagement.chartLabels.month')} 1-12</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {t('statisticManagement.chartLabels.month')} {i + 1}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          <div className="w-full bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-center mb-4">{t('statisticManagement.charts.registrationAndRevenue')}</h3>
            <Bar data={combinedData} options={options} />
          </div>

          <div className="w-full bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-center mb-4">{t('statisticManagement.charts.userGrowthAndCourseGrowth')}</h3>
            <Bar data={combinedData2} options={options2} />
          </div>
        </div>

        {/* Top khóa học đánh giá cao, chiếm 1/3 */}
        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1 mt-2">
          <h3 className="text-2xl font-semibold text-center mb-4">{t('statisticManagement.topRatedCourses')}</h3>
          <div className="space-y-4">
            {topRatedCourses.map((course, index) => (
              <div key={index} className={`p-4 border rounded-lg shadow flex items-center ${index < 3 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                {index < 3 ? <span className="text-3xl mr-2">{crownIcons[index]}</span> : <span className="text-lg font-semibold text-gray-500 mr-2">#{index + 1}</span>}
                <div>
                  <h4 className="text-lg font-semibold mb-1">{course.courseName}</h4>
                  <p className="text-gray-700">{t('statisticManagement.rating.averageRating')}: {course.bayesianAverage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <label htmlFor="year" className="font-semibold text-lg">{t('statisticManagement.chartLabels.year')}:</label>
        <select
          id="year"
          value={selectedYearTop}
          onChange={(e) => {
            const selectedYear = e.target.value ? Number(e.target.value) : undefined
            if (!selectedYear) {
              setSelectedMonthTop(undefined)
            }
            setSelectedYearTop(selectedYear)
          }}
          className="ml-4 p-2 border rounded-lg"
          defaultValue={undefined}
        >
          <option value={undefined}>{t('statisticManagement.chartLabels.overTime')}</option>
          {[2025, 2024, 2023, 2022].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
          ))}
        </select>
        {(selectedYearTop) &&
          (
            <>
              <label htmlFor="month" className="font-semibold text-lg md:ml-4">{t('statisticManagement.chartLabels.month')}:</label>
              <select
                id="month"
                value={selectedMonthTop}
                onChange={(e) => setSelectedMonthTop(Number(e.target.value))}
                className="ml-4 p-2 border rounded-lg"
                defaultValue={undefined}
              >
                <option value={undefined}>{t('statisticManagement.chartLabels.month')} 1 - 12</option>
                <option value={1}>{t('statisticManagement.chartLabels.month')} 1</option>
                <option value={2}>{t('statisticManagement.chartLabels.month')} 2</option>
                <option value={3}>{t('statisticManagement.chartLabels.month')} 3</option>
                <option value={4}>{t('statisticManagement.chartLabels.month')} 4</option>
                <option value={5}>{t('statisticManagement.chartLabels.month')} 5</option>
                <option value={6}>{t('statisticManagement.chartLabels.month')} 6</option>
                <option value={7}>{t('statisticManagement.chartLabels.month')} 7</option>
                <option value={8}>{t('statisticManagement.chartLabels.month')} 8</option>
                <option value={9}>{t('statisticManagement.chartLabels.month')} 9</option>
                <option value={10}>{t('statisticManagement.chartLabels.month')} 10</option>
                <option value={11}>{t('statisticManagement.chartLabels.month')} 11</option>
                <option value={12}>{t('statisticManagement.chartLabels.month')} 12</option>
              </select>
            </>
          )}
      </div>
      {/* List of top courses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top khóa học có nhiều lượt đăng ký */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-center mb-4">{t('statisticManagement.topEnrollmentCourses')}</h3>
          <div className="space-y-4">
            {topEnrollmentCourses.map((course, index) => (
              <div key={index} className={`p-4 border rounded-lg shadow flex items-center ${index < 3 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                {index < 3 ? <span className="text-3xl mr-2">{crownIcons[index]}</span> : <span className="text-lg font-semibold text-gray-500 mx-2 mr-4">#{index + 1}</span>}
                <div>
                  <h4 className="text-lg font-semibold mb-1">{course.courseName}</h4>
                  <p className="text-gray-700">{t('statisticManagement.registrations')}: {course.enrollmentCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top khóa học có doanh thu cao */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-center mb-4">{t('statisticManagement.topEarningCourses')}</h3>
          <div className="space-y-4">
            {topEarningCourses.map((course, index) => (
              <div key={index} className={`p-4 border rounded-lg shadow flex items-center ${index < 3 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                {index < 3 ? <span className="text-3xl mr-2">{crownIcons[index]}</span> : <span className="text-lg font-semibold text-gray-500 mx-2 mr-4">#{index + 1}</span>}
                <div>
                  <h4 className="text-lg font-semibold mb-1">{course.courseName}</h4>
                  <p className="text-gray-700">{t('statisticManagement.revenue')}: {course.totalEarnings.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-center mb-4">{t('statisticManagement.topEarningTeachers')}</h3>
          <div className="space-y-4">
            {topEarningTeachers.map((teacher, index) => (
              <div key={index} className={`p-4 border rounded-lg shadow flex items-center ${index < 3 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                {index < 3 ? <span className="text-3xl mr-2">{crownIcons[index]}</span> : <span className="text-lg font-semibold text-gray-500 mx-2 mr-4">#{index + 1}</span>}
                <div>
                  <h4 className="text-lg font-semibold mb-1">{teacher.teacherName}</h4>
                  <p className="text-gray-700">{t('statisticManagement.revenue')}: {teacher.totalEarnings.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatisticsPage
