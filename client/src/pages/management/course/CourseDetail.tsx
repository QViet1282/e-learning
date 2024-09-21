/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: COURSEPAGE
   ========================================================================== */
// AdminPage.tsx
import React, { useState } from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Button, Box, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useLocation } from 'react-router-dom'
import Curriculum from './Curriculum'

export default function CourseDetailPage (): JSX.Element {
  const location = useLocation()
  const { courseId, courseData } = location.state || {}
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const renderContent = (content: string | null): JSX.Element | null => {
    switch (content) {
      case 'Học viên mục tiêu':
        return <Typography>Đây là phần dành cho học viên mục tiêu.</Typography>
      case 'Cấu trúc khóa học':
        return <Typography>Đây là cấu trúc của khóa học.</Typography>
      case 'Thiết lập studio và tạo video thử nghiệm':
        return <Typography>Hướng dẫn thiết lập studio và quay video thử nghiệm.</Typography>
      case 'Quay phim & chỉnh sửa':
        return <Typography>Phần quay phim và chỉnh sửa.</Typography>
      case 'Curriculum':
        return <Typography><Curriculum courseId={courseId}/></Typography>
      case 'Phụ đề (tùy chọn)':
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
  console.log('courseData(DetailPage)', courseData)
  return (
    <div className='grid md:grid-cols-5 grid-cols-1 gap-4 p-4'>
      <Box className='col-span-1'>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Tổng quan khóa học của bạn</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="outlined" onClick={() => setSelectedContent('Học viên mục tiêu')}>Học viên mục tiêu</Button>
              <Button variant="outlined" onClick={() => setSelectedContent('Cấu trúc khóa học')}>Cấu trúc khóa học</Button>
              <Button variant="outlined" onClick={() => setSelectedContent('Thiết lập studio và tạo video thử nghiệm')}>Thiết lập studio và tạo video thử nghiệm</Button>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Tạo nội dung của bạn</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="outlined" onClick={() => setSelectedContent('Quay phim & chỉnh sửa')}>Quay phim & chỉnh sửa</Button>
              <Button variant="outlined" onClick={() => setSelectedContent('Curriculum')}>Curriculum</Button>
              <Button variant="outlined" onClick={() => setSelectedContent('Phụ đề (tùy chọn)')}>Phụ đề (tùy chọn)</Button>
              <Button variant="outlined" onClick={() => setSelectedContent('Khả năng truy cập (tùy chọn)')}>Khả năng truy cập (tùy chọn)</Button>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Xuất bản khóa học của bạn</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="outlined" onClick={() => setSelectedContent('Trang tổng quan khóa học')}>Trang tổng quan khóa học</Button>
              <Button variant="outlined" onClick={() => setSelectedContent('Định giá')}>Định giá</Button>
              <Button variant="outlined" onClick={() => setSelectedContent('Khuyến mại')}>Khuyến mại</Button>
              <Button variant="outlined" onClick={() => setSelectedContent('Tin nhắn khóa học')}>Tin nhắn khóa học</Button>
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
