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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AddCircle, AddCircleOutline, Close, Search } from '@mui/icons-material'
import { toast } from 'react-toastify'
import Pagination from '../component/Pagination'

const priceRanges = [
  { label: 'Min-Max Price', min: undefined, max: undefined },
  { label: '0 - 500.000 vnđ', min: 0, max: 500000 },
  { label: '500.000 - 1.000.000 vnđ', min: 500000, max: 1000000 },
  { label: '1.000.000 - 2.000.000 vnđ', min: 1000000, max: 2000000 }
  // Thêm nhiều tùy chọn nếu cần
]

const durationRanges = [
  { label: 'Min-Max Duration', min: undefined, max: undefined },
  { label: 'Dưới 1 hour', min: 0, max: 59 },
  { label: '1 đến 5 hour', min: 60, max: 300 },
  { label: '5 đến 15 hour', min: 300, max: 900 },
  { label: '15 hour trở lên', min: 900, max: undefined }
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
  }, [currentPage, selectedCategory, priceRange, durationRange, statusFilter])

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
    if (newCourse.name.length < 12) {
      toast.error('Course name at least 12 characters') // trans
      return
    }
    if (newCourse.categoryCourseId === 0) {
      toast.error('Please select a valid category') // trans
      return
    }
    try {
      const response = await createCourse(newCourse)
      console.log('Course Data:', newCourse)
      setOpen(false)
      toast.success('Tạo thành công') // trans
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
    <div className="ml-0 py-8 md:px-8 px-2 bg-sky-100 border-x-2">
      <h2 className="text-4xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-teal-400 to-blue-500 mb-8">
        Course Management
      </h2>
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          {/* Select for price range */}
          <select
            onChange={(e) => handleRangeChange(e, 'price')}
            className="border-2 rounded-md h-12 md:w-52 w-full  items-center px-2"
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
            className="border-2 rounded-md h-12 w-full md:w-44 items-center px-2"
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
            className="border-2 rounded-md h-12 w-full md:w-52 items-center px-2"
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
            className="border-2 rounded-md h-12 w-full md:w-52 items-center px-2"
          >
            <option value="all">All Status</option>
            <option value={0} >Chưa xuất bản</option>
            <option value={1} >Yêu cầu xuất bản</option>
            <option value={2} >Đã xuất bản</option>
            <option value={3} >Đã xuất bản (Đăng ký giới hạn)</option>
            <option value={4} >Riêng tư</option>
            <option value={5} >Yêu cầu công khai nội dung mới</option>
            {/* <option value={6} >Yêu cầu công khai nội dung mới</option>
            <option value={7} >Yêu cầu công khai nội dung mới</option> */}
          </select>
          <input
            placeholder="Search by course name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-72 h-12 w-full bg-white border-2 rounded-md items-center px-2 focus:outline-none"
          />
          <button
            className="w-2/5 md:w-12 h-12 font-sans bg-white rounded-md border-2 items-center justify-center flex active:scale-95 hover:bg-slate-50"
            onClick={handleSearch}
          >
            <Search className="text-gray-500" />
          </button>

          <button
            className="bg-teal-300 px-4 h-12 font-sans text-white font-bold rounded hover:bg-teal-500 items-center justify-center flex gap-2 active:scale-95"
            onClick={() => setOpen(true)}
          >
            <AddCircleOutline className="" /><p>Add New Course</p>
          </button>
        </div>

        <div className="w-full">
          {courses.length > 0
            ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 gap-4">
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
              }} className='bg-teal-300 hover:bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 active:scale-95'>
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
