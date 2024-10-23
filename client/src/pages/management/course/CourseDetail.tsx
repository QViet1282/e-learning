/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: COURSEPAGE
   ========================================================================== */
import React, { useEffect, useState } from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'
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

export default function CourseDetailPage (): JSX.Element {
  const location = useLocation()
  const { courseId } = location.state || {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedContent, setSelectedContent] = useState<string>('Tổng quan khóa học')
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    void fetchCourse()
  }, [courseId])

  const fetchCourse = async (): Promise<void> => {
    try {
      const response = await getCourseById(courseId)
      setCourse(response.data)
    } catch (error) {
      console.error('Error fetching course:', error)
    }
  }
  const renderContent = (content: string | null): JSX.Element | null => {
    switch (content) {
      case 'Học viên mục tiêu':
        return <TargetStudents courseId={course?.id} description={course?.description} fetchCourse={fetchCourse} prepare={course?.prepare}/>
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
        return <Curriculum courseId={courseId} courseStatus={course?.status ?? 0}/>
      case 'Định giá & Xuất bản':
        return <PricingAndPublishing
        courseId={course?.id}
        status={course?.status}
        price={course?.price}
        startDateRegister={course?.startDate}
        endDateRegister={course?.endDate}
        fetchCourse={fetchCourse}
        />
      case 'Danh sách học viên':
        return <StudentList courseId={course?.id} />
      case 'Trang tổng quan khóa học':
        return <Typography>Trang tổng quan của khóa học.</Typography>
      case 'Kết quả các bài trắc nghiệm':
        return <DoExamList courseId={courseId} />
      case 'Khuyến mại':
        return <Typography>Chi tiết về các chương trình khuyến mại.</Typography>
      case 'Tin nhắn khóa học':
        return <Typography>Tin nhắn gửi đến học viên.</Typography>
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
  return (
    <div className='grid md:grid-cols-5 grid-cols-1 gap-6 p-4 bg-gray-100'>
      <Box className='col-span-1 '>
        <Accordion defaultExpanded sx={{ backgroundColor: 'rgb(241, 245, 249)' }} className='shadow-xl'>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div className='font-bold text-lg'>Nội dung khóa học</div>
          </AccordionSummary>
          <AccordionDetails>
            <div className='flex flex-col gap-4'>
              <button className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none" onClick={() => setSelectedContent('Tổng quan khóa học')}>
                Tổng quan khóa học
              </button>
              <button className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none" onClick={() => setSelectedContent('Học viên mục tiêu')}>
                Học viên mục tiêu
              </button>

              <button className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none" onClick={() => setSelectedContent('Chương trình giảng dạy')}>
                Chương trình giảng dạy
              </button>

              <button className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none" onClick={() => setSelectedContent('Định giá & Xuất bản')}>
                Định giá & Xuất bản
              </button>

            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded sx={{ backgroundColor: 'rgb(241, 245, 249)' }} className='shadow-xl' >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div className='font-bold text-lg'>Quản lý khóa học</div>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <button className='bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none' onClick={() => setSelectedContent('Danh sách học viên')}>Danh sách học viên</button>
              <button className='bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none' onClick={() => setSelectedContent('Kết quả các bài trắc nghiệm')}>Kết quả các bài trắc nghiệm</button>
              {/* <button className='bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none' onClick={() => setSelectedContent('Khuyến mại')}>Khuyến mại</button> */}
              {/* <button className='bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none' onClick={() => setSelectedContent('Tin nhắn khóa học')}>Tin nhắn khóa học</button> */}
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
