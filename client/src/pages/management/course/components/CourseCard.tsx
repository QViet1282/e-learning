/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import React from 'react'
import { Course } from 'api/get/get.interface'
import courseDefault from '../../../../assets/images/default/course_default.png'
import { useTranslation } from 'react-i18next'

interface CourseCardProps {
  course: Course
  category: string
  onClick: () => void
}

const CourseCard: React.FC<CourseCardProps> = React.memo(({ course, category, onClick }) => {
  const { t } = useTranslation()
  const statusMap: Record<number, string> = {
    0: t('courseManagement.unpublished'),
    1: t('courseManagement.publishRequest'),
    2: t('courseManagement.published'),
    3: t('courseManagement.publishedLimited'),
    4: t('courseManagement.private'),
    5: t('courseManagement.newContentRequest'),
    6: t('courseManagement.newContentRequest'),
    7: t('courseManagement.newContentRequest')
  }
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-2xl transition-shadow"
      onClick={onClick}
    >
      <img
        src={course.locationPath ?? courseDefault}
        alt={course.name}
        className="mt-2 w-full h-40 object-fill rounded"
      />

      <div className="mt-4">
        <h3 className="text-lg font-semibold">{course.name}</h3>
        {/* <p className="mt-2 text-sm text-gray-500">
          <span className="font-bold">ID:</span> {course.id}
        </p> */}
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-bold">{t('courseManagement.courseCategory')}:</span> {category}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-bold">{t('courseManagement.courseDuration')}:</span> {course.durationInMinute} phút
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-bold">{t('courseManagement.courseStatus')}:</span> {statusMap[(course.status != null) ? course.status : 404]}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-bold">{t('courseManagement.coursePrice')}:</span> {Number(course.price).toLocaleString()} VNĐ
        </p>
      </div>
    </div>
  )
})

export default CourseCard
