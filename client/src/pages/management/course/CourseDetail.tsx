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

export default function CourseDetailPage (): JSX.Element {
  const location = useLocation()
  const { courseId } = location.state || {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
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
        return <Typography>Đây là phần dành cho học viên mục tiêu.</Typography>
      case 'Cấu trúc khóa học':
        return <Typography>Đây là cấu trúc của khóa học.</Typography>
      case 'Thiết lập studio và tạo video thử nghiệm':
        return <Typography>Hướng dẫn thiết lập studio và quay video thử nghiệm.</Typography>
      case 'Tổng quan khóa học':
        return <CourseOverview
          courseId={course?.id}
          categoryCourseId={course?.categoryCourseId}
          name={course?.name}
          summary={course?.summary}
          description={course?.description}
          locationPath={course?.locationPath}
          prepare={course?.prepare}
          fetchCourse={fetchCourse}
          />
      case 'Chương trình giảng dạy':
        return <Curriculum courseId={courseId} />
      case 'Định giá & Xuất bản':
        return <Typography>Thêm phụ đề vào khóa học.</Typography>
      case 'Khả năng truy cập (tùy chọn)':
        return <Typography>Thiết lập khả năng truy cập cho khóa học.</Typography>
      case 'Trang tổng quan khóa học':
        return <Typography>Trang tổng quan của khóa học.</Typography>
      case 'Định giá':
        return <Typography>Thiết lập giá cho khóa học của bạn.</Typography>
      case 'Khuyến mại':
        return <Typography>Chi tiết về các chương trình khuyến mại.</Typography>
      case 'Tin nhắn khóa học':
        return <Typography>Tin nhắn gửi đến học viên.</Typography>
      default:
        return null
    }
  }

  console.log('courseId(DetailPage)', courseId)
  return (
    <div className='grid md:grid-cols-5 grid-cols-1 gap-4 p-4'>
      <Box className='col-span-1'>
        <Accordion defaultExpanded sx={{ backgroundColor: 'rgb(245, 245, 245)' }} >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Nội dung khóa học</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className='flex flex-col gap-4'>
              <button
                className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none"
                onClick={() => setSelectedContent('Tổng quan khóa học')}>
                Tổng quan khóa học
              </button>

              <button
                className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none"
                onClick={() => setSelectedContent('Chương trình giảng dạy')}>
                Chương trình giảng dạy
              </button>

              <button
                className="bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none"
                onClick={() => setSelectedContent('Định giá & Xuất bản')}>
                Định giá & Xuất bản
              </button>

            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded sx={{ backgroundColor: 'rgb(245, 245, 245)' }} >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Quản lý khóa học</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <button className='bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none' onClick={() => setSelectedContent('Danh sách học viên')}>Danh sách học viên</button>
              <button className='bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none' onClick={() => setSelectedContent('Định giá')}>Định giá</button>
              <button className='bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none' onClick={() => setSelectedContent('Khuyến mại')}>Khuyến mại</button>
              <button className='bg-white rounded py-2 w-full shadow hover:bg-teal-200 focus:outline-none' onClick={() => setSelectedContent('Tin nhắn khóa học')}>Tin nhắn khóa học</button>
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
