/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useState, useEffect, ChangeEvent } from 'react'
import LineChart from './component/LineChart'
import StatisticsCards from './component/StatisticsCards'
import { CategoryCourse, Course } from 'api/get/get.interface'
import { getAllCategoryCourse, getAllCourseByTeacher, getOverviewStatisticsByTeacher, getPendingRevenue } from 'api/get/get.api'
import { useNavigate } from 'react-router-dom'
import ROUTES from 'routes/constant'
import { ExpandMore, ExpandLess, Close, AddCircleOutline } from '@mui/icons-material'
import { newCourse } from 'api/post/post.interface'
import { IconButton, Modal } from '@mui/material'
import { createCourse } from 'api/post/post.api'
import LecturerRevenue from './component/LecturerRevenue'
import { toast } from 'react-toastify'
import courseDefault from '../../assets/images/default/course_default.png'
import { useTranslation } from 'react-i18next'

const LecturerDashboard = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const searchTitle = t('lectureDashboard.search_course')
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [selectedYearTop, setSelectedYearTop] = useState<number>(currentYear)
  const [selectedMonthTop, setSelectedMonthTop] = useState<number>(currentMonth)
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [courseCategories, setCourseCategories] = useState<CategoryCourse[]>([])
  const [newCourse, setNewCourse] = useState<newCourse>({
    categoryCourseId: 0,
    name: ''
  })
  const [pendingRevenue, setPendingRevenue] = useState<number>(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [teacherStats, setTeacherStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    averageRating: 0,
    totalReviews: 0,
    totalPublishedCourses: 0,
    totalEnrollments: 0
  })

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

  const fetchCourseCategories = async (): Promise<void> => {
    try {
      const response = await getAllCategoryCourse()
      setCourseCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPendingRevenue = async (): Promise<void> => {
    try {
      const response = await getPendingRevenue()
      setPendingRevenue(Number(response.data.pendingRevenue))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    void fetchStatistics()
    void fetchCourseCategories()
    void fetchPendingRevenue()
  }, [])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setNewCourse({ ...newCourse, [name]: value })
  }

  // Update selectedYearTop and selectedMonthTop when the year/month is changed
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = e.target.value ? Number(e.target.value) : currentYear
    setSelectedYearTop(selectedYear)
    if (!selectedYear) setSelectedMonthTop(currentMonth)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = e.target.value ? Number(e.target.value) : currentMonth
    setSelectedMonthTop(selectedMonth)
  }

  const fetchCourses = async () => {
    try {
      const response = await getAllCourseByTeacher({})
      setCourses(response.data)
      setFilteredCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  useEffect(() => {
    void fetchCourses()
  }, [])

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredCourses(courses)
    } else {
      setFilteredCourses(
        courses.filter(course => course.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
  }, [searchQuery, courses])

  const handleCreateCourseModalToggle = () => {
    setIsCreateCourseModalOpen(!isCreateCourseModalOpen)
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleSave = async (): Promise<void> => {
    if (newCourse.name.length < 12) {
      toast.error('Tên khóa học ít nhất 12 ký tự')
      return
    }
    if (newCourse.categoryCourseId === 0) {
      toast.error('Vui lòng chọn một danh mục hợp lệ')
      return
    }
    try {
      const response = await createCourse(newCourse)
      console.log('Course Data:', newCourse)
      setIsCreateCourseModalOpen(false)
      void fetchCourses()
      navigate(ROUTES.detailCourse, {
        state: { courseId: response.data.id }
      })
    } catch (error) {
      console.error('Error creating course:', error)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white border-x-2">
      <div className="w-full bg-white md:p-8 p-1">
        <h1 className="text-2xl font-bold md:mb-8 text-center">{t('lectureDashboard.lecturer_dashboard')}</h1>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-3/5 md:pr-4 mb-4 md:mb-0">
            <LecturerRevenue totalRevenue={teacherStats.totalRevenue} pendingRevenue={pendingRevenue} />
          </div>

          <div className="w-full md:w-2/5">
            <StatisticsCards
              totalRevenue={teacherStats.totalRevenue}
              totalEnrollments={teacherStats.totalEnrollments}
              totalStudents={teacherStats.totalStudents}
              averageRating={teacherStats.averageRating}
              totalReviews={teacherStats.totalReviews}
              totalPublishedCourses={teacherStats.totalPublishedCourses}
            />
          </div>
        </div>

        <div
          onClick={handleToggleExpand}
          className="flex items-center justify-center w-full p-4 rounded cursor-pointer transition-all duration-300"
        >
          <span className="font-semi text-gray-400">{t('lectureDashboard.view_chart')}</span>
          {isExpanded
            ? (
              <ExpandLess className="w-6 h-6 text-gray-400" />
              )
            : (
              <ExpandMore className="w-6 h-6 text-gray-400" />
              )}
        </div>

        {/* Phần mở rộng */}
        {isExpanded && (
          <div className="shadow-lg rounded-lg transition-all duration-500 transform scale-100 opacity-100 mb-2">
            <h2 className="text-xl font-semibold mb-2">{t('lectureDashboard.revenue_and_enrollment_statistics')}</h2>

            {/* Bộ lọc năm và tháng */}
            <div className="flex items-center justify-center mb-4">
              <label className="mr-4 font-semibold">{t('lectureDashboard.select_year')}:</label>
              <select
                value={selectedYearTop}
                onChange={handleYearChange}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {[2024, 2023, 2022].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {selectedYearTop && (
                <>
                  <label className="ml-6 mr-4 font-semibold">{t('lectureDashboard.select_month')}:</label>
                  <select
                    value={selectedMonthTop ?? undefined}
                    onChange={handleMonthChange}
                    className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value={undefined}>1 - 12</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {`${i + 1}`}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div>
              <LineChart
                type={selectedMonthTop ? 'day' : 'month'}
                year={selectedYearTop}
                month={selectedMonthTop}
              />
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">{t('lectureDashboard.course_list')}</h2>

        <div className="flex items-center justify-between mb-8 md:space-x-2 space-x-1 flex-wrap gap-2">
          <input
            type="text"
            placeholder={searchTitle}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="p-2 border rounded md:w-1/2 w-full focus:outline-none"
          />
          <button
            onClick={handleCreateCourseModalToggle}
            className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-1"
          >
            <AddCircleOutline className="" /><p>{t('lectureDashboard.create_new_course')}</p>
          </button>
        </div>

        {/* Danh sách khóa học */}
        <div className="w-full">
          {filteredCourses.length > 0
            ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredCourses.map(course => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow-md p-4 flex items-center border border-gray-300 hover:shadow-lg group"
                    onClick={() => navigate(ROUTES.detailCourse, { state: { courseId: course.id } })}
                  >
                    <img
                      src={course.locationPath ?? courseDefault}
                      alt={course.name}
                      className="w-48 h-24 object-cover rounded mr-4 group-hover:scale-105"
                    />
                    <div>
                      <h3 className="text-lg font-semibold group-hover:scale-105">{course.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
              )
            : (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500 text-lg">{t('lectureDashboard.no_courses_found')}</p>
              </div>
              )}
        </div>
      </div>

      {/* Modal tạo khóa học */}
      <Modal open={isCreateCourseModalOpen} onClose={() => setIsCreateCourseModalOpen(false)}>
        <div className="flex items-center justify-center min-h-screen p-2">
          <div className="bg-white w-96 p-6 rounded-md shadow-lg">
            <div className='flex items-center justify-between mb-4'>
              <h2 className="text-xl font-semibold">{t('lectureDashboard.add_new_course')}</h2>
              <IconButton onClick={() => setIsCreateCourseModalOpen(false)}>
                <Close />
              </IconButton>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              {t('lectureDashboard.course_name')}
            </label>
            <input
              type="text"
              name="name"
              value={newCourse.name}
              onChange={handleInputChange}
              className="w-full h-9 px-2 mt-1 border border-gray-300 rounded-md focus:outline-none"
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('lectureDashboard.category')}
              </label>
              <select
                name="categoryCourseId"
                value={newCourse.categoryCourseId}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="0" disabled hidden>
                  {t('lectureDashboard.select_category')}
                </option>
                {courseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => {
                handleSave().catch((error) => {
                  console.error('Save failed:', error)
                })
              }} className='bg-teal-300 hover:bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 active:scale-95'>
                {t('lectureDashboard.save')}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default LecturerDashboard
