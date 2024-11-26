/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import React from 'react'
import { Course } from 'api/get/get.interface'
import courseDefault from '../../../../assets/images/default/course_default.png'

interface CourseCardProps {
  course: Course
  category: string
  onClick: () => void
}

const statusMap: Record<number, string> = {
  0: 'Chưa xuất bản',
  1: 'Yêu cầu xuất bản',
  2: 'Đã xuất bản',
  3: 'Đã xuất bản (Đăng ký giới hạn)',
  4: 'Riêng tư',
  5: 'Yêu cầu công khai nội dung mới',
  6: 'Yêu cầu công khai nội dung mới',
  7: 'Yêu cầu công khai nội dung mới'
}

const CourseCard: React.FC<CourseCardProps> = React.memo(({ course, category, onClick }) => {
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
          <span className="font-bold">Danh mục:</span> {category}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-bold">Thời lượng:</span> {course.durationInMinute} phút
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-bold">Trạng thái:</span> {statusMap[(course.status != null) ? course.status : 404]}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-bold">Giá:</span> {Number(course.price).toLocaleString()} VNĐ
        </p>
      </div>
    </div>
  )
})

export default CourseCard
