/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { getExamsByCourseId } from 'api/get/get.api' // Thay đổi đường dẫn API cho phù hợp
import { IconButton } from '@mui/material'
import { Refresh, Search } from '@mui/icons-material'
import Pagination from '../component/Pagination'
import { PacmanLoader } from 'react-spinners'

interface DoExamProps {
  courseId?: number
}

interface DoExamItem {
  examName: string
  attempt: number
  overAllScore: string
  userName: string
  countQuestion: number
}

const DoExamList: React.FC<DoExamProps> = ({ courseId }) => {
  const [exams, setExams] = useState<DoExamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1) // Giả sử có ít nhất 1 trang
  const [searchQuery, setSearchQuery] = useState('')
  const [totalExams, setTotalExams] = useState(0)

  const fetchExams = async (page: number, search: string) => {
    setLoading(true)
    try {
      // Gọi API với tham số page và searchQuery
      const response = await getExamsByCourseId({ courseId, page, limit: 10, search })
      const data = await response.data

      // Cập nhật danh sách exams, tổng số bài kiểm tra và tổng số trang
      setExams(data.items) // Giả sử API trả về danh sách exams
      setTotalExams(data.totalItems) // Giả sử API trả về tổng số bài kiểm tra
      setTotalPages(data.totalPages) // Giả sử API trả về tổng số trang
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchExams(page, searchQuery)
  }, [page])

  const handleSearch = (): void => {
    setPage(1) // Đặt lại trang về 1 khi tìm kiếm
    void fetchExams(1, searchQuery) // Tìm kiếm với trang đầu tiên
    console.log('Tìm kiếm bài kiểm tra với từ khóa:', searchQuery)
  }

  const handleReload = (): void => {
    setSearchQuery('')
    setPage(1) // Đặt lại trang về 1 khi tải lại
    void fetchExams(1, '') // Tải lại danh sách bài kiểm tra
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="w-full border-b-2">
        <div className="text-3xl font-bold p-2">Danh sách bài kiểm tra</div>
      </div>
      <div className="w-full shadow-2xl mt-6 bg-gradient-to-r from-gray-50 to-gray-100 md:px-8 px-4 py-4 rounded-lg">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-lg mr-4">Tổng số bài kiểm tra: {totalExams}</span>
            <IconButton onClick={handleReload} color="primary">
              <Refresh className='text-teal-400 hover:text-teal-300'/>
            </IconButton>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm bài kiểm tra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 p-2 rounded flex-grow mr-2 focus:outline-none"
            />
            <button onClick={handleSearch} className="p-2 bg-white rounded-md border-2">
              <Search className="text-gray-500" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center w-full min-h-96 mt-15">
            <PacmanLoader
              className='flex justify-center items-center w-full mt-20'
              color='#5EEAD4'
              cssOverride={{
                display: 'block',
                margin: '0 auto',
                borderColor: 'blue'
              }}
              loading
              margin={10}
              speedMultiplier={3}
              size={40}
            />
          </div>
        ) : (
          <div className="flex flex-col min-h-96">
            {exams.length > 0 ? (
              <>
                {exams.map((exam, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b-2 p-4 flex-wrap bg-white rounded-lg shadow-md mb-2"
                  >
                    <div className="flex items-center w-full md:w-2/3">
                      <div className="">
                        <p className="font-bold text-lg truncate whitespace-normal w-full">{exam.examName}</p>
                      </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/3">
                      <p className="text-sm text-gray-500 whitespace-nowrap">Điểm: <span className="font-semibold text-gray-800">{exam.overAllScore}</span></p>
                      <p className="text-sm text-gray-500 whitespace-nowrap">Tổng số câu hỏi: <span className="font-semibold text-gray-800">{exam.countQuestion}</span></p>
                      <p className="text-sm text-gray-500 whitespace-nowrap">Lần làm bài: <span className="font-semibold text-gray-800">{exam.attempt}</span></p>
                      <p className="text-sm text-gray-500 whitespace-nowrap">Học viên: <span className="font-semibold text-gray-800">{exam.userName}</span></p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 items-center justify-center flex h-96">
                Không có bài kiểm tra nào được tìm thấy.
              </div>
            )}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default DoExamList
