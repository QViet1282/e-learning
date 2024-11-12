/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react'
import { IconButton, Modal } from '@mui/material'
import { useState, useEffect, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTES from 'routes/constant'
import { getAllCategoryCourse, getAllCourse } from 'api/get/get.api'
import { createCourse } from 'api/post/post.api'
import { newCourse as NewCourseInterface } from 'api/post/post.interface'
import { CategoryCourse, Course, GetAllCourseParams } from 'api/get/get.interface'
import CourseCard from './components/CourseCard'
import Pagination from './components/Pagination'
import { Close } from '@mui/icons-material'

const priceRanges = [
  { label: 'Min-Max Price', min: undefined, max: undefined },
  { label: '0 - 500.000 vnđ', min: 0, max: 500000 },
  { label: '500.000 - 1.000.000 vnđ', min: 500000, max: 1000000 },
  { label: '1.000.000 - 2.000.000 vnđ', min: 1000000, max: 2000000 }
  // Thêm nhiều tùy chọn nếu cần
]

const durationRanges = [
  { label: 'Min-Max Duration', min: undefined, max: undefined },
  { label: '0 - 100 min', min: 0, max: 100 },
  { label: '100 - 200 min', min: 100, max: 200 },
  { label: '200 - 300 min', min: 200, max: 300 }
]

const CourseManagementPage = (): JSX.Element => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [open, setOpen] = useState(false)
  const [courseCategories, setCourseCategories] = useState<CategoryCourse[]>([])
  const [newCourse, setNewCourse] = useState<NewCourseInterface>({
    categoryCourseId: 0,
    name: ''
  })
  const [totalPages, setTotalPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit] = useState<number>(12)
  const [categoriesMap, setCategoriesMap] = useState<Record<number, string>>({})

  // Các giá trị lọc
  const [selectedCategory, setSelectedCategory] = useState<number>()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<{ min: number | undefined, max: number | undefined }>({ min: undefined, max: undefined })
  const [durationRange, setDurationRange] = useState<{ min: number | undefined, max: number | undefined }>({ min: undefined, max: undefined })
  const [searchTerm, setSearchTerm] = useState<string>()

  useEffect(() => {
    void fetchCourseCategories()
  }, [])

  useEffect(() => {
    void fetchCourses()
  }, [currentPage])

  const fetchCourses = async (): Promise<void> => {
    try {
      const params: GetAllCourseParams = {
        page: currentPage,
        limit,
        categoryCourseId: selectedCategory !== 0 ? selectedCategory : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priceMin: priceRange.min ?? undefined,
        priceMax: priceRange.max ?? undefined,
        durationMin: durationRange.min ?? undefined,
        durationMax: durationRange.max ?? undefined,
        name: searchTerm ?? undefined
      }
      const response = await getAllCourse(params)
      setCourses(response.data.courses)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchCourseCategories = async (): Promise<void> => {
    try {
      const response = await getAllCategoryCourse()
      setCourseCategories(response.data)
      const newCategoriesMap = response.data.reduce((map: Record<number, string>, item: { id: number, name: string }) => {
        map[item.id] = item.name
        return map
      }, {})
      setCategoriesMap(newCategoriesMap)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setNewCourse({ ...newCourse, [name]: value })
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
      setOpen(false)
      void fetchCourses() // Refresh the course list after creating a new course
      navigate(ROUTES.detailCourse, {
        state: { courseId: response.data.id }
      })
    } catch (error) {
      console.error('Error creating course:', error)
    }
  }

  const handleRangeChange = (e: ChangeEvent<HTMLSelectElement>, type: 'price' | 'duration') => {
    const selectedValue = e.target.value
    const selectedRange = type === 'price' ? priceRanges.find(range => range.label === selectedValue) : durationRanges.find(range => range.label === selectedValue)

    if (selectedRange != null) {
      if (type === 'price') {
        setPriceRange({ min: selectedRange.min, max: selectedRange.max })
      } else {
        setDurationRange({ min: selectedRange.min, max: selectedRange.max })
      }
    }
  }

  // Thực hiện tìm kiếm
  const handleSearch = () => {
    // eslint-disable-next-line no-void
    currentPage === 1 ? void fetchCourses() : setCurrentPage(1)
  }

  return (
    <div className="ml-0 md:ml-14 py-8 md:px-8 px-2 bg-slate-100">
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 mb-8">
        Course Management
      </h2>
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          {/* Select for price range */}
          <select
            onChange={(e) => handleRangeChange(e, 'price')}
            className="border border-gray-300 rounded-md h-12 md:w-52 w-full  items-center px-2"
          >
            {/* <option value="">Min-Max Price</option> */}
            {priceRanges.map((range, index) => (
              <option key={index} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Dropdown cho khoảng thời gian */}
          <select
            onChange={(e) => handleRangeChange(e, 'duration')}
            className="border border-gray-300 rounded-md h-12 w-full md:w-44 items-center px-2"
          >
            {/* <option value="">Min-Max Duration (min)</option> */}
            {durationRanges.map((range, index) => (
              <option key={index} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            className="border border-gray-300 rounded-md h-12 w-full md:w-52 items-center px-2"
          >
            <option value={0}>All Courses</option>
            {courseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md h-12 w-full md:w-52 items-center px-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <input
            placeholder="Search by course name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-72 h-12 w-full bg-white border border-gray-300 rounded-md items-center px-2"
          />
          <button
            className="bg-teal-600 w-1/3 md:w-28 h-12 font-sans text-white font-bold rounded hover:bg-teal-500 items-center justify-center flex"
            onClick={handleSearch}
          >
            Tìm kiếm
          </button>

          <button
            className="bg-teal-600 w-1/3 md:w-28 h-12 font-sans text-white font-bold rounded hover:bg-teal-500 items-center justify-center flex"
            onClick={() => setOpen(true)}
          >
            Add Course
          </button>
        </div>

        <div className="w-full min-h-96">
          {courses.length > 0
            ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                  category={categoriesMap[course.categoryCourseId] || 'Unknown'}
                  onClick={() => navigate(ROUTES.detailCourse, { state: { courseId: course.id } })}
                />
              ))}
            </div>
              )
            : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-500 text-lg">Không có khóa học nào được tìm thấy.</p>
            </div>
              )}
        </div>

        {/* Phân trang */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex items-center justify-center min-h-screen p-2">
          <div className="bg-white w-96 p-6 rounded-md shadow-lg">
            <div className='flex items-center justify-between mb-4'>
              <h2 className="text-xl font-semibold">Add New Course</h2>
              <IconButton onClick={() => setOpen(false)}>
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

export default CourseManagementPage
