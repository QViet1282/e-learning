/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/*
   ========================================================================== */
import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { getUserExamResults, getUserLessonResults, getUserExamScores, putTeacherComment, getTeacherComment } from '../../../../api/post/post.api'
import { FaStar, FaThumbsUp, FaExclamationCircle, FaFrown } from 'react-icons/fa'
import { Pagination } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { QuillEditor, QuillEditorTeacherComment } from './QuillEditor'
import { toast } from 'react-toastify'

interface ExamResult {
  examId: number
  highestScore: number | null
  passingScore: number
  maxScore: number
  result: string | null
  studyItemName: string
}

interface ExamScore {
  examId: number
  attempt: number
  totalScore: number
  studyItemName: string
}

interface LessonResult {
  lessonId: number
  lessonName: string
  status: string
}

interface AnalysisSummaryProps {
  studentId: number
  courseId: string | undefined
  studentName: string
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ studentId, courseId, studentName }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [examScores, setExamScores] = useState<ExamScore[]>([])
  const [lessonResults, setLessonResults] = useState<LessonResult[]>([])
  const [examCompletionRate, setExamCompletionRate] = useState<number>(0)
  const [lessonCompletionRate, setLessonCompletionRate] = useState<number>(0)
  const [teacherComment, setTeacherComment] = React.useState<string>('')
  const [showExamWarning, setShowExamWarning] = useState<boolean>(false)
  const [showLessonWarning, setShowLessonWarning] = useState<boolean>(false)
  // Ref cho biểu đồ đường
  const lineChartRef = useRef<HTMLDivElement>(null)
  // Thêm state cho điểm trung bình và phần trăm bài thi đã thực hiện
  const [averageExamScore, setAverageExamScore] = useState<number>(0)
  const [percentageExamsAttempted, setPercentageExamsAttempted] = useState<number>(0)

  // State cho việc chọn bài thi để hiển thị biểu đồ đường
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)

  // Pagination states for Exams
  const [currentExamPage, setCurrentExamPage] = useState(1)
  const examsPerPage = 5

  // Pagination states for Lessons
  const [currentLessonPage, setCurrentLessonPage] = useState(1)
  const lessonsPerPage = 5

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherComment = await getTeacherComment(parseInt(courseId || '0', 10), studentId)
        setTeacherComment(teacherComment.data.teacherComment)
        // Fetch Exam Results
        const examResponse = await getUserExamResults(parseInt(courseId || '0', 10), studentId)
        let exams = examResponse.data.examResults

        // Chuyển đổi highestScore, passingScore và maxScore sang số
        exams = exams.map((exam: any) => ({
          ...exam,
          highestScore: exam.highestScore !== null ? Number(exam.highestScore) : null,
          passingScore: Number(exam.passingScore),
          maxScore: Number(exam.maxScore)
        }))

        setExamResults(exams)

        // Tính tỷ lệ hoàn thành bài thi
        if (exams.length > 0) {
          const totalExams = exams.length
          const passedExams = exams.filter((exam: ExamResult) => exam.result === 'Pass').length
          setExamCompletionRate((passedExams / totalExams) * 100)

          // Tính điểm trung bình dựa trên công thức đã cung cấp
          const attemptedExams = exams.filter((exam: ExamResult) => exam.highestScore !== null)
          const totalHighestScores = attemptedExams.reduce((sum: number, exam: ExamResult) => sum + (exam.highestScore || 0), 0)
          const totalMaxScores = attemptedExams.reduce((sum: number, exam: ExamResult) => sum + (exam.maxScore || 0), 0)
          const averageScore = totalMaxScores > 0 ? (totalHighestScores / totalMaxScores) * 100 : 0
          setAverageExamScore(averageScore)

          // Tính phần trăm bài thi đã thực hiện
          const attemptedExamsCount = attemptedExams.length
          const percentageAttempted = (attemptedExamsCount / totalExams) * 100
          setPercentageExamsAttempted(percentageAttempted)

          // Hiển thị cảnh báo nếu có bài thi chưa hoàn thành hoặc không đạt
          setShowExamWarning(exams.some((exam: ExamResult) => exam.result === 'Fail' || exam.highestScore === null))
        } else {
          setExamCompletionRate(0)
          setAverageExamScore(0)
          setPercentageExamsAttempted(0)
          setShowExamWarning(false)
        }

        // Fetch Exam Scores
        const scoresResponse = await getUserExamScores(parseInt(courseId || '0', 10), studentId)
        setExamScores(scoresResponse.data.examScores)

        // Fetch Lesson Results
        const lessonResponse = await getUserLessonResults(parseInt(courseId || '0', 10), studentId)
        const lessons = lessonResponse.data.lessonResults
        setLessonResults(lessons)

        // Tính tỷ lệ hoàn thành bài học
        if (lessons.length > 0) {
          const totalLessons = lessons.length
          const completedLessons = lessons.filter((lesson: LessonResult) => lesson.status === 'Completed').length
          setLessonCompletionRate((completedLessons / totalLessons) * 100)

          // Hiển thị cảnh báo nếu có bài học chưa hoàn thành
          setShowLessonWarning(lessons.some((lesson: LessonResult) => lesson.status === 'Not Attempted'))
        } else {
          setLessonCompletionRate(0)
          setShowLessonWarning(false)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [courseId, navigate])

  // Nhóm điểm theo examId để so sánh
  const groupedScores = examScores.reduce((acc: Record<number, ExamScore[]>, score) => {
    acc[score.examId] = acc[score.examId] || []
    acc[score.examId].push(score)
    return acc
  }, {})

  // Dữ liệu cho biểu đồ kết quả bài thi
  const examData = {
    labels: [t('courseDetails.pass'), t('courseDetails.fail'), t('courseDetails.notAttempted')],
    datasets: [
      {
        label: t('courseDetails.examResultsSummary'),
        data: [
          examResults.filter((exam) => exam.result === 'Pass').length,
          examResults.filter((exam) => exam.result === 'Fail').length,
          examResults.filter((exam) => exam.highestScore === null).length // Chưa làm
        ],
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107']
      }
    ]
  }

  // Dữ liệu cho biểu đồ tiến độ bài học
  const lessonData = {
    labels: [t('courseDetails.completed'), t('courseDetails.notAttempted')],
    datasets: [
      {
        label: t('courseDetails.lessonProgressSummary'),
        data: [
          lessonResults.filter((lesson) => lesson.status === 'Completed').length,
          lessonResults.filter((lesson) => lesson.status === 'Not Attempted').length
        ],
        backgroundColor: ['#4CAF50', '#FFC107']
      }
    ]
  }

  // Dữ liệu cho biểu đồ cột hiển thị điểm trung bình và phần trăm bài thi đã thực hiện
  const averageData = {
    labels: [t('courseDetails.averageExamScore'), t('courseDetails.examsAttemptedPercentage')],
    datasets: [
      {
        label: t('courseDetails.averageExamScore'),
        data: [averageExamScore.toFixed(2), 0],
        backgroundColor: ['#36A2EB', '#36A2EB']
      },
      {
        label: t('courseDetails.examsAttemptedPercentage'),
        data: [0, percentageExamsAttempted.toFixed(2)],
        backgroundColor: ['#4CAF50', '#4CAF50']
      }
    ]
  }

  // Dữ liệu cho biểu đồ đường hiển thị điểm số qua các lần làm bài
  const lineData = selectedExamId
    ? {
        labels: examScores
          .filter((score) => score.examId === selectedExamId)
          .map((score) => `${t('courseDetails.attempt')} ${score.attempt}`),
        datasets: [
          {
            label: t('courseDetails.examScoresOverAttempts'),
            data: examScores
              .filter((score) => score.examId === selectedExamId)
              .map((score) => score.totalScore),
            fill: false,
            borderColor: '#4CAF50'
          }
        ]
      }
    : null

  // Lấy huy hiệu dựa trên tỷ lệ hoàn thành
  const getCompletionBadge = (rate: number) => {
    if (rate >= 90) {
      return { text: t('courseDetails.excellent'), color: 'bg-green-100 text-green-800', icon: <FaStar /> }
    }
    if (rate >= 75) {
      return { text: t('courseDetails.good'), color: 'bg-blue-100 text-blue-800', icon: <FaThumbsUp /> }
    }
    if (rate >= 50) {
      return { text: t('courseDetails.average'), color: 'bg-yellow-100 text-yellow-800', icon: <FaExclamationCircle /> }
    }
    return { text: t('courseDetails.needsImprovement'), color: 'bg-red-100 text-red-800', icon: <FaFrown /> }
  }

  const examBadge = getCompletionBadge(examCompletionRate)
  const lessonBadge = getCompletionBadge(lessonCompletionRate)

  // Tính tổng số trang cho bài thi
  const totalExamPages = Math.ceil(examResults.length / examsPerPage)

  // Lấy danh sách bài thi hiện tại
  const indexOfLastExam = currentExamPage * examsPerPage
  const indexOfFirstExam = indexOfLastExam - examsPerPage
  const currentExams = examResults.slice(indexOfFirstExam, indexOfLastExam)

  // Tính tổng số trang cho bài học
  const totalLessonPages = Math.ceil(lessonResults.length / lessonsPerPage)

  // Lấy danh sách bài học hiện tại
  const indexOfLastLesson = currentLessonPage * lessonsPerPage
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage
  const currentLessons = lessonResults.slice(indexOfFirstLesson, indexOfLastLesson)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        beginAtZero: true
      }
    }
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        beginAtZero: true
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false
  }

  const handleViewChartClick = (examId: number) => {
    setSelectedExamId(examId)
    setTimeout(() => {
      lineChartRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSave = async () => {
    if (courseId) {
      const result = await putTeacherComment(parseInt(courseId || '0', 10), studentId, teacherComment)
      result.status === 200 ? toast.success(t('courseDetails.success')) : toast.error(t('courseDetails.failed'))
    }
  }

  return (
        <div className="container mx-auto p-">
            <h1 className="text-2xl font-bold mb-2">{t('courseDetails.overview2')} {studentName}</h1>

            {/* Phần cảnh báo */}
            {/* {(showExamWarning || showLessonWarning) && (
                <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
                    <p className="font-semibold">
                        {t('courseDetails.incompleteWarning')}
                    </p>
                </div>
            )} */}

            <div className='border-b-2 border-gray-200 mb-4'></div>

            <div className="bg-white shadow p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-4">{t('courseDetails.teacherAssessment')}</h3>
                <QuillEditorTeacherComment
                    theme='snow'
                    value={teacherComment}
                    onChange={(value) => setTeacherComment(value)}
                    // modules={modules}
                    // className='w-full pb-0 md:h-auto'
                />
                <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                    onClick={() => { handleSave() }}
                >
                    {t('courseDetails.save')}
                </button>
            </div>

            <div className='border-b-2 border-gray-200 mb-4'></div>

            {/* Đánh giá chung */}
            <div className="bg-white shadow p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('courseDetails.overallAssessment')}</h3>
                <div className="flex items-center gap-4">
                    <p>
                        <span className="font-bold">{t('courseDetails.examCompletionRate')}:</span>{' '}
                        {examResults.length > 0 ? `${examCompletionRate.toFixed(2)}%` : t('courseDetails.noExams')}
                    </p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${examBadge.color}`}>
                        {examBadge.icon}
                        <span className="ml-2">{examBadge.text}</span>
                    </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <p>
                        <span className="font-bold">{t('courseDetails.averageExamScore')}:</span>{' '}
                        {averageExamScore.toFixed(2)}%
                    </p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <p>
                        <span className="font-bold">{t('courseDetails.examsAttemptedPercentage')}:</span>{' '}
                        {percentageExamsAttempted.toFixed(2)}%
                    </p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <p>
                        <span className="font-bold">{t('courseDetails.lessonCompletionRate')}:</span>{' '}
                        {lessonResults.length > 0 ? `${lessonCompletionRate.toFixed(2)}%` : t('courseDetails.noLessons')}
                    </p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${lessonBadge.color}`}>
                        {lessonBadge.icon}
                        <span className="ml-2">{lessonBadge.text}</span>
                    </span>
                </div>
            </div>

            {/* Biểu đồ cột */}
            <div className="bg-white shadow p-6 rounded-lg mb-6" style={{ height: '300px' }}>
                <h3 className="text-lg font-semibold mb-4">{t('courseDetails.generalEvaluation')}</h3>
                <div className="relative w-full h-full pb-6">
                    <Bar data={averageData} options={options} />
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow p-6 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                    <h3 className="text-lg font-semibold mb-4">{t('courseDetails.examResultsSummary')}</h3>
                    <div className="relative w-full h-full pb-6">
                        <Doughnut data={examData} options={doughnutOptions} />
                    </div>
                </div>
                <div className="bg-white shadow p-6 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                    <h3 className="text-lg font-semibold mb-4">{t('courseDetails.lessonProgressSummary')}</h3>
                    <div className="relative w-full h-full pb-6">
                        <Doughnut data={lessonData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Biểu đồ đường */}
            {selectedExamId && lineData && (
                <div ref={lineChartRef} className="bg-white shadow p-6 rounded-lg mb-6 scroll-mt-24" style={{ height: '300px', width: '100%' }}>
                    <h3 className="text-lg font-semibold truncate">
                        {t('courseDetails.examScoresOverAttempts')}:
                    </h3>
                    <h3 className="text-sm truncate mb-4 ">
                        {examResults.find((exam) => exam.examId === selectedExamId)?.studyItemName}
                    </h3>
                    <div className="relative w-full h-full pb-12">
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>
            )}

            {/* Tabs cho chi tiết */}
            <Tabs>
                <TabList>
                    <Tab>{t('courseDetails.exams')}</Tab>
                    <Tab>{t('courseDetails.lessons')}</Tab>
                </TabList>

                {/* Tab Bài thi */}
                <TabPanel>
                    <div className="bg-white shadow p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">{t('courseDetails.examResults')}</h3>
                        {examResults.length === 0 ? (
                            <p>{t('courseDetails.noExams')}</p>
                        ) : (
                            <>
                                {currentExams.map((exam) => {
                                  const scores = groupedScores[exam.examId] || []
                                  return (
                                        <div key={exam.examId} className="border p-4 rounded-lg mb-4">
                                            <h4 className="font-semibold mb-2">{exam.studyItemName}</h4>
                                            <p>
                                                <span className="font-bold">{t('courseDetails.highestScore')}:</span>{' '}
                                                {exam.highestScore !== null ? `${exam.highestScore} / ${exam.maxScore}` : '-'}
                                            </p>
                                            <p>
                                                <span className="font-bold">{t('courseDetails.passingScore')}:</span> {exam.passingScore}
                                            </p>
                                            <p
                                                className={`font-semibold ${exam.result === 'Pass'
                                                    ? 'text-green-500'
                                                    : exam.result === 'Fail'
                                                        ? 'text-red-500'
                                                        : 'text-gray-500'
                                                    }`}
                                            >
                                                {t('courseDetails.result')}: {exam.result === 'Pass' ? t('courseDetails.pass') : exam.result === 'Fail' ? t('courseDetails.fail') : t('courseDetails.notAttempted')}
                                            </p>
                                            {/* Nút xem biểu đồ điểm số */}
                                            <button
                                                className="text-blue-500 hover:underline mt-2"
                                                onClick={() => handleViewChartClick(exam.examId)}
                                            >
                                                {t('courseDetails.viewScoreChart')}
                                            </button>
                                            {/* Luôn hiển thị bảng, ngay cả khi chưa có lần làm bài */}
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full table-fixed divide-y divide-gray-200 mt-4">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th
                                                                scope="col"
                                                                className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                            >
                                                                {t('courseDetails.attempt')}
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                            >
                                                                {t('courseDetails.score')}
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                            >
                                                                {t('courseDetails.change')}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {scores.length > 0 ? (
                                                          scores.map((score, index) => {
                                                            const previousScore = index > 0 ? scores[index - 1].totalScore : null
                                                            let changeIndicator = ''
                                                            let changeColor = ''

                                                            if (previousScore !== null) {
                                                              if (score.totalScore > previousScore) {
                                                                changeIndicator = `↑ ${t('courseDetails.increase')}`
                                                                changeColor = 'text-green-500'
                                                              } else if (score.totalScore < previousScore) {
                                                                changeIndicator = `↓ ${t('courseDetails.decrease')}`
                                                                changeColor = 'text-red-500'
                                                              } else {
                                                                changeIndicator = `→ ${t('courseDetails.noChange')}`
                                                                changeColor = 'text-gray-500'
                                                              }
                                                            } else {
                                                              changeIndicator = '-'
                                                              changeColor = 'text-gray-500'
                                                            }

                                                            return (
                                                                    <tr key={index}>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{score.attempt}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{score.totalScore}</td>
                                                                        <td className={`px-6 py-4 whitespace-nowrap ${changeColor} font-medium`}>
                                                                            {changeIndicator}
                                                                        </td>
                                                                    </tr>
                                                            )
                                                          })
                                                        ) : (
                                                            // Hiển thị khi chưa có lần làm bài nào
                                                            <tr>
                                                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500" colSpan={3}>
                                                                    {t('courseDetails.noAttempts')}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                  )
                                })}

                                {/* Phân trang cho bài thi */}
                                <div className="flex justify-center mt-4">
                                    <Pagination
                                        count={totalExamPages}
                                        page={currentExamPage}
                                        onChange={(event, value) => setCurrentExamPage(value)}
                                        variant="outlined"
                                        shape="rounded"
                                        siblingCount={0}
                                        boundaryCount={1}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </TabPanel>

                {/* Tab Bài học */}
                <TabPanel>
                    <div className="bg-white shadow p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">{t('courseDetails.lessonProgress')}</h3>
                        {lessonResults.length === 0 ? (
                            <p>{t('courseDetails.noLessons')}</p>
                        ) : (
                            <>
                                {currentLessons.map((lesson) => (
                                    <div key={lesson.lessonId} className="border p-4 rounded-lg mb-4">
                                        <h4 className="font-semibold mb-2">{lesson.lessonName}</h4>
                                        <p
                                            className={`font-semibold ${lesson.status === 'Completed' ? 'text-green-500' : 'text-gray-500'
                                                }`}
                                        >
                                            {t('courseDetails.status')}: {lesson.status === 'Completed' ? t('courseDetails.completed') : t('courseDetails.notCompleted')}
                                        </p>
                                    </div>
                                ))}

                                {/* Phân trang cho bài học */}
                                <div className="flex justify-center mt-4">
                                    <Pagination
                                        count={totalLessonPages}
                                        page={currentLessonPage}
                                        onChange={(event, value) => setCurrentLessonPage(value)}
                                        variant="outlined"
                                        shape="rounded"
                                        siblingCount={0}
                                        boundaryCount={1}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </TabPanel>
            </Tabs>
        </div>
  )
}

export default AnalysisSummary
