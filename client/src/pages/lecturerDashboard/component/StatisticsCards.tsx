/* eslint-disable @typescript-eslint/explicit-function-return-type */
// StatisticsCards.tsx
import React, { useEffect, useState } from 'react'
import { getOverviewStatisticsByTeacher } from 'api/get/get.api'
import { Money, People, Star, School } from '@mui/icons-material'

const StatisticsCards = () => {
  const [teacherStats, setTeacherStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    averageRating: 0,
    totalReviews: 0,
    totalPublishedCourses: 0,
    totalEnrollments: 0
  })

  useEffect(() => {
    // Gọi API để lấy thông tin thống kê
    const fetchStatistics = async () => {
      try {
        const response = await getOverviewStatisticsByTeacher({})
        const stats = response.data
        setTeacherStats({
          totalRevenue: stats.totalRevenue ?? 0,
          totalStudents: stats.uniqueStudents ?? 0,
          averageRating: stats.averageRating ?? 0,
          totalReviews: stats.totalRatings ?? 0,
          totalPublishedCourses: stats.totalCourses ?? 0,
          totalEnrollments: stats.totalEnrollments ?? 0
        })
      } catch (error) {
        console.error('Error fetching statistics:', error)
      }
    }

    void fetchStatistics()
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {/* Doanh thu */}
      <div className="bg-blue-100 p-6 rounded-lg flex flex-col items-center shadow-md">
        <Money className="text-blue-600" fontSize="large" />
        <h2 className="text-lg font-semibold mt-3">Doanh thu</h2>
        <p className="text-3xl text-blue-600 font-bold mt-1">{teacherStats.totalRevenue?.toLocaleString()}₫</p>
        <p className="text-gray-600">({teacherStats.totalEnrollments} lượt đăng kí)</p>
      </div>

      {/* Số học viên */}
      <div className="bg-green-100 p-6 rounded-lg flex flex-col items-center shadow-md">
        <People className="text-green-600" fontSize="large" />
        <h2 className="text-lg font-semibold mt-3">Số học viên</h2>
        <p className="text-3xl text-green-600 font-bold mt-1">{teacherStats.totalStudents}</p>
      </div>

      {/* Trung bình đánh giá */}
      <div className="bg-yellow-100 p-6 rounded-lg flex flex-col items-center shadow-md">
        <Star className="text-yellow-600" fontSize="large" />
        <h2 className="text-lg font-semibold mt-3">Trung bình đánh giá</h2>
        <p className="text-3xl text-yellow-600 font-bold mt-1">{teacherStats.averageRating} ⭐</p>
        <p className="text-gray-600">({teacherStats.totalReviews} đánh giá)</p>
      </div>

      {/* Khóa học mở bán */}
      <div className="bg-purple-100 p-6 rounded-lg flex flex-col items-center shadow-md">
        <School className="text-purple-600" fontSize="large" />
        <h2 className="text-lg font-semibold mt-3">Khóa học mở bán</h2>
        <p className="text-3xl text-purple-600 font-bold mt-1">{teacherStats.totalPublishedCourses}</p>
      </div>
    </div>
  )
}

export default StatisticsCards
