/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { getEnrollmentUserByCourseId } from 'api/get/get.api'
import { IconButton, Dialog, DialogContent, DialogActions, Button } from '@mui/material'
import { Refresh, Search } from '@mui/icons-material'
import Pagination from '../component/Pagination'
import { HashLoader } from 'react-spinners'
import { useTranslation } from 'react-i18next'
import AnalysisSummary from './components/analysisSummary'

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
  processPercentage: number
}

const StudentList: React.FC<StudentListProps> = ({ courseId }) => {
  const { t } = useTranslation()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalStudents, setTotalStudents] = useState(0)

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
  }, [page, courseId])

  const handleSearch = (): void => {
    void fetchStudents(page, searchQuery)
    console.log('Tìm kiếm học viên với từ khóa:', searchQuery)
  }

  const handleReload = () => {
    setSearchQuery('')
    void fetchStudents(page, '')
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="w-full border-b-2">
        <div className="text-3xl font-bold p-2">{t('studentList.title')}</div>
      </div>
      <div className="w-full shadow-2xl mt-6 bg-gradient-to-r from-gray-50 to-gray-100 md:px-8 px-4 py-4 rounded-lg">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-lg mr-4">{t('studentList.totalStudents')} {totalStudents}</span>
            <IconButton onClick={handleReload} color="primary">
              <Refresh className='text-teal-400 hover:text-teal-300' />
            </IconButton>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder={t('studentList.searchPlaceholder').toString()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 p-2 rounded flex-grow mr-2 focus:outline-none"
            />
            <button onClick={handleSearch} className="p-2 bg-white rounded-md border-2">
              <Search className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Phần danh sách học viên */}
        {loading ? (
          <div className="flex justify-center items-center w-full min-h-96 mt-15">
            <HashLoader
              className='flex justify-center items-center w-full mt-20'
              color='#5EEAD4'
              cssOverride={{
                display: 'block',
                margin: '0 auto',
                borderColor: 'blue'
              }}
              loading
            />
          </div>
        ) : (
          <div className="flex flex-col min-h-96">
            {students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between border-b-2 p-2 md:p-4 flex-wrap bg-white rounded-lg shadow-md mb-2 cursor-pointer"
                  onClick={() => handleStudentClick(student)}
                >
                  {/* Avatar và thông tin */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={student.avatar}
                      alt={student.firstName}
                      className="w-14 h-14 rounded-full border-2 border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-lg text-gray-800 truncate max-w-xs">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">Email: {student.email}</p>
                      {/* Ngày đăng ký */}
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {student.enrollmentDate
                          ? `${t('studentList.enrollmentDateLabel')} ${new Intl.DateTimeFormat('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }).format(new Date(student.enrollmentDate))}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  {/* Tiến độ */}
                  <div className="ml-4 flex flex-col items-end">
                    <p className="text-sm text-gray-500">{t('studentList.progressLabel')}</p>
                    <div className="w-32 h-2.5 bg-gray-300 rounded-full mt-2">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${student.processPercentage}%`,
                          backgroundColor: student.processPercentage === 100 ? '#4caf50' : '#4fd1c5'
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold mt-2 text-teal-600">
                      {student.processPercentage}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 items-center justify-center flex h-96">
                {t('studentList.noStudents')}
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

      {/* Modal hiển thị chi tiết sinh viên */}
      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="lg"
        fullWidth
      >
        {/* <DialogTitle>{t('courseDetails.overview2')}</DialogTitle> */}
        <DialogContent>
          {selectedStudent && (
            <React.Fragment>
              <AnalysisSummary studentId={selectedStudent.id} courseId={courseId?.toString()} studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}/>
            </React.Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="primary">
            {t('studentList.close')}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  )
}

export default StudentList
