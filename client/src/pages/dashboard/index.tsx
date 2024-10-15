/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: DASHBOARD
   ========================================================================== */

// TODO: remove later

import { getDashboardData, saveQuestionsForExam } from 'api/post/post.api'
// Import các API `getDashboardData` và `saveQuestionsForExam` từ file `post.api`.

import React, { useCallback, useEffect, useMemo, useState } from 'react'
// Import các hook `useCallback`, `useEffect`, `useMemo`, và `useState` từ React.

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Checkbox from '@mui/material/Checkbox'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import LoadingButton from '@mui/lab/LoadingButton'
import Styled from './index.style'
import Typography from '@mui/material/Typography'
// Import các thành phần từ Material-UI như `Accordion`, `Checkbox`, `LoadingButton`, và các biểu tượng.

const Dashboard = () => {
  const [data, setData] = useState<any>(null)
  // `data` chứa dữ liệu bảng điều khiển trả về từ API.

  const [checked, setChecked] = useState<any>({})
  // `checked` là state lưu trữ các câu hỏi đã được chọn cho từng bài kiểm tra.

  const [loading, setLoading] = useState<string>('')
  // `loading` lưu trữ trạng thái khi người dùng lưu câu hỏi, giúp hiển thị trạng thái đang tải cho từng bài kiểm tra.

  const parseCheck = useCallback((examQuestions: any[]) => {
    const result: any = {}
    examQuestions.forEach((data: any) => {
      const examId = (data?.examId as string) || ''
      if (!result[examId]) {
        result[examId] = []
      }
      result[examId].push(data?.questionId)
    })
    setChecked(result)
  }, [])
  // Hàm `parseCheck` chuyển đổi dữ liệu câu hỏi đã chọn từ API thành định dạng có thể lưu trong state `checked`.

  const fetchData = useCallback(async () => {
    try {
      const response = await getDashboardData()
      // Gọi API để lấy dữ liệu bảng điều khiển.

      setData(response.data)
      // Lưu trữ dữ liệu từ API vào state `data`.

      parseCheck(response.data?.examsQuestions)
      // Gọi hàm `parseCheck` để xử lý các câu hỏi đã chọn.
    } catch (error) {
      setData(null)
      // Nếu có lỗi, đặt `data` thành `null`.
    }
  }, [parseCheck])
  // Hàm `fetchData` được gọi để lấy dữ liệu bảng điều khiển và xử lý câu hỏi đã chọn.

  useEffect(() => {
    fetchData()
  }, [])
  // `useEffect` sẽ gọi `fetchData` khi component được mount.

  const handleToggle = useCallback(
    (examId: string, questionId: string) => () => {
      const currentIndex = checked?.[examId]?.indexOf?.(questionId)
      const newChecked = { ...checked }

      if (currentIndex >= 0) {
        newChecked[examId].splice(currentIndex, 1)
      } else {
        if (!newChecked[examId]) {
          newChecked[examId] = []
        }
        newChecked[examId].push(questionId)
      }

      setChecked(newChecked)
    },
    [checked]
  )
  // Hàm `handleToggle` giúp chọn hoặc bỏ chọn câu hỏi trong một bài kiểm tra.
  // Nếu câu hỏi đã được chọn, nó sẽ bị loại bỏ, nếu chưa, nó sẽ được thêm vào danh sách đã chọn.

  const handleSaveQuestionsForExam = useCallback(
    (examId: string) => async (event: any) => {
      setLoading(examId)
      // Đặt trạng thái `loading` khi người dùng nhấn nút lưu.

      try {
        event?.stopPropagation?.()
        // Ngăn việc mở rộng accordion khi người dùng nhấn vào nút lưu.

        await saveQuestionsForExam({
          examId,
          questionIds: checked[examId]
        })
        // Gọi API để lưu danh sách câu hỏi cho bài kiểm tra.

        await fetchData()
        // Gọi lại `fetchData` để cập nhật dữ liệu sau khi lưu thành công.

        setLoading('')
        // Đặt lại trạng thái `loading` sau khi lưu xong.
      } catch (error) {
        setLoading('')
        // eslint-disable-next-line no-console
        console.log(error)
        // Nếu có lỗi, đặt lại trạng thái `loading` và in lỗi ra console.
      }
    },
    [checked, fetchData]
  )
  // Hàm `handleSaveQuestionsForExam` gọi API để lưu các câu hỏi đã chọn cho bài kiểm tra.

  const getListQuestions = useCallback(
    (examId: string) => {
      return (
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        >
          {(data?.questions || []).map((question: any) => {
            const labelId = `checkbox-list-label-${question.id}`

            return (
              <Styled.Wrap key={question.id} disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(examId, question.id)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={checked?.[examId]?.indexOf?.(question.id) >= 0}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={question.title} />
                </ListItemButton>
              </Styled.Wrap>
            )
          })}
        </List>
      )
    },
    [checked, data?.questions, handleToggle]
  )
  // Hàm `getListQuestions` trả về danh sách các câu hỏi của một bài kiểm tra và checkbox để người dùng chọn câu hỏi.

  const content = useMemo(() => {
    return (data?.exams || []).map((exam: any) => {
      return (
        <Accordion key={exam.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Styled.Summary>
              <Typography>Exam name: {exam?.name || ''}</Typography>
              <LoadingButton
                loading={exam.id === loading}
                variant="outlined"
                onClick={handleSaveQuestionsForExam(exam.id)}
              >
                Save questions for this exam
              </LoadingButton>
            </Styled.Summary>
          </AccordionSummary>
          <AccordionDetails>{getListQuestions(exam.id)}</AccordionDetails>
        </Accordion>
      )
    })
  }, [data?.exams, getListQuestions, handleSaveQuestionsForExam, loading])
  // `content` là danh sách các bài kiểm tra hiển thị dưới dạng `Accordion`, mỗi accordion sẽ chứa danh sách câu hỏi và nút "Save".

  return <Styled.Container>{content}</Styled.Container>
  // Trả về giao diện với các accordion chứa bài kiểm tra và câu hỏi.
}

export default Dashboard
// Component Dashboard hiển thị danh sách các bài kiểm tra dưới dạng accordion. Mỗi accordion bao gồm danh sách các câu hỏi và người dùng có thể chọn hoặc bỏ chọn câu hỏi bằng cách sử dụng checkbox.
// Chức năng chính:
// Gọi API để lấy dữ liệu bảng điều khiển (danh sách bài kiểm tra và câu hỏi).
// Chọn hoặc bỏ chọn câu hỏi cho từng bài kiểm tra.
// Lưu danh sách câu hỏi đã chọn cho bài kiểm tra bằng cách nhấn nút "Save".
// Hiển thị trạng thái tải (loading) khi đang lưu.
// Hook useCallback: Được sử dụng để đảm bảo các hàm như handleToggle, handleSaveQuestionsForExam, và getListQuestions không bị tái tạo khi không cần thiết.
// Hook useMemo: Được sử dụng để tối ưu hóa việc tạo danh sách nội dung (content), chỉ tái tạo khi dữ liệu bài kiểm tra hoặc trạng thái loading thay đổi.
