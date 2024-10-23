/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import React from 'react'
import { Course } from 'api/get/get.interface'

interface CourseCardProps {
  course: Course
  category: string
  onClick: () => void
}

const statusMap: Record<number, string> = {
  404: 'Không xác định',
  0: 'Đang đăng kí',
  1: 'Chưa bắt đầu',
  2: 'Đang diễn ra',
  3: 'Đã hoàn thành',
  4: 'Bị hủy'
}

const CourseCard: React.FC<CourseCardProps> = React.memo(({ course, category, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-2xl transition-shadow"
      onClick={onClick}
    >
      {(course.locationPath != null) && (
        <img
          src={course.locationPath}
          alt={course.name}
          className="mt-2 w-full h-40 object-fill rounded"
        />
      )}

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
          <span className="font-bold">Giá:</span> VNĐ {course.price}
        </p>
      </div>
    </div>
  )
})

export default CourseCard
