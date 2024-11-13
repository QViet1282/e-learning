/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useState, useEffect, ChangeEvent } from 'react'
import LineChart from './component/LineChart'
import StatisticsCards from './component/StatisticsCards'
import { CategoryCourse, Course } from 'api/get/get.interface'
import { getAllCategoryCourse, getAllCourseByTeacher } from 'api/get/get.api'
import { useNavigate } from 'react-router-dom'
import ROUTES from 'routes/constant'
import { ExpandMore, ExpandLess, Close } from '@mui/icons-material'
import { newCourse } from 'api/post/post.interface'
import { IconButton, Modal } from '@mui/material'
import { createCourse } from 'api/post/post.api'

const LecturerDashboard = () => {
  const navigate = useNavigate()
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

  useEffect(() => {
    void fetchCourseCategories()
  }, [])

  const fetchCourseCategories = async (): Promise<void> => {
    try {
      const response = await getAllCategoryCourse()
      setCourseCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setNewCourse({ ...newCourse, [name]: value })
  }

  // Trạng thái mở rộng/thu gọn
  const [isExpanded, setIsExpanded] = useState(false)

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
    if (newCourse.categoryCourseId == null) {
      alert('Please select a valid category.')
      return
    }
    if (newCourse.name.length === 0) {
      alert('Tên không được để trống')
      return
    }
    try {
      const response = await createCourse(newCourse)
      console.log('Course Data:', newCourse)
      setIsCreateCourseModalOpen(false)
      void fetchCourses() // Refresh the course list after creating a new course
      navigate(ROUTES.detailCourse, {
        state: { courseId: response.data.id }
      })
    } catch (error) {
      console.error('Error creating course:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-4/5 bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-8 text-center">Bảng điều khiển Giảng viên</h1>

        {/* Thống kê */}
        <StatisticsCards />

        {/* Nút mở rộng */}
        <div
  onClick={handleToggleExpand}
  className="flex items-center justify-center w-full p-4 rounded cursor-pointer transition-all duration-300"
>
  <span className="font-semi text-gray-400">Xem biểu đồ</span>
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
    {/* Tiêu đề biểu đồ doanh thu */}
    <h2 className="text-xl font-semibold mb-2">Thống kê Doanh thu & Lượt đăng ký</h2>

    {/* Bộ lọc năm và tháng */}
    <div className="flex items-center justify-center mb-4">
      <label className="mr-4 font-semibold">Chọn năm:</label>
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
          <label className="ml-6 mr-4 font-semibold">Chọn tháng:</label>
          <select
            value={selectedMonthTop ?? undefined}
            onChange={handleMonthChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value={undefined}>Tháng 1-12</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
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

        {/* Tiêu đề tìm kiếm và danh sách khóa học */}
        <h2 className="text-xl font-semibold mb-4">Danh sách Khóa học</h2>

        {/* Tìm kiếm khóa học */}
        <div className="flex items-center justify-between mb-8">
          <input
            type="text"
            placeholder="Tìm khóa học..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="p-2 border rounded w-1/2"
          />
          <button
            onClick={handleCreateCourseModalToggle}
            className="ml-4 p-2 bg-blue-500 text-white rounded"
          >
            Tạo khóa học mới
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
                  className="bg-white rounded-lg shadow-md p-4 flex items-center border border-gray-300"
                  onClick={() => navigate(ROUTES.detailCourse, { state: { courseId: course.id } })}
                >
                  <img
                    src={course.locationPath}
                    alt={course.name}
                    className="w-48 h-24 object-cover rounded mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{course.name}</h3>
                  </div>
                </div>
              ))}
            </div>
              )
            : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-500 text-lg">Không có khóa học nào được tìm thấy.</p>
            </div>
              )}
        </div>
      </div>

      {/* Modal tạo khóa học */}
      <Modal open={isCreateCourseModalOpen} onClose={() => setIsCreateCourseModalOpen(false)}>
      <div className="flex items-center justify-center min-h-screen p-2">
        <div className="bg-white w-96 p-6 rounded-md shadow-lg">
          <div className='flex items-center justify-between mb-4'>
            <h2 className="text-xl font-semibold">Add New Course</h2>
            <IconButton onClick={() => setIsCreateCourseModalOpen(false)}>
                  <Close />
              </IconButton>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Course Name
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
              Category
            </label>
            <select
              name="categoryCourseId"
              value={newCourse.categoryCourseId}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="0" disabled hidden>
                Select a category
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
            }} color="primary">
              Save
            </button>
          </div>
        </div>
      </div>
      </Modal>
    </div>
  )
}

export default LecturerDashboard
