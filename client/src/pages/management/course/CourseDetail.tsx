/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: COURSEPAGE
   ========================================================================== */
import React, { useEffect, useState } from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useLocation } from 'react-router-dom'
import Curriculum from './Curriculum'
import CourseOverview from './Overview'
import { Course } from 'api/get/get.interface'
import { getCourseById } from 'api/get/get.api'
import PricingAndPublishing from './PricingAndPublishing'
import StudentList from './StudentList'
import DoExamList from './DoExamList'
import TargetStudents from './TargetStudents'
import Notification from './Notification'
import Statistics from './Statistics'

export default function CourseDetailPage (): JSX.Element {
  const location = useLocation()
  const { courseId } = location.state || {}
  const [course, setCourse] = useState<Course | null>(null)
  const [isManagement, setIsManagement] = useState<boolean>(true)
  const [selectedContent, setSelectedContent] = useState<string>(
    sessionStorage.getItem('selectedContent') || 'Tổng quan khóa học'
  )

  useEffect(() => {
    sessionStorage.setItem('selectedContent', selectedContent)
  }, [selectedContent])

  useEffect(() => {
    void fetchCourse()
  }, [courseId])

  useEffect(() => {
    const currentPath = location.pathname

    return () => {
      const newPath = window.location.pathname
      if (currentPath !== newPath) {
        sessionStorage.removeItem('selectedContent')
      }
    }
  }, [location.pathname])

  const fetchCourse = async (): Promise<void> => {
    try {
      const response = await getCourseById(courseId)
      const fetchedCourse = response.data

      setCourse(fetchedCourse)
      setIsManagement(Number(fetchedCourse.status) > 1)
    } catch (error) {
      console.error('Error fetching course:', error)
    }
  }

  const handleContentSelect = (content: string) => {
    setSelectedContent(content)
  }

  const renderContent = (content: string | null): JSX.Element | null => {
    switch (content) {
      case 'Học viên mục tiêu':
        return <TargetStudents courseId={course?.id} description={course?.description} fetchCourse={fetchCourse} prepare={course?.prepare} />
      case 'Tổng quan khóa học':
        return <CourseOverview
          courseId={course?.id}
          categoryCourseId={course?.categoryCourseId}
          name={course?.name}
          summary={course?.summary}
          locationPath={course?.locationPath}
          videoLocationPath={course?.videoLocationPath}
          fetchCourse={fetchCourse}
        />
      case 'Chương trình giảng dạy':
        return <Curriculum courseId={courseId} courseStatus={course?.status ?? 0} />
      case 'Định giá & Xuất bản':
        return <PricingAndPublishing
          courseId={course?.id}
          status={course?.status}
          price={course?.price}
          startDateRegister={course?.startDate}
          endDateRegister={course?.endDate}
          assignedBy={course?.assignedBy}
          fetchCourse={fetchCourse}
        />
      case 'Danh sách học viên':
        return <StudentList courseId={course?.id} />
      case 'Kết quả các bài trắc nghiệm':
        return <DoExamList courseId={courseId} />
      case 'Thông báo':
        return <Notification courseId={courseId} />
      case 'Thống kê':
        return <Statistics courseId={courseId} />
      default:
        return <CourseOverview
          courseId={course?.id}
          categoryCourseId={course?.categoryCourseId}
          name={course?.name}
          summary={course?.summary}
          locationPath={course?.locationPath}
          fetchCourse={fetchCourse}
        />
    }
  }

  console.log('courseId(DetailPage)', courseId)
  console.log('isMa', isManagement)
  return (
    <div className='grid md:grid-cols-5 grid-cols-1 gap-6 p-4 bg-white border-x-2'>
      <Box className='col-span-1 '>
        <Accordion defaultExpanded sx={{ backgroundColor: 'rgb(241, 245, 249)' }} className='shadow-xl'>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div className='font-bold text-lg'>Nội dung khóa học</div>
          </AccordionSummary>
          <AccordionDetails>
            <div className='flex flex-col gap-4'>
              <button className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none" onClick={() => handleContentSelect('Tổng quan khóa học')}>
                Tổng quan khóa học
              </button>
              <button className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none" onClick={() => handleContentSelect('Học viên mục tiêu')}>
                Học viên mục tiêu
              </button>

              <button className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none" onClick={() => handleContentSelect('Chương trình giảng dạy')}>
                Chương trình giảng dạy
              </button>

              <button className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none" onClick={() => handleContentSelect('Định giá & Xuất bản')}>
                Định giá & Xuất bản
              </button>

            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded sx={{ backgroundColor: 'rgb(241, 245, 249)' }} className='shadow-xl'>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div className='font-bold text-lg'>Quản lý khóa học</div>
          </AccordionSummary>
          <AccordionDetails >
            <Box display="flex" flexDirection="column" gap={2} >
              <button
                disabled={!isManagement}
                className={`rounded py-2 w-full shadow focus:outline-none 
    ${isManagement ? 'bg-white hover:bg-teal-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'}`}
                onClick={() => handleContentSelect('Danh sách học viên')}
              >
                Danh sách học viên
              </button>
              <button
                disabled={!isManagement}
                className={`rounded py-2 w-full shadow focus:outline-none 
    ${isManagement ? 'bg-white hover:bg-teal-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'}`}
                onClick={() => handleContentSelect('Kết quả các bài trắc nghiệm')}
              >
                Kết quả các bài trắc nghiệm
              </button>
              <button
                disabled={!isManagement}
                className={`rounded py-2 w-full shadow focus:outline-none 
    ${isManagement ? 'bg-white hover:bg-teal-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'}`}
                onClick={() => handleContentSelect('Thông báo')}
              >
                Thông báo
              </button>
              <button
                disabled={!isManagement}
                className={`rounded py-2 w-full shadow focus:outline-none 
    ${isManagement ? 'bg-white hover:bg-teal-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'}`}
                onClick={() => handleContentSelect('Thống kê')}
              >
                Thống kê
              </button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box className='md:col-span-4 col-span-1'>
        {/* <Button variant="contained" color="primary" className='mt-4'>
          Gửi đi để xem xét
        </Button> */}
        {selectedContent && (
          <Box mt={0.7}>
            {renderContent(selectedContent)}
          </Box>
        )}
      </Box>
    </div>
  )
}
