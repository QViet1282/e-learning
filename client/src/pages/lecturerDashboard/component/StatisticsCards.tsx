/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import { Money, People, Star, School } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

interface StatisticsCardsProps {
  totalRevenue?: number
  totalEnrollments?: number
  totalStudents: number
  averageRating: number
  totalReviews: number
  totalPublishedCourses: number
}

const StatisticsCards = ({
  totalRevenue = 0,
  totalEnrollments = 0,
  totalStudents = 0,
  averageRating = 0,
  totalReviews = 0,
  totalPublishedCourses = 0
}: StatisticsCardsProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Doanh thu */}
      {/* <div className="bg-blue-100 p-3 rounded-lg flex items-center shadow-md w-full hover:shadow-xl">
        <div className="bg-blue-200 p-4 rounded-full mr-4">
          <Money className="text-blue-600" fontSize="large" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-blue-700">{t('statisticsCards.total_revenue')}</h2>
          <p className="text-3xl text-blue-600 font-bold">
            {totalRevenue.toLocaleString()}₫
          </p>
          <p className="text-gray-600">({totalEnrollments} lượt đăng kí)</p>
        </div>
      </div> */}

      {/* Số học viên */}
      <div className="bg-green-100 p-3 rounded-lg flex items-center shadow-md w-full hover:shadow-xl">
        <div className="bg-green-200 p-4 rounded-full mr-4">
          <People className="text-green-600" fontSize="large" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-green-700">{t('lectureDashboard.students')}</h2>
          <p className="text-3xl text-green-600 font-bold">{totalStudents}</p>
        </div>
      </div>

      {/* Trung bình đánh giá */}
      <div className="bg-yellow-100 p-3 rounded-lg flex items-center shadow-md w-full hover:shadow-xl">
        <div className="bg-yellow-200 p-4 rounded-full mr-4">
          <Star className="text-yellow-600" fontSize="large" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-yellow-700">{t('lectureDashboard.average_rating_text')}</h2>
          <div className="flex-row flex items-end">
            <p className="text-3xl text-yellow-600 font-bold">{averageRating} ⭐</p>
            <p className="text-gray-600">({totalReviews} {t('lectureDashboard.reviews')})</p>
          </div>
        </div>
      </div>

      {/* Khóa học mở bán */}
      <div className="bg-purple-100 p-3 rounded-lg flex items-center shadow-md w-full hover:shadow-xl">
        <div className="bg-purple-200 p-4 rounded-full mr-4">
          <School className="text-purple-600" fontSize="large" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-purple-700">{t('lectureDashboard.published_courses')}</h2>
          <p className="text-3xl text-purple-600 font-bold">{totalPublishedCourses}</p>
        </div>
      </div>
    </div>
  )
}

export default StatisticsCards
