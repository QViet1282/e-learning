/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { getEnrollmentUserByCourseId } from 'api/get/get.api'
import { IconButton } from '@mui/material'
import { Refresh } from '@mui/icons-material'

interface StudentListProps {
  courseId?: number
}

interface Student {
  id: number
  avatar: string
  firstName: string
  lastName: string
  email: string
  enrollmentDate: Date
}

const StudentList: React.FC<StudentListProps> = ({ courseId }) => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalStudents, setTotalStudents] = useState(0)

  const fetchStudents = async (page: number, search: string) => {
    setLoading(true)
    const response = await getEnrollmentUserByCourseId({ courseId, page, limit: 10, search })
    const data = await response.data
    setStudents(data.users)
    setTotalPages(data.totalPages)
    setTotalStudents(data.totalItems)
    setLoading(false)
  }

  useEffect(() => {
    void fetchStudents(page, searchQuery)
  }, [page])

  const handleSearch = (): void => {
    void fetchStudents(page, searchQuery)
    console.log('Tìm kiếm học viên với từ khóa:', searchQuery)
  }

  const handleReload = () => {
    setSearchQuery('')
    void fetchStudents(page, '') // Tải lại danh sách học viên
  }

  return (
        <div className="flex flex-col w-full max-w-6xl mx-auto">
            <div className="w-full border-b-2">
                <div className="text-3xl font-bold p-2">Danh sách học viên</div>
            </div>
            <div className="w-full shadow-2xl mt-6 bg-slate-100 px-8 py-4 rounded-lg">
                {/* Phần hiển thị số lượng, nút reload, ô tìm kiếm và nút tìm */}
                <div className="flex flex-wrap justify-between items-center mb-4">
                    <div className="flex items-center">
                        <span className="text-lg mr-4">Tổng số học viên: {totalStudents}</span>
                        <IconButton onClick={handleReload} color="primary">
                            <Refresh />
                        </IconButton>
                        {/* <button onClick={handleReload} className="bg-green-500 text-white p-2 rounded">Tải lại</button> */}
                    </div>
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Tìm kiếm học viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border p-2 rounded flex-grow mr-2"
                        />
                        <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">Tìm kiếm</button>
                    </div>
                </div>

                {/* Phần danh sách học viên */}
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="flex flex-col">
                        {students.length > 0 ? (
                          students.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between border-b-2 py-4 flex-wrap"
                                >
                                    {/* Avatar và thông tin */}
                                    <div className="flex items-center">
                                        <img
                                            src={student.avatar}
                                            alt={student.firstName}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <div className="ml-4">
                                            <p className="font-bold truncate w-48">
                                                {student.firstName} {student.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate w-48">
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ngày đăng ký */}
                                    <p className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                                        {student.enrollmentDate
                                          ? `Đăng kí ${new Intl.DateTimeFormat('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            }).format(new Date(student.enrollmentDate))}`
                                          : ''}
                                    </p>
                                </div>
                          ))
                        ) : (
                            <p className="text-center py-4 text-gray-500">
                                Không có học viên nào được đăng ký.
                            </p>
                        )}
                    </div>
                )}

                {/* Phần phân trang */}
                <div className="flex justify-between mt-4">
                    <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>
  )
}

export default StudentList
