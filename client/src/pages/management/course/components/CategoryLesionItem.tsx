/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: CategoryLessionItem
   ========================================================================== */
import React, { useEffect, useState } from 'react'
import { StyledPaper, StyledTypography } from '../courseList'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { Box, IconButton, Collapse } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getLessionByCategory } from 'api/get/get.api'

interface Lesson {
  id: number
  lessionCategoryId: number
  name: string
  content: string
  description: string
  type: string
  order: number
  locationPath: string
  uploadedBy: number
  createdAt: string
  updatedAt: string
  status: number // Thêm trường status
}

interface CategoryItemProps {
  id: number
  courseId: number
  name: string
  order: number
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

const CategoryLessonItem: React.FC<CategoryItemProps> = ({ id, courseId, name, order, dragHandleProps }) => {
  const [openLessonIds, setOpenLessonIds] = useState<number[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    fetchLessons()
  }, [id])

  const handleToggle = (lessonId: number) => {
    if (openLessonIds.includes(lessonId)) {
      setOpenLessonIds(openLessonIds.filter(id => id !== lessonId))
    } else {
      setOpenLessonIds([...openLessonIds, lessonId])
    }
  }

  const fetchLessons = async () => {
    try {
      if (id) {
        const response = await getLessionByCategory(id)
        setLessons(response.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const renderLessonContent = (lesson: Lesson) => {
    switch (lesson.type) {
      case 'MP4':
        return <video src={lesson.locationPath} controls width="100%" />
      case 'PDF':
      case 'doc':
        return (
          <a href={lesson.locationPath} target="_blank" rel="noopener noreferrer">
            Xem tài liệu
          </a>
        )
      default:
        return <span>Không có file đính kèm</span>
    }
  }

  return (
    <StyledPaper key={id} elevation={3} className="p-4 flex flex-col">
      <div className="flex items-center justify-between">
        <StyledTypography variant="h6">
          Chương {order}: {name}
        </StyledTypography>
        <div {...dragHandleProps} style={{ cursor: 'grab' }}>
          <IconButton style={{ cursor: 'grab' }}>
            <DragIndicatorIcon />
          </IconButton>
        </div>
      </div>
      <Box>
        {lessons.map((lesson) => (
          <StyledPaper key={lesson.id} elevation={1} className="p-2 mb-4 ml-20">
            <div className="flex items-center justify-between">
              <StyledTypography variant="subtitle1">
                Bài giảng {lesson.order}: {lesson.name}
              </StyledTypography>
              <IconButton onClick={() => handleToggle(lesson.id)}>
                {openLessonIds.includes(lesson.id) ? <ExpandMoreIcon /> : <ExpandMoreIcon style={{ transform: 'rotate(180deg)' }} />}
              </IconButton>
            </div>
            <Collapse in={openLessonIds.includes(lesson.id)}>
              <Box borderTop={2} borderColor="#e2e8f0">
                {/* Phần hiển thị thumbnail video hoặc PDF */}
                <Box mt={2} mb={2} display="flex" justifyContent="center" alignItems="center">
                  {renderLessonContent(lesson)}
                </Box>

                {/* Phần mô tả */}
                <StyledTypography variant="h6" gutterBottom color="primary">
                  Mô tả
                </StyledTypography>
                <StyledTypography variant="body1" paragraph>
                  {lesson.description}
                </StyledTypography>

                {/* Phần nội dung */}
                <StyledTypography variant="h6" gutterBottom color="primary">
                  Nội dung
                </StyledTypography>
                <StyledTypography variant="body2" paragraph>
                  {lesson.content}
                </StyledTypography>

                {/* Trạng thái bài học */}
                <Box mt={2} display="flex" alignItems="center">
                  <StyledTypography variant="h6" color="secondary" mr={1}>
                    Trạng thái:
                  </StyledTypography>
                  <StyledTypography variant="body1" fontWeight="bold" color={lesson.status === 1 ? 'green' : 'red'}>
                    {lesson.status === 1 ? 'public' : 'private'}
                  </StyledTypography>
                </Box>
              </Box>
            </Collapse>
          </StyledPaper>
        ))}
      </Box>
    </StyledPaper>
  )
}

export default CategoryLessonItem
