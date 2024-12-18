/* eslint-disable @typescript-eslint/restrict-plus-operands */
// /* eslint-disable multiline-ternary */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// /* eslint-disable no-prototype-builtins */
// /* eslint-disable @typescript-eslint/prefer-optional-chain */
// /* eslint-disable @typescript-eslint/no-misused-promises */
// /* eslint-disable @typescript-eslint/restrict-template-expressions */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// /* eslint-disable @typescript-eslint/strict-boolean-expressions */
// /*
//    ========================================================================== */
// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
// import 'react-tabs/style/react-tabs.css'
// import { Doughnut } from 'react-chartjs-2'
// import { getUserExamResults, getUserLessonResults, getUserExamScores } from '../../../api/post/post.api'
// import { FaStar, FaThumbsUp, FaExclamationCircle, FaFrown } from 'react-icons/fa'

// interface ExamResult {
//   examId: number
//   highestScore: number | null
//   passingScore: number
//   maxScore: number
//   result: string | null
//   studyItemName: string
// }

// interface ExamScore {
//   examId: number
//   attempt: number
//   totalScore: number
//   studyItemName: string
// }

// interface LessonResult {
//   lessonId: number
//   lessonName: string
//   status: string
// }

// const CourseDetailsPage: React.FC = () => {
//   const { courseId } = useParams<{ courseId: string }>()
//   const [examResults, setExamResults] = useState<ExamResult[]>([])
//   const [examScores, setExamScores] = useState<ExamScore[]>([])
//   const [lessonResults, setLessonResults] = useState<LessonResult[]>([])
//   const [examCompletionRate, setExamCompletionRate] = useState<number>(0)
//   const [lessonCompletionRate, setLessonCompletionRate] = useState<number>(0)
//   const [showExamWarning, setShowExamWarning] = useState<boolean>(false)
//   const [showLessonWarning, setShowLessonWarning] = useState<boolean>(false)

//   // Pagination states for Exams
//   const [currentExamPage, setCurrentExamPage] = useState(1)
//   const [examsPerPage] = useState(5)

//   // Pagination states for Lessons
//   const [currentLessonPage, setCurrentLessonPage] = useState(1)
//   const [lessonsPerPage] = useState(5)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch Exam Results
//         const examResponse = await getUserExamResults(parseInt(courseId || '0', 10))
//         const exams = examResponse.data.examResults
//         setExamResults(exams)

//         // Calculate Exam Completion Rate
//         if (exams.length > 0) {
//           const totalExams = exams.length
//           const passedExams = exams.filter((exam: ExamResult) => exam.result === 'Pass').length
//           setExamCompletionRate((passedExams / totalExams) * 100)

//           // Show warning for "Not Attempted" or "Fail" exams
//           setShowExamWarning(exams.some((exam: ExamResult) => exam.result === 'Fail' || exam.highestScore === null))
//         } else {
//           setExamCompletionRate(0)
//           setShowExamWarning(false)
//         }

//         // Fetch Exam Scores
//         const scoresResponse = await getUserExamScores(parseInt(courseId || '0', 10))
//         setExamScores(scoresResponse.data.examScores)

//         // Fetch Lesson Results
//         const lessonResponse = await getUserLessonResults(parseInt(courseId || '0', 10))
//         const lessons = lessonResponse.data.lessonResults
//         setLessonResults(lessons)

//         // Calculate Lesson Completion Rate
//         if (lessons.length > 0) {
//           const totalLessons = lessons.length
//           const completedLessons = lessons.filter((lesson: LessonResult) => lesson.status === 'Completed').length
//           setLessonCompletionRate((completedLessons / totalLessons) * 100)

//           // Show warning for "Not Attempted" lessons
//           setShowLessonWarning(lessons.some((lesson: LessonResult) => lesson.status === 'Not Attempted'))
//         } else {
//           setLessonCompletionRate(0)
//           setShowLessonWarning(false)
//         }
//       } catch (err) {
//         console.error(err)
//       }
//     }

//     fetchData()
//   }, [courseId])

//   // Group scores by examId for comparison
//   const groupedScores = examScores.reduce((acc: Record<number, ExamScore[]>, score) => {
//     acc[score.examId] = acc[score.examId] || []
//     acc[score.examId].push(score)
//     return acc
//   }, {})

//   // Data for Exam Completion Chart
//   const examData = {
//     labels: ['Pass', 'Fail', 'Not Attempted'],
//     datasets: [
//       {
//         label: 'Exam Results',
//         data: [
//           examResults.filter((exam) => exam.result === 'Pass').length,
//           examResults.filter((exam) => exam.result === 'Fail').length,
//           examResults.filter((exam) => exam.highestScore === null).length // Not Attempted
//         ],
//         backgroundColor: ['#4CAF50', '#F44336', '#FFC107']
//       }
//     ]
//   }

//   // Data for Lesson Completion Chart
//   const lessonData = {
//     labels: ['Completed', 'Not Attempted'],
//     datasets: [
//       {
//         label: 'Lesson Results',
//         data: [
//           lessonResults.filter((lesson) => lesson.status === 'Completed').length,
//           lessonResults.filter((lesson) => lesson.status === 'Not Attempted').length
//         ],
//         backgroundColor: ['#4CAF50', '#FFC107']
//       }
//     ]
//   }

//   // Get completion badge based on the rate
//   const getCompletionBadge = (rate: number) => {
//     if (rate >= 90) {
//       return { text: 'Excellent', color: 'bg-green-100 text-green-800', icon: <FaStar /> }
//     }
//     if (rate >= 75) {
//       return { text: 'Good', color: 'bg-blue-100 text-blue-800', icon: <FaThumbsUp /> }
//     }
//     if (rate >= 50) {
//       return { text: 'Average', color: 'bg-yellow-100 text-yellow-800', icon: <FaExclamationCircle /> }
//     }
//     return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800', icon: <FaFrown /> }
//   }

//   const examBadge = getCompletionBadge(examCompletionRate)
//   const lessonBadge = getCompletionBadge(lessonCompletionRate)

//   // Calculate total pages for Exams
//   const totalExamPages = Math.ceil(examResults.length / examsPerPage)
//   const examPageNumbers = []
//   for (let i = 1; i <= totalExamPages; i++) {
//     examPageNumbers.push(i)
//   }

//   // Get current exams
//   const indexOfLastExam = currentExamPage * examsPerPage
//   const indexOfFirstExam = indexOfLastExam - examsPerPage
//   const currentExams = examResults.slice(indexOfFirstExam, indexOfLastExam)

//   // Calculate total pages for Lessons
//   const totalLessonPages = Math.ceil(lessonResults.length / lessonsPerPage)
//   const lessonPageNumbers = []
//   for (let i = 1; i <= totalLessonPages; i++) {
//     lessonPageNumbers.push(i)
//   }

//   // Get current lessons
//   const indexOfLastLesson = currentLessonPage * lessonsPerPage
//   const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage
//   const currentLessons = lessonResults.slice(indexOfFirstLesson, indexOfLastLesson)

//   return (
//        <div className="container mx-auto p-6">
//          <h1 className="text-2xl font-bold mb-6">Course Details</h1>

//          {/* Warning Section */}
//          {(showExamWarning || showLessonWarning) && (
//            <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
//              <p className="font-semibold">
//                Bạn chưa hoàn thành tất cả các bài kiểm tra hoặc bài học. Hãy hoàn thành để cải thiện đánh giá tổng quan!
//              </p>
//            </div>
//          )}

//          {/* Overall Summary */}
//          <div className="bg-white shadow p-6 rounded-lg mb-6">
//            <h3 className="text-lg font-semibold mb-4">Overall Summary</h3>
//            <div className="flex items-center gap-4">
//              <p>
//                <span className="font-bold">Exam Rate Pass/Fail:</span>{' '}
//                {examResults.length > 0 ? `${examCompletionRate.toFixed(2)}%` : 'No exams available'}
//              </p>
//              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${examBadge.color}`}>
//                {examBadge.icon}
//                <span className="ml-2">{examBadge.text}</span>
//              </span>
//            </div>
//            <div className="flex items-center gap-4 mt-2">
//              <p>
//                <span className="font-bold">Lesson Completion Rate:</span>{' '}
//                {lessonResults.length > 0 ? `${lessonCompletionRate.toFixed(2)}%` : 'No lessons available'}
//              </p>
//              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${lessonBadge.color}`}>
//                {lessonBadge.icon}
//                <span className="ml-2">{lessonBadge.text}</span>
//              </span>
//            </div>
//          </div>

//          {/* Charts Section */}
//          <div className="w-2/3 h-2/3 mx-auto">
//          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//            <div className="bg-white shadow p-6 rounded-lg">
//              <h3 className="text-lg font-semibold mb-4">Exam Pass/Fail</h3>
//              <Doughnut data={examData} />
//            </div>
//            <div className="bg-white shadow p-6 rounded-lg">
//              <h3 className="text-lg font-semibold mb-4">Lesson Completion</h3>
//              <Doughnut data={lessonData} />
//            </div>
//          </div>
//          </div>
//          {/* Tabs for Details */}
//          <Tabs>
//            <TabList>
//              <Tab>Exams</Tab>
//              <Tab>Lessons</Tab>
//            </TabList>

//            {/* Exam Tab */}
//            <TabPanel>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Exam Results</h3>
//                {examResults.length === 0 ? (
//                  <p>No exams found for this course.</p>
//                ) : (
//                  <>
// {currentExams.map((exam) => {
//   const scores = groupedScores[exam.examId] || []
//   return (
//                 <div key={exam.examId} className="border p-4 rounded-lg mb-4">
//                   <h4 className="font-semibold mb-2">{exam.studyItemName}</h4>
//                   <p>
//                     <span className="font-bold">Score:</span>{' '}
//                     {exam.highestScore !== null ? `${exam.highestScore} / ${exam.maxScore}` : '-'}
//                   </p>
//                   <p>
//                     <span className="font-bold">Passing Score:</span> {exam.passingScore}
//                   </p>
//                   <p
//                     className={`font-semibold ${
//                       exam.result === 'Pass'
//                         ? 'text-green-500'
//                         : exam.result === 'Fail'
//                         ? 'text-red-500'
//                         : 'text-gray-500'
//                     }`}
//                   >
//                     Result: {exam.result || '-'}
//                   </p>
//                   {/* Luôn hiển thị bảng, ngay cả khi không có attempts */}
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full table-fixed divide-y divide-gray-200 mt-4">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th
//                             scope="col"
//                             className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                           >
//                             Attempt
//                           </th>
//                           <th
//                             scope="col"
//                             className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                           >
//                             Score
//                           </th>
//                           <th
//                             scope="col"
//                             className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                           >
//                             Change
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {scores.length > 0 ? (
//                           scores.map((score, index) => {
//                             const previousScore = index > 0 ? scores[index - 1].totalScore : null
//                             let changeIndicator = ''
//                             let changeColor = ''

//                             if (previousScore !== null) {
//                               if (score.totalScore > previousScore) {
//                                 changeIndicator = '↑ Increased'
//                                 changeColor = 'text-green-500'
//                               } else if (score.totalScore < previousScore) {
//                                 changeIndicator = '↓ Decreased'
//                                 changeColor = 'text-red-500'
//                               } else {
//                                 changeIndicator = '→ No Change'
//                                 changeColor = 'text-gray-500'
//                               }
//                             } else {
//                               changeIndicator = '-'
//                               changeColor = 'text-gray-500'
//                             }

//                             return (
//                               <tr key={index}>
//                                 <td className="px-6 py-4 whitespace-nowrap">{score.attempt}</td>
//                                 <td className="px-6 py-4 whitespace-nowrap">{score.totalScore}</td>
//                                 <td className={`px-6 py-4 whitespace-nowrap ${changeColor} font-medium`}>
//                                   {changeIndicator}
//                                 </td>
//                               </tr>
//                             )
//                           })
//                         ) : (
//                           // Hiển thị hàng thông báo khi không có attempts
//                           <tr>
//                             <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500" colSpan={3}>
//                               No attempts yet.
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//   )
// })}

//                    {/* Pagination Controls for Exams */}
//                    <div className="flex justify-center mt-4">
//                      <button
//                        onClick={() => setCurrentExamPage((prev) => Math.max(prev - 1, 1))}
//                        disabled={currentExamPage === 1}
//                        className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
//                      >
//                        Previous
//                      </button>
//                      {examPageNumbers.map((number) => (
//                        <button
//                          key={number}
//                          onClick={() => setCurrentExamPage(number)}
//                          className={`px-3 py-1 mx-1 rounded ${
//                            currentExamPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'
//                          }`}
//                        >
//                          {number}
//                        </button>
//                      ))}
//                      <button
//                        onClick={() => setCurrentExamPage((prev) => Math.min(prev + 1, totalExamPages))}
//                        disabled={currentExamPage === totalExamPages}
//                        className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
//                      >
//                        Next
//                      </button>
//                    </div>
//                  </>
//                )}
//              </div>
//            </TabPanel>

//            {/* Lesson Tab */}
//            <TabPanel>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Lesson Progress</h3>
//                {lessonResults.length === 0 ? (
//                  <p>No lessons found for this course.</p>
//                ) : (
//                  <>
//                    {currentLessons.map((lesson) => (
//                      <div key={lesson.lessonId} className="border p-4 rounded-lg mb-4">
//                        <h4 className="font-semibold mb-2">{lesson.lessonName}</h4>
//                        <p
//                          className={`font-semibold ${
//                            lesson.status === 'Completed' ? 'text-green-500' : 'text-gray-500'
//                          }`}
//                        >
//                          Status: {lesson.status}
//                        </p>
//                      </div>
//                    ))}

//                    {/* Pagination Controls for Lessons */}
//                    <div className="flex justify-center mt-4">
//                      <button
//                        onClick={() => setCurrentLessonPage((prev) => Math.max(prev - 1, 1))}
//                        disabled={currentLessonPage === 1}
//                        className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
//                      >
//                        Previous
//                      </button>
//                      {lessonPageNumbers.map((number) => (
//                        <button
//                          key={number}
//                          onClick={() => setCurrentLessonPage(number)}
//                          className={`px-3 py-1 mx-1 rounded ${
//                            currentLessonPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'
//                          }`}
//                        >
//                          {number}
//                        </button>
//                      ))}
//                      <button
//                        onClick={() => setCurrentLessonPage((prev) => Math.min(prev + 1, totalLessonPages))}
//                        disabled={currentLessonPage === totalLessonPages}
//                        className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
//                      >
//                        Next
//                      </button>
//                    </div>
//                  </>
//                )}
//              </div>
//            </TabPanel>
//          </Tabs>
//        </div>
//   )
// }

// export default CourseDetailsPage

// /* eslint-disable multiline-ternary */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// /* eslint-disable no-prototype-builtins */
// /* eslint-disable @typescript-eslint/prefer-optional-chain */
// /* eslint-disable @typescript-eslint/no-misused-promises */
// /* eslint-disable @typescript-eslint/restrict-template-expressions */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// /* eslint-disable @typescript-eslint/strict-boolean-expressions */
// /*
//    ========================================================================== */
// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
// import 'react-tabs/style/react-tabs.css'
// import { Doughnut } from 'react-chartjs-2'
// import { getUserExamResults, getUserLessonResults, getUserExamScores } from '../../../api/post/post.api'
// import { FaStar, FaThumbsUp, FaExclamationCircle, FaFrown } from 'react-icons/fa'
// import { Pagination } from '@mui/material' // Import Pagination

// interface ExamResult {
//   examId: number
//   highestScore: number | null
//   passingScore: number
//   maxScore: number
//   result: string | null
//   studyItemName: string
// }

// interface ExamScore {
//   examId: number
//   attempt: number
//   totalScore: number
//   studyItemName: string
// }

// interface LessonResult {
//   lessonId: number
//   lessonName: string
//   status: string
// }

// const CourseDetailsPage: React.FC = () => {
//   const { courseId } = useParams<{ courseId: string }>()
//   const [examResults, setExamResults] = useState<ExamResult[]>([])
//   const [examScores, setExamScores] = useState<ExamScore[]>([])
//   const [lessonResults, setLessonResults] = useState<LessonResult[]>([])
//   const [examCompletionRate, setExamCompletionRate] = useState<number>(0)
//   const [lessonCompletionRate, setLessonCompletionRate] = useState<number>(0)
//   const [showExamWarning, setShowExamWarning] = useState<boolean>(false)
//   const [showLessonWarning, setShowLessonWarning] = useState<boolean>(false)

//   // Pagination states for Exams
//   const [currentExamPage, setCurrentExamPage] = useState(1)
//   const examsPerPage = 5

//   // Pagination states for Lessons
//   const [currentLessonPage, setCurrentLessonPage] = useState(1)
//   const lessonsPerPage = 5

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch Exam Results
//         const examResponse = await getUserExamResults(parseInt(courseId || '0', 10))
//         const exams = examResponse.data.examResults
//         setExamResults(exams)

//         // Calculate Exam Completion Rate
//         if (exams.length > 0) {
//           const totalExams = exams.length
//           const passedExams = exams.filter((exam: ExamResult) => exam.result === 'Pass').length
//           setExamCompletionRate((passedExams / totalExams) * 100)

//           // Show warning for "Not Attempted" or "Fail" exams
//           setShowExamWarning(exams.some((exam: ExamResult) => exam.result === 'Fail' || exam.highestScore === null))
//         } else {
//           setExamCompletionRate(0)
//           setShowExamWarning(false)
//         }

//         // Fetch Exam Scores
//         const scoresResponse = await getUserExamScores(parseInt(courseId || '0', 10))
//         setExamScores(scoresResponse.data.examScores)

//         // Fetch Lesson Results
//         const lessonResponse = await getUserLessonResults(parseInt(courseId || '0', 10))
//         const lessons = lessonResponse.data.lessonResults
//         setLessonResults(lessons)

//         // Calculate Lesson Completion Rate
//         if (lessons.length > 0) {
//           const totalLessons = lessons.length
//           const completedLessons = lessons.filter((lesson: LessonResult) => lesson.status === 'Completed').length
//           setLessonCompletionRate((completedLessons / totalLessons) * 100)

//           // Show warning for "Not Attempted" lessons
//           setShowLessonWarning(lessons.some((lesson: LessonResult) => lesson.status === 'Not Attempted'))
//         } else {
//           setLessonCompletionRate(0)
//           setShowLessonWarning(false)
//         }
//       } catch (err) {
//         console.error(err)
//       }
//     }

//     fetchData()
//   }, [courseId])

//   // Group scores by examId for comparison
//   const groupedScores = examScores.reduce((acc: Record<number, ExamScore[]>, score) => {
//     acc[score.examId] = acc[score.examId] || []
//     acc[score.examId].push(score)
//     return acc
//   }, {})

//   // Data for Exam Completion Chart
//   const examData = {
//     labels: ['Pass', 'Fail', 'Not Attempted'],
//     datasets: [
//       {
//         label: 'Exam Results',
//         data: [
//           examResults.filter((exam) => exam.result === 'Pass').length,
//           examResults.filter((exam) => exam.result === 'Fail').length,
//           examResults.filter((exam) => exam.highestScore === null).length // Not Attempted
//         ],
//         backgroundColor: ['#4CAF50', '#F44336', '#FFC107']
//       }
//     ]
//   }

//   // Data for Lesson Completion Chart
//   const lessonData = {
//     labels: ['Completed', 'Not Attempted'],
//     datasets: [
//       {
//         label: 'Lesson Results',
//         data: [
//           lessonResults.filter((lesson) => lesson.status === 'Completed').length,
//           lessonResults.filter((lesson) => lesson.status === 'Not Attempted').length
//         ],
//         backgroundColor: ['#4CAF50', '#FFC107']
//       }
//     ]
//   }

//   // Get completion badge based on the rate
//   const getCompletionBadge = (rate: number) => {
//     if (rate >= 90) {
//       return { text: 'Excellent', color: 'bg-green-100 text-green-800', icon: <FaStar /> }
//     }
//     if (rate >= 75) {
//       return { text: 'Good', color: 'bg-blue-100 text-blue-800', icon: <FaThumbsUp /> }
//     }
//     if (rate >= 50) {
//       return { text: 'Average', color: 'bg-yellow-100 text-yellow-800', icon: <FaExclamationCircle /> }
//     }
//     return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800', icon: <FaFrown /> }
//   }

//   const examBadge = getCompletionBadge(examCompletionRate)
//   const lessonBadge = getCompletionBadge(lessonCompletionRate)

//   // Calculate total pages for Exams
//   const totalExamPages = Math.ceil(examResults.length / examsPerPage)

//   // Get current exams
//   const indexOfLastExam = currentExamPage * examsPerPage
//   const indexOfFirstExam = indexOfLastExam - examsPerPage
//   const currentExams = examResults.slice(indexOfFirstExam, indexOfLastExam)

//   // Calculate total pages for Lessons
//   const totalLessonPages = Math.ceil(lessonResults.length / lessonsPerPage)

//   // Get current lessons
//   const indexOfLastLesson = currentLessonPage * lessonsPerPage
//   const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage
//   const currentLessons = lessonResults.slice(indexOfFirstLesson, indexOfLastLesson)

//   return (
//        <div className="container mx-auto p-6">
//          <h1 className="text-2xl font-bold mb-6">Đánh giá chung</h1>

//          {/* Warning Section */}
//          {(showExamWarning || showLessonWarning) && (
//            <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
//              <p className="font-semibold">
//                Bạn chưa hoàn thành tất cả các bài kiểm tra hoặc bài học. Hãy hoàn thành để cải thiện đánh giá tổng quan!
//              </p>
//            </div>
//          )}

//          {/* Overall Summary */}
//          <div className="bg-white shadow p-6 rounded-lg mb-6">
//            <h3 className="text-lg font-semibold mb-4">Overall Summary</h3>
//            <div className="flex items-center gap-4">
//              <p>
//                <span className="font-bold">Exam Rate Pass/Fail:</span>{' '}
//                {examResults.length > 0 ? `${examCompletionRate.toFixed(2)}%` : 'No exams available'}
//              </p>
//              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${examBadge.color}`}>
//                {examBadge.icon}
//                <span className="ml-2">{examBadge.text}</span>
//              </span>
//            </div>
//            <div className="flex items-center gap-4 mt-2">
//              <p>
//                <span className="font-bold">Lesson Completion Rate:</span>{' '}
//                {lessonResults.length > 0 ? `${lessonCompletionRate.toFixed(2)}%` : 'No lessons available'}
//              </p>
//              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${lessonBadge.color}`}>
//                {lessonBadge.icon}
//                <span className="ml-2">{lessonBadge.text}</span>
//              </span>
//            </div>
//          </div>

//          {/* Charts Section */}
//          <div className="w-2/3 h-2/3 mx-auto">
//            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Exam Pass/Fail</h3>
//                <Doughnut data={examData} />
//              </div>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Lesson Completion</h3>
//                <Doughnut data={lessonData} />
//              </div>
//            </div>
//          </div>

//          {/* Tabs for Details */}
//          <Tabs>
//            <TabList>
//              <Tab>Exams</Tab>
//              <Tab>Lessons</Tab>
//            </TabList>

//            {/* Exam Tab */}
//            <TabPanel>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Exam Results</h3>
//                {examResults.length === 0 ? (
//                  <p>No exams found for this course.</p>
//                ) : (
//                  <>
//                    {currentExams.map((exam) => {
//                      const scores = groupedScores[exam.examId] || []
//                      return (
//                        <div key={exam.examId} className="border p-4 rounded-lg mb-4">
//                          <h4 className="font-semibold mb-2">{exam.studyItemName}</h4>
//                          <p>
//                            <span className="font-bold">Score:</span>{' '}
//                            {exam.highestScore !== null ? `${exam.highestScore} / ${exam.maxScore}` : '-'}
//                          </p>
//                          <p>
//                            <span className="font-bold">Passing Score:</span> {exam.passingScore}
//                          </p>
//                          <p
//                            className={`font-semibold ${
//                              exam.result === 'Pass'
//                                ? 'text-green-500'
//                                : exam.result === 'Fail'
//                                ? 'text-red-500'
//                                : 'text-gray-500'
//                            }`}
//                          >
//                            Result: {exam.result || '-'}
//                          </p>
//                          {/* Always display the table, even if no attempts */}
//                          <div className="overflow-x-auto">
//                            <table className="min-w-full table-fixed divide-y divide-gray-200 mt-4">
//                              <thead className="bg-gray-50">
//                                <tr>
//                                  <th
//                                    scope="col"
//                                    className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Attempt
//                                  </th>
//                                  <th
//                                    scope="col"
//                                    className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Score
//                                  </th>
//                                  <th
//                                    scope="col"
//                                    className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Change
//                                  </th>
//                                </tr>
//                              </thead>
//                              <tbody className="bg-white divide-y divide-gray-200">
//                                {scores.length > 0 ? (
//                                  scores.map((score, index) => {
//                                    const previousScore = index > 0 ? scores[index - 1].totalScore : null
//                                    let changeIndicator = ''
//                                    let changeColor = ''

//                                    if (previousScore !== null) {
//                                      if (score.totalScore > previousScore) {
//                                        changeIndicator = '↑ Increased'
//                                        changeColor = 'text-green-500'
//                                      } else if (score.totalScore < previousScore) {
//                                        changeIndicator = '↓ Decreased'
//                                        changeColor = 'text-red-500'
//                                      } else {
//                                        changeIndicator = '→ No Change'
//                                        changeColor = 'text-gray-500'
//                                      }
//                                    } else {
//                                      changeIndicator = '-'
//                                      changeColor = 'text-gray-500'
//                                    }

//                                    return (
//                                      <tr key={index}>
//                                        <td className="px-6 py-4 whitespace-nowrap">{score.attempt}</td>
//                                        <td className="px-6 py-4 whitespace-nowrap">{score.totalScore}</td>
//                                        <td className={`px-6 py-4 whitespace-nowrap ${changeColor} font-medium`}>
//                                          {changeIndicator}
//                                        </td>
//                                      </tr>
//                                    )
//                                  })
//                                ) : (
//                                  // Display a row when no attempts
//                                  <tr>
//                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500" colSpan={3}>
//                                      No attempts yet.
//                                    </td>
//                                  </tr>
//                                )}
//                              </tbody>
//                            </table>
//                          </div>
//                        </div>
//                      )
//                    })}

//                    {/* Updated pagination using MUI Pagination for Exams */}
//                    <div className="flex justify-center mt-4">
//                      <Pagination
//                        count={totalExamPages}
//                        page={currentExamPage}
//                        onChange={(event, value) => setCurrentExamPage(value)}
//                        variant="outlined"
//                        shape="rounded"
//                        siblingCount={0}
//                        boundaryCount={1}
//                      />
//                    </div>
//                  </>
//                )}
//              </div>
//            </TabPanel>

//            {/* Lesson Tab */}
//            <TabPanel>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Lesson Progress</h3>
//                {lessonResults.length === 0 ? (
//                  <p>No lessons found for this course.</p>
//                ) : (
//                  <>
//                    {currentLessons.map((lesson) => (
//                      <div key={lesson.lessonId} className="border p-4 rounded-lg mb-4">
//                        <h4 className="font-semibold mb-2">{lesson.lessonName}</h4>
//                        <p
//                          className={`font-semibold ${
//                            lesson.status === 'Completed' ? 'text-green-500' : 'text-gray-500'
//                          }`}
//                        >
//                          Status: {lesson.status}
//                        </p>
//                      </div>
//                    ))}

//                    {/* Updated pagination using MUI Pagination for Lessons */}
//                    <div className="flex justify-center mt-4">
//                      <Pagination
//                        count={totalLessonPages}
//                        page={currentLessonPage}
//                        onChange={(event, value) => setCurrentLessonPage(value)}
//                        variant="outlined"
//                        shape="rounded"
//                        siblingCount={0}
//                        boundaryCount={1}
//                      />
//                    </div>
//                  </>
//                )}
//              </div>
//            </TabPanel>
//          </Tabs>
//        </div>
//   )
// }

// export default CourseDetailsPage

// /* eslint-disable multiline-ternary */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// /* eslint-disable no-prototype-builtins */
// /* eslint-disable @typescript-eslint/prefer-optional-chain */
// /* eslint-disable @typescript-eslint/no-misused-promises */
// /* eslint-disable @typescript-eslint/restrict-template-expressions */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// /* eslint-disable @typescript-eslint/strict-boolean-expressions */
// /*
//    ========================================================================== */
// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
// import 'react-tabs/style/react-tabs.css'
// import { Doughnut } from 'react-chartjs-2'
// import { getUserExamResults, getUserLessonResults, getUserExamScores } from '../../../api/post/post.api'
// import { FaStar, FaThumbsUp, FaExclamationCircle, FaFrown } from 'react-icons/fa'
// import { Pagination } from '@mui/material'

// interface ExamResult {
//   examId: number
//   highestScore: number | null
//   passingScore: number
//   maxScore: number
//   result: string | null
//   studyItemName: string
// }

// interface ExamScore {
//   examId: number
//   attempt: number
//   totalScore: number
//   studyItemName: string
// }

// interface LessonResult {
//   lessonId: number
//   lessonName: string
//   status: string
// }

// const CourseDetailsPage: React.FC = () => {
//   const { courseId } = useParams<{ courseId: string }>()
//   const [examResults, setExamResults] = useState<ExamResult[]>([])
//   const [examScores, setExamScores] = useState<ExamScore[]>([])
//   const [lessonResults, setLessonResults] = useState<LessonResult[]>([])
//   const [examCompletionRate, setExamCompletionRate] = useState<number>(0)
//   const [lessonCompletionRate, setLessonCompletionRate] = useState<number>(0)
//   const [showExamWarning, setShowExamWarning] = useState<boolean>(false)
//   const [showLessonWarning, setShowLessonWarning] = useState<boolean>(false)

//   // Thêm state cho điểm trung bình và phần trăm bài thi đã thực hiện
//   const [averageExamScore, setAverageExamScore] = useState<number>(0)
//   const [percentageExamsAttempted, setPercentageExamsAttempted] = useState<number>(0)

//   // Pagination states for Exams
//   const [currentExamPage, setCurrentExamPage] = useState(1)
//   const examsPerPage = 5

//   // Pagination states for Lessons
//   const [currentLessonPage, setCurrentLessonPage] = useState(1)
//   const lessonsPerPage = 5

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch Exam Results
//         const examResponse = await getUserExamResults(parseInt(courseId || '0', 10))
//         let exams = examResponse.data.examResults

//         // Chuyển đổi highestScore, passingScore và maxScore sang số
//         exams = exams.map((exam: any) => ({
//           ...exam,
//           highestScore: exam.highestScore !== null ? Number(exam.highestScore) : null,
//           passingScore: Number(exam.passingScore),
//           maxScore: Number(exam.maxScore)
//         }))

//         setExamResults(exams)

//         // Tính tỷ lệ hoàn thành bài thi
//         if (exams.length > 0) {
//           const totalExams = exams.length
//           const passedExams = exams.filter((exam: ExamResult) => exam.result === 'Pass').length
//           setExamCompletionRate((passedExams / totalExams) * 100)

//           // Tính điểm trung bình dựa trên công thức đã cung cấp
//           const attemptedExams = exams.filter((exam: ExamResult) => exam.highestScore !== null)
//           // const totalHighestScores = attemptedExams.reduce((sum, exam) => sum + (exam.highestScore || 0), 0)
//           // const totalMaxScores = attemptedExams.reduce((sum, exam) => sum + (exam.maxScore || 0), 0)
//           const totalHighestScores = attemptedExams.reduce((sum: number, exam: ExamResult) => sum + (exam.highestScore || 0), 0)
//           const totalMaxScores = attemptedExams.reduce((sum: number, exam: ExamResult) => sum + (exam.maxScore || 0), 0)
//           const averageScore = totalMaxScores > 0 ? (totalHighestScores / totalMaxScores) * 100 : 0
//           setAverageExamScore(averageScore)

//           // Tính phần trăm bài thi đã thực hiện
//           const attemptedExamsCount = attemptedExams.length
//           const percentageAttempted = (attemptedExamsCount / totalExams) * 100
//           setPercentageExamsAttempted(percentageAttempted)

//           // Hiển thị cảnh báo nếu có bài thi chưa hoàn thành hoặc không đạt
//           setShowExamWarning(exams.some((exam: ExamResult) => exam.result === 'Fail' || exam.highestScore === null))
//         } else {
//           setExamCompletionRate(0)
//           setAverageExamScore(0)
//           setPercentageExamsAttempted(0)
//           setShowExamWarning(false)
//         }

//         // Fetch Exam Scores
//         const scoresResponse = await getUserExamScores(parseInt(courseId || '0', 10))
//         setExamScores(scoresResponse.data.examScores)

//         // Fetch Lesson Results
//         const lessonResponse = await getUserLessonResults(parseInt(courseId || '0', 10))
//         const lessons = lessonResponse.data.lessonResults
//         setLessonResults(lessons)

//         // Tính tỷ lệ hoàn thành bài học
//         if (lessons.length > 0) {
//           const totalLessons = lessons.length
//           const completedLessons = lessons.filter((lesson: LessonResult) => lesson.status === 'Completed').length
//           setLessonCompletionRate((completedLessons / totalLessons) * 100)

//           // Hiển thị cảnh báo nếu có bài học chưa hoàn thành
//           setShowLessonWarning(lessons.some((lesson: LessonResult) => lesson.status === 'Not Attempted'))
//         } else {
//           setLessonCompletionRate(0)
//           setShowLessonWarning(false)
//         }
//       } catch (err) {
//         console.error(err)
//       }
//     }

//     fetchData()
//   }, [courseId])

//   // Nhóm điểm theo examId để so sánh
//   const groupedScores = examScores.reduce((acc: Record<number, ExamScore[]>, score) => {
//     acc[score.examId] = acc[score.examId] || []
//     acc[score.examId].push(score)
//     return acc
//   }, {})

//   // Dữ liệu cho biểu đồ kết quả bài thi
//   const examData = {
//     labels: ['Đạt', 'Không đạt', 'Chưa làm'],
//     datasets: [
//       {
//         label: 'Kết quả bài thi',
//         data: [
//           examResults.filter((exam) => exam.result === 'Pass').length,
//           examResults.filter((exam) => exam.result === 'Fail').length,
//           examResults.filter((exam) => exam.highestScore === null).length // Chưa làm
//         ],
//         backgroundColor: ['#4CAF50', '#F44336', '#FFC107']
//       }
//     ]
//   }

//   // Dữ liệu cho biểu đồ tiến độ bài học
//   const lessonData = {
//     labels: ['Đã hoàn thành', 'Chưa làm'],
//     datasets: [
//       {
//         label: 'Tiến độ bài học',
//         data: [
//           lessonResults.filter((lesson) => lesson.status === 'Completed').length,
//           lessonResults.filter((lesson) => lesson.status === 'Not Attempted').length
//         ],
//         backgroundColor: ['#4CAF50', '#FFC107']
//       }
//     ]
//   }

//   // Lấy huy hiệu dựa trên tỷ lệ hoàn thành
//   const getCompletionBadge = (rate: number) => {
//     if (rate >= 90) {
//       return { text: 'Xuất sắc', color: 'bg-green-100 text-green-800', icon: <FaStar /> }
//     }
//     if (rate >= 75) {
//       return { text: 'Tốt', color: 'bg-blue-100 text-blue-800', icon: <FaThumbsUp /> }
//     }
//     if (rate >= 50) {
//       return { text: 'Trung bình', color: 'bg-yellow-100 text-yellow-800', icon: <FaExclamationCircle /> }
//     }
//     return { text: 'Cần cải thiện', color: 'bg-red-100 text-red-800', icon: <FaFrown /> }
//   }

//   const examBadge = getCompletionBadge(examCompletionRate)
//   const lessonBadge = getCompletionBadge(lessonCompletionRate)

//   // Tính tổng số trang cho bài thi
//   const totalExamPages = Math.ceil(examResults.length / examsPerPage)

//   // Lấy danh sách bài thi hiện tại
//   const indexOfLastExam = currentExamPage * examsPerPage
//   const indexOfFirstExam = indexOfLastExam - examsPerPage
//   const currentExams = examResults.slice(indexOfFirstExam, indexOfLastExam)

//   // Tính tổng số trang cho bài học
//   const totalLessonPages = Math.ceil(lessonResults.length / lessonsPerPage)

//   // Lấy danh sách bài học hiện tại
//   const indexOfLastLesson = currentLessonPage * lessonsPerPage
//   const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage
//   const currentLessons = lessonResults.slice(indexOfFirstLesson, indexOfLastLesson)

//   return (
//        <div className="container mx-auto p-6">
//          <h1 className="text-2xl font-bold mb-6">Đánh giá chung</h1>

//          {/* Phần cảnh báo */}
//          {(showExamWarning || showLessonWarning) && (
//            <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
//              <p className="font-semibold">
//                Bạn chưa hoàn thành tất cả các bài kiểm tra hoặc bài học. Hãy hoàn thành để cải thiện đánh giá tổng quan!
//              </p>
//            </div>
//          )}

//          {/* Đánh giá chung */}
//          <div className="bg-white shadow p-6 rounded-lg mb-6">
//            <h3 className="text-lg font-semibold mb-4">Đánh giá chung</h3>
//            <div className="flex items-center gap-4">
//              <p>
//                <span className="font-bold">Tỷ lệ bài thi đạt/không đạt:</span>{' '}
//                {examResults.length > 0 ? `${examCompletionRate.toFixed(2)}%` : 'Chưa có bài thi'}
//              </p>
//              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${examBadge.color}`}>
//                {examBadge.icon}
//                <span className="ml-2">{examBadge.text}</span>
//              </span>
//            </div>
//            <div className="flex items-center gap-4 mt-2">
//              <p>
//                <span className="font-bold">Điểm trung bình các bài thi:</span>{' '}
//                {averageExamScore.toFixed(2)}%
//              </p>
//            </div>
//            <div className="flex items-center gap-4 mt-2">
//              <p>
//                <span className="font-bold">Phần trăm bài thi đã thực hiện:</span>{' '}
//                {percentageExamsAttempted.toFixed(2)}%
//              </p>
//            </div>
//            <div className="flex items-center gap-4 mt-2">
//              <p>
//                <span className="font-bold">Tỷ lệ hoàn thành bài học:</span>{' '}
//                {lessonResults.length > 0 ? `${lessonCompletionRate.toFixed(2)}%` : 'Chưa có bài học'}
//              </p>
//              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${lessonBadge.color}`}>
//                {lessonBadge.icon}
//                <span className="ml-2">{lessonBadge.text}</span>
//              </span>
//            </div>
//          </div>

//          {/* Biểu đồ */}
//          <div className="w-2/3 h-2/3 mx-auto">
//            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Kết quả bài thi</h3>
//                <Doughnut data={examData} />
//              </div>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Tiến độ bài học</h3>
//                <Doughnut data={lessonData} />
//              </div>
//            </div>
//          </div>

//          {/* Tabs cho chi tiết */}
//          <Tabs>
//            <TabList>
//              <Tab>Bài thi</Tab>
//              <Tab>Bài học</Tab>
//            </TabList>

//            {/* Tab Bài thi */}
//            <TabPanel>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Kết quả bài thi</h3>
//                {examResults.length === 0 ? (
//                  <p>Không có bài thi nào trong khóa học này.</p>
//                ) : (
//                  <>
//                    {currentExams.map((exam) => {
//                      const scores = groupedScores[exam.examId] || []
//                      return (
//                        <div key={exam.examId} className="border p-4 rounded-lg mb-4">
//                          <h4 className="font-semibold mb-2">{exam.studyItemName}</h4>
//                          <p>
//                            <span className="font-bold">Điểm cao nhất:</span>{' '}
//                            {exam.highestScore !== null ? `${exam.highestScore} / ${exam.maxScore}` : '-'}
//                          </p>
//                          <p>
//                            <span className="font-bold">Điểm cần đạt:</span> {exam.passingScore}
//                          </p>
//                          <p
//                            className={`font-semibold ${
//                              exam.result === 'Pass'
//                                ? 'text-green-500'
//                                : exam.result === 'Fail'
//                                ? 'text-red-500'
//                                : 'text-gray-500'
//                            }`}
//                          >
//                            Kết quả: {exam.result === 'Pass' ? 'Đạt' : exam.result === 'Fail' ? 'Không đạt' : 'Chưa làm'}
//                          </p>
//                          {/* Luôn hiển thị bảng, ngay cả khi chưa có lần làm bài */}
//                          <div className="overflow-x-auto">
//                            <table className="min-w-full table-fixed divide-y divide-gray-200 mt-4">
//                              <thead className="bg-gray-50">
//                                <tr>
//                                  <th
//                                    scope="col"
//                                    className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Lần làm bài
//                                  </th>
//                                  <th
//                                    scope="col"
//                                    className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Điểm
//                                  </th>
//                                  <th
//                                    scope="col"
//                                    className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Thay đổi
//                                  </th>
//                                </tr>
//                              </thead>
//                              <tbody className="bg-white divide-y divide-gray-200">
//                                {scores.length > 0 ? (
//                                  scores.map((score, index) => {
//                                    const previousScore = index > 0 ? scores[index - 1].totalScore : null
//                                    let changeIndicator = ''
//                                    let changeColor = ''

//                                    if (previousScore !== null) {
//                                      if (score.totalScore > previousScore) {
//                                        changeIndicator = '↑ Tăng'
//                                        changeColor = 'text-green-500'
//                                      } else if (score.totalScore < previousScore) {
//                                        changeIndicator = '↓ Giảm'
//                                        changeColor = 'text-red-500'
//                                      } else {
//                                        changeIndicator = '→ Không đổi'
//                                        changeColor = 'text-gray-500'
//                                      }
//                                    } else {
//                                      changeIndicator = '-'
//                                      changeColor = 'text-gray-500'
//                                    }

//                                    return (
//                                      <tr key={index}>
//                                        <td className="px-6 py-4 whitespace-nowrap">{score.attempt}</td>
//                                        <td className="px-6 py-4 whitespace-nowrap">{score.totalScore}</td>
//                                        <td className={`px-6 py-4 whitespace-nowrap ${changeColor} font-medium`}>
//                                          {changeIndicator}
//                                        </td>
//                                      </tr>
//                                    )
//                                  })
//                                ) : (
//                                  // Hiển thị khi chưa có lần làm bài nào
//                                  <tr>
//                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500" colSpan={3}>
//                                      Chưa có lần làm bài nào.
//                                    </td>
//                                  </tr>
//                                )}
//                              </tbody>
//                            </table>
//                          </div>
//                        </div>
//                      )
//                    })}

//                    {/* Phân trang cho bài thi */}
//                    <div className="flex justify-center mt-4">
//                      <Pagination
//                        count={totalExamPages}
//                        page={currentExamPage}
//                        onChange={(event, value) => setCurrentExamPage(value)}
//                        variant="outlined"
//                        shape="rounded"
//                        siblingCount={0}
//                        boundaryCount={1}
//                      />
//                    </div>
//                  </>
//                )}
//              </div>
//            </TabPanel>

//            {/* Tab Bài học */}
//            <TabPanel>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Tiến độ bài học</h3>
//                {lessonResults.length === 0 ? (
//                  <p>Không có bài học nào trong khóa học này.</p>
//                ) : (
//                  <>
//                    {currentLessons.map((lesson) => (
//                      <div key={lesson.lessonId} className="border p-4 rounded-lg mb-4">
//                        <h4 className="font-semibold mb-2">{lesson.lessonName}</h4>
//                        <p
//                          className={`font-semibold ${
//                            lesson.status === 'Completed' ? 'text-green-500' : 'text-gray-500'
//                          }`}
//                        >
//                          Trạng thái: {lesson.status === 'Completed' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
//                        </p>
//                      </div>
//                    ))}

//                    {/* Phân trang cho bài học */}
//                    <div className="flex justify-center mt-4">
//                      <Pagination
//                        count={totalLessonPages}
//                        page={currentLessonPage}
//                        onChange={(event, value) => setCurrentLessonPage(value)}
//                        variant="outlined"
//                        shape="rounded"
//                        siblingCount={0}
//                        boundaryCount={1}
//                      />
//                    </div>
//                  </>
//                )}
//              </div>
//            </TabPanel>
//          </Tabs>
//        </div>
//   )
// }

// export default CourseDetailsPage

// /* eslint-disable multiline-ternary */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// /* eslint-disable no-prototype-builtins */
// /* eslint-disable @typescript-eslint/prefer-optional-chain */
// /* eslint-disable @typescript-eslint/no-misused-promises */
// /* eslint-disable @typescript-eslint/restrict-template-expressions */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// /* eslint-disable @typescript-eslint/strict-boolean-expressions */
// /*
//    ========================================================================== */
// import React, { useEffect, useState, useRef } from 'react'
// import { useParams } from 'react-router-dom'
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
// import 'react-tabs/style/react-tabs.css'
// import { Doughnut, Bar, Line } from 'react-chartjs-2'
// import { getUserExamResults, getUserLessonResults, getUserExamScores } from '../../../api/post/post.api'
// import { FaStar, FaThumbsUp, FaExclamationCircle, FaFrown } from 'react-icons/fa'
// import { Pagination } from '@mui/material'
// import { useTranslation } from 'react-i18next'

// interface ExamResult {
//   examId: number
//   highestScore: number | null
//   passingScore: number
//   maxScore: number
//   result: string | null
//   studyItemName: string
// }

// interface ExamScore {
//   examId: number
//   attempt: number
//   totalScore: number
//   studyItemName: string
// }

// interface LessonResult {
//   lessonId: number
//   lessonName: string
//   status: string
// }

// const CourseDetailsPage: React.FC = () => {
//   const { t } = useTranslation()
//   const { courseId } = useParams<{ courseId: string }>()
//   const [examResults, setExamResults] = useState<ExamResult[]>([])
//   const [examScores, setExamScores] = useState<ExamScore[]>([])
//   const [lessonResults, setLessonResults] = useState<LessonResult[]>([])
//   const [examCompletionRate, setExamCompletionRate] = useState<number>(0)
//   const [lessonCompletionRate, setLessonCompletionRate] = useState<number>(0)
//   const [showExamWarning, setShowExamWarning] = useState<boolean>(false)
//   const [showLessonWarning, setShowLessonWarning] = useState<boolean>(false)
//   // Ref cho biểu đồ đường
//   const lineChartRef = useRef<HTMLDivElement>(null)
//   // Thêm state cho điểm trung bình và phần trăm bài thi đã thực hiện
//   const [averageExamScore, setAverageExamScore] = useState<number>(0)
//   const [percentageExamsAttempted, setPercentageExamsAttempted] = useState<number>(0)

//   // State cho việc chọn bài thi để hiển thị biểu đồ đường
//   const [selectedExamId, setSelectedExamId] = useState<number | null>(null)

//   // Pagination states for Exams
//   const [currentExamPage, setCurrentExamPage] = useState(1)
//   const examsPerPage = 5

//   // Pagination states for Lessons
//   const [currentLessonPage, setCurrentLessonPage] = useState(1)
//   const lessonsPerPage = 5

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch Exam Results
//         const examResponse = await getUserExamResults(parseInt(courseId || '0', 10))
//         let exams = examResponse.data.examResults

//         // Chuyển đổi highestScore, passingScore và maxScore sang số
//         exams = exams.map((exam: any) => ({
//           ...exam,
//           highestScore: exam.highestScore !== null ? Number(exam.highestScore) : null,
//           passingScore: Number(exam.passingScore),
//           maxScore: Number(exam.maxScore)
//         }))

//         setExamResults(exams)

//         // Tính tỷ lệ hoàn thành bài thi
//         if (exams.length > 0) {
//           const totalExams = exams.length
//           const passedExams = exams.filter((exam: ExamResult) => exam.result === 'Pass').length
//           setExamCompletionRate((passedExams / totalExams) * 100)

//           // Tính điểm trung bình dựa trên công thức đã cung cấp
//           const attemptedExams = exams.filter((exam: ExamResult) => exam.highestScore !== null)
//           const totalHighestScores = attemptedExams.reduce((sum: number, exam: ExamResult) => sum + (exam.highestScore || 0), 0)
//           const totalMaxScores = attemptedExams.reduce((sum: number, exam: ExamResult) => sum + (exam.maxScore || 0), 0)
//           const averageScore = totalMaxScores > 0 ? (totalHighestScores / totalMaxScores) * 100 : 0
//           setAverageExamScore(averageScore)

//           // Tính phần trăm bài thi đã thực hiện
//           const attemptedExamsCount = attemptedExams.length
//           const percentageAttempted = (attemptedExamsCount / totalExams) * 100
//           setPercentageExamsAttempted(percentageAttempted)

//           // Hiển thị cảnh báo nếu có bài thi chưa hoàn thành hoặc không đạt
//           setShowExamWarning(exams.some((exam: ExamResult) => exam.result === 'Fail' || exam.highestScore === null))
//         } else {
//           setExamCompletionRate(0)
//           setAverageExamScore(0)
//           setPercentageExamsAttempted(0)
//           setShowExamWarning(false)
//         }

//         // Fetch Exam Scores
//         const scoresResponse = await getUserExamScores(parseInt(courseId || '0', 10))
//         setExamScores(scoresResponse.data.examScores)

//         // Fetch Lesson Results
//         const lessonResponse = await getUserLessonResults(parseInt(courseId || '0', 10))
//         const lessons = lessonResponse.data.lessonResults
//         setLessonResults(lessons)

//         // Tính tỷ lệ hoàn thành bài học
//         if (lessons.length > 0) {
//           const totalLessons = lessons.length
//           const completedLessons = lessons.filter((lesson: LessonResult) => lesson.status === 'Completed').length
//           setLessonCompletionRate((completedLessons / totalLessons) * 100)

//           // Hiển thị cảnh báo nếu có bài học chưa hoàn thành
//           setShowLessonWarning(lessons.some((lesson: LessonResult) => lesson.status === 'Not Attempted'))
//         } else {
//           setLessonCompletionRate(0)
//           setShowLessonWarning(false)
//         }
//       } catch (err) {
//         console.error(err)
//       }
//     }

//     fetchData()
//   }, [courseId])

//   // Nhóm điểm theo examId để so sánh
//   const groupedScores = examScores.reduce((acc: Record<number, ExamScore[]>, score) => {
//     acc[score.examId] = acc[score.examId] || []
//     acc[score.examId].push(score)
//     return acc
//   }, {})

//   // Dữ liệu cho biểu đồ kết quả bài thi
//   const examData = {
//     labels: ['Đạt', 'Không đạt', 'Chưa làm'],
//     datasets: [
//       {
//         label: 'Kết quả bài thi',
//         data: [
//           examResults.filter((exam) => exam.result === 'Pass').length,
//           examResults.filter((exam) => exam.result === 'Fail').length,
//           examResults.filter((exam) => exam.highestScore === null).length // Chưa làm
//         ],
//         backgroundColor: ['#4CAF50', '#F44336', '#FFC107']
//       }
//     ]
//   }

//   // Dữ liệu cho biểu đồ tiến độ bài học
//   const lessonData = {
//     labels: ['Đã hoàn thành', 'Chưa làm'],
//     datasets: [
//       {
//         label: 'Tiến độ bài học',
//         data: [
//           lessonResults.filter((lesson) => lesson.status === 'Completed').length,
//           lessonResults.filter((lesson) => lesson.status === 'Not Attempted').length
//         ],
//         backgroundColor: ['#4CAF50', '#FFC107']
//       }
//     ]
//   }

//   // Dữ liệu cho biểu đồ cột hiển thị điểm trung bình và phần trăm bài thi đã thực hiện
//   const averageData = {
//     labels: ['Điểm trung bình (%)', 'Bài thi đã thực hiện (%)'],
//     datasets: [
//       {
//         label: 'Điểm trung bình (%)',
//         data: [averageExamScore.toFixed(2), 0], // Add 0 for the second label
//         backgroundColor: ['#36A2EB', '#36A2EB'] // Ensure both bars have the same color
//       },
//       {
//         label: 'Bài thi đã thực hiện (%)',
//         data: [0, percentageExamsAttempted.toFixed(2)], // Add 0 for the first label
//         backgroundColor: ['#4CAF50', '#4CAF50'] // Ensure both bars have the same color
//       }
//     ]
//   }

//   // Dữ liệu cho biểu đồ đường hiển thị điểm số qua các lần làm bài
//   const lineData = selectedExamId
//     ? {
//         labels: examScores
//           .filter((score) => score.examId === selectedExamId)
//           .map((score) => `Lần ${score.attempt}`),
//         datasets: [
//           {
//             label: 'Điểm số qua các lần làm bài',
//             data: examScores
//               .filter((score) => score.examId === selectedExamId)
//               .map((score) => score.totalScore),
//             fill: false,
//             borderColor: '#4CAF50'
//           }
//         ]
//       }
//     : null

//   // Lấy huy hiệu dựa trên tỷ lệ hoàn thành
//   const getCompletionBadge = (rate: number) => {
//     if (rate >= 90) {
//       return { text: 'Xuất sắc', color: 'bg-green-100 text-green-800', icon: <FaStar /> }
//     }
//     if (rate >= 75) {
//       return { text: 'Tốt', color: 'bg-blue-100 text-blue-800', icon: <FaThumbsUp /> }
//     }
//     if (rate >= 50) {
//       return { text: 'Trung bình', color: 'bg-yellow-100 text-yellow-800', icon: <FaExclamationCircle /> }
//     }
//     return { text: 'Cần cải thiện', color: 'bg-red-100 text-red-800', icon: <FaFrown /> }
//   }

//   const examBadge = getCompletionBadge(examCompletionRate)
//   const lessonBadge = getCompletionBadge(lessonCompletionRate)

//   // Tính tổng số trang cho bài thi
//   const totalExamPages = Math.ceil(examResults.length / examsPerPage)

//   // Lấy danh sách bài thi hiện tại
//   const indexOfLastExam = currentExamPage * examsPerPage
//   const indexOfFirstExam = indexOfLastExam - examsPerPage
//   const currentExams = examResults.slice(indexOfFirstExam, indexOfLastExam)

//   // Tính tổng số trang cho bài học
//   const totalLessonPages = Math.ceil(lessonResults.length / lessonsPerPage)

//   // Lấy danh sách bài học hiện tại
//   const indexOfLastLesson = currentLessonPage * lessonsPerPage
//   const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage
//   const currentLessons = lessonResults.slice(indexOfFirstLesson, indexOfLastLesson)

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: {
//         beginAtZero: true
//       },
//       y: {
//         beginAtZero: true
//       }
//     }
//   }

//   const lineOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: {
//         beginAtZero: true
//       },
//       y: {
//         beginAtZero: true
//       }
//     }
//   }

//   const doughnutOptions = {
//     responsive: true,
//     maintainAspectRatio: false
//   }

//   const handleViewChartClick = (examId: number) => {
//     setSelectedExamId(examId)
//     setTimeout(() => {
//       lineChartRef.current?.scrollIntoView({ behavior: 'smooth' })
//     }, 100)
//   }

//   return (
//        <div className="container mx-auto p-6">
//          <h1 className="text-2xl font-bold mb-6">Đánh giá chung</h1>

//          {/* Phần cảnh báo */}
//          {(showExamWarning || showLessonWarning) && (
//            <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
//              <p className="font-semibold">
//                Bạn chưa hoàn thành tất cả các bài kiểm tra hoặc bài học. Hãy hoàn thành để cải thiện đánh giá tổng quan!
//              </p>
//            </div>
//          )}

//          {/* Đánh giá chung */}
//          <div className="bg-white shadow p-6 rounded-lg mb-6">
//            <h3 className="text-lg font-semibold mb-4">Đánh giá chung</h3>
//            <div className="flex items-center gap-4">
//              <p>
//                <span className="font-bold">Tỷ lệ bài thi đạt/không đạt:</span>{' '}
//                {examResults.length > 0 ? `${examCompletionRate.toFixed(2)}%` : 'Chưa có bài thi'}
//              </p>
//              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${examBadge.color}`}>
//                {examBadge.icon}
//                <span className="ml-2">{examBadge.text}</span>
//              </span>
//            </div>
//            <div className="flex items-center gap-4 mt-2">
//              <p>
//                <span className="font-bold">Điểm trung bình các bài thi:</span>{' '}
//                {averageExamScore.toFixed(2)}%
//              </p>
//            </div>
//            <div className="flex items-center gap-4 mt-2">
//              <p>
//                <span className="font-bold">Phần trăm bài thi đã thực hiện:</span>{' '}
//                {percentageExamsAttempted.toFixed(2)}%
//              </p>
//            </div>
//            <div className="flex items-center gap-4 mt-2">
//              <p>
//                <span className="font-bold">Tỷ lệ hoàn thành bài học:</span>{' '}
//                {lessonResults.length > 0 ? `${lessonCompletionRate.toFixed(2)}%` : 'Chưa có bài học'}
//              </p>
//              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${lessonBadge.color}`}>
//                {lessonBadge.icon}
//                <span className="ml-2">{lessonBadge.text}</span>
//              </span>
//            </div>
//          </div>

//           {/* Biểu đồ cột */}
//           <div className="bg-white shadow p-6 rounded-lg mb-6" style={{ height: '300px' }}>
//             <h3 className="text-lg font-semibold mb-4">Tổng Quan Kết Quả Học Tập</h3>
//             <div className="relative w-full h-full pb-6">
//               <Bar data={averageData} options={options} />
//             </div>
//           </div>

//           {/* Biểu đồ */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div className="bg-white shadow p-6 rounded-lg overflow-hidden" style={{ height: '300px' }}>
//               <h3 className="text-lg font-semibold mb-4">Kết quả các bài thi</h3>
//               <div className="relative w-full h-full pb-6">
//                 <Doughnut data={examData} options={doughnutOptions} />
//               </div>
//             </div>
//             <div className="bg-white shadow p-6 rounded-lg overflow-hidden" style={{ height: '300px' }}>
//               <h3 className="text-lg font-semibold mb-4">Tiến độ bài học</h3>
//               <div className="relative w-full h-full pb-6">
//                 <Doughnut data={lessonData} options={doughnutOptions} />
//               </div>
//             </div>
//           </div>

//           {/* Biểu đồ đường */}
//           {selectedExamId && lineData && (
//             <div ref={lineChartRef} className="bg-white shadow p-6 rounded-lg mb-6 scroll-mt-24" style={{ height: '300px', width: '100%' }}>
//               <h3 className="text-lg font-semibold truncate">
//                 Điểm số qua các lần làm bài:
//               </h3>
//               <h3 className="text-sm truncate mb-4 ">
//                 {examResults.find((exam) => exam.examId === selectedExamId)?.studyItemName}
//               </h3>
//               <div className="relative w-full h-full pb-12">
//                 <Line data={lineData} options={lineOptions} />
//               </div>
//             </div>
//           )}

//          {/* Tabs cho chi tiết */}
//          <Tabs>
//            <TabList>
//              <Tab>Bài thi</Tab>
//              <Tab>Bài học</Tab>
//            </TabList>

//            {/* Tab Bài thi */}
//            <TabPanel>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Kết quả bài thi</h3>
//                {examResults.length === 0 ? (
//                  <p>Không có bài thi nào trong khóa học này.</p>
//                ) : (
//                  <>
//                    {currentExams.map((exam) => {
//                      const scores = groupedScores[exam.examId] || []
//                      return (
//                        <div key={exam.examId} className="border p-4 rounded-lg mb-4">
//                          <h4 className="font-semibold mb-2">{exam.studyItemName}</h4>
//                          <p>
//                            <span className="font-bold">Điểm cao nhất:</span>{' '}
//                            {exam.highestScore !== null ? `${exam.highestScore} / ${exam.maxScore}` : '-'}
//                          </p>
//                          <p>
//                            <span className="font-bold">Điểm cần đạt:</span> {exam.passingScore}
//                          </p>
//                          <p
//                            className={`font-semibold ${
//                              exam.result === 'Pass'
//                                ? 'text-green-500'
//                                : exam.result === 'Fail'
//                                ? 'text-red-500'
//                                : 'text-gray-500'
//                            }`}
//                          >
//                            Kết quả: {exam.result === 'Pass' ? 'Đạt' : exam.result === 'Fail' ? 'Không đạt' : 'Chưa làm'}
//                          </p>
//                          {/* Nút xem biểu đồ điểm số */}
//                          <button
//                             className="text-blue-500 hover:underline mt-2"
//                             onClick={() => handleViewChartClick(exam.examId)}
//                           >
//                             Xem biểu đồ điểm số
//                           </button>
//                          {/* Luôn hiển thị bảng, ngay cả khi chưa có lần làm bài */}
//                          <div className="overflow-x-auto">
//                            <table className="min-w-full table-fixed divide-y divide-gray-200 mt-4">
//                              <thead className="bg-gray-50">
//                                <tr>
//                                  <th
//                                    scope="col"
//                                    className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Lần làm bài
//                                  </th>
//                                  <th
//                                    scope="col"
//                                    className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Điểm
//                                  </th>
//                                  <th
//                                    scope="col"
//                                    className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                  >
//                                    Thay đổi
//                                  </th>
//                                </tr>
//                              </thead>
//                              <tbody className="bg-white divide-y divide-gray-200">
//                                {scores.length > 0 ? (
//                                  scores.map((score, index) => {
//                                    const previousScore = index > 0 ? scores[index - 1].totalScore : null
//                                    let changeIndicator = ''
//                                    let changeColor = ''

//                                    if (previousScore !== null) {
//                                      if (score.totalScore > previousScore) {
//                                        changeIndicator = '↑ Tăng'
//                                        changeColor = 'text-green-500'
//                                      } else if (score.totalScore < previousScore) {
//                                        changeIndicator = '↓ Giảm'
//                                        changeColor = 'text-red-500'
//                                      } else {
//                                        changeIndicator = '→ Không đổi'
//                                        changeColor = 'text-gray-500'
//                                      }
//                                    } else {
//                                      changeIndicator = '-'
//                                      changeColor = 'text-gray-500'
//                                    }

//                                    return (
//                                      <tr key={index}>
//                                        <td className="px-6 py-4 whitespace-nowrap">{score.attempt}</td>
//                                        <td className="px-6 py-4 whitespace-nowrap">{score.totalScore}</td>
//                                        <td className={`px-6 py-4 whitespace-nowrap ${changeColor} font-medium`}>
//                                          {changeIndicator}
//                                        </td>
//                                      </tr>
//                                    )
//                                  })
//                                ) : (
//                                  // Hiển thị khi chưa có lần làm bài nào
//                                  <tr>
//                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500" colSpan={3}>
//                                      Chưa có lần làm bài nào.
//                                    </td>
//                                  </tr>
//                                )}
//                              </tbody>
//                            </table>
//                          </div>
//                        </div>
//                      )
//                    })}

//                    {/* Phân trang cho bài thi */}
//                    <div className="flex justify-center mt-4">
//                      <Pagination
//                        count={totalExamPages}
//                        page={currentExamPage}
//                        onChange={(event, value) => setCurrentExamPage(value)}
//                        variant="outlined"
//                        shape="rounded"
//                        siblingCount={0}
//                        boundaryCount={1}
//                      />
//                    </div>
//                  </>
//                )}
//              </div>
//            </TabPanel>

//            {/* Tab Bài học */}
//            <TabPanel>
//              <div className="bg-white shadow p-6 rounded-lg">
//                <h3 className="text-lg font-semibold mb-4">Tiến độ bài học</h3>
//                {lessonResults.length === 0 ? (
//                  <p>Không có bài học nào trong khóa học này.</p>
//                ) : (
//                  <>
//                    {currentLessons.map((lesson) => (
//                      <div key={lesson.lessonId} className="border p-4 rounded-lg mb-4">
//                        <h4 className="font-semibold mb-2">{lesson.lessonName}</h4>
//                        <p
//                          className={`font-semibold ${
//                            lesson.status === 'Completed' ? 'text-green-500' : 'text-gray-500'
//                          }`}
//                        >
//                          Trạng thái: {lesson.status === 'Completed' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
//                        </p>
//                      </div>
//                    ))}

//                    {/* Phân trang cho bài học */}
//                    <div className="flex justify-center mt-4">
//                      <Pagination
//                        count={totalLessonPages}
//                        page={currentLessonPage}
//                        onChange={(event, value) => setCurrentLessonPage(value)}
//                        variant="outlined"
//                        shape="rounded"
//                        siblingCount={0}
//                        boundaryCount={1}
//                      />
//                    </div>
//                  </>
//                )}
//              </div>
//            </TabPanel>
//          </Tabs>
//        </div>
//   )
// }

// export default CourseDetailsPage

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
import { getUserExamResults, getUserLessonResults, getUserExamScores, getEnrollmentByCourseId, getTeacherComment } from '../../../api/post/post.api'
import { FaStar, FaThumbsUp, FaExclamationCircle, FaFrown } from 'react-icons/fa'
import { Pagination } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { QuillEditorShow, QuillEditorTeacherComment } from 'pages/management/course/components/QuillEditor'

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

const CourseDetailsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Fetch Exam Results
  //       const examResponse = await getUserExamResults(parseInt(courseId || '0', 10))
  //       let exams = examResponse.data.examResults

  //       // Chuyển đổi highestScore, passingScore và maxScore sang số
  //       exams = exams.map((exam: any) => ({
  //         ...exam,
  //         highestScore: exam.highestScore !== null ? Number(exam.highestScore) : null,
  //         passingScore: Number(exam.passingScore),
  //         maxScore: Number(exam.maxScore)
  //       }))

  //       setExamResults(exams)

  //       // Tính tỷ lệ hoàn thành bài thi
  //       if (exams.length > 0) {
  //         const totalExams = exams.length
  //         const passedExams = exams.filter((exam: ExamResult) => exam.result === 'Pass').length
  //         setExamCompletionRate((passedExams / totalExams) * 100)

  //         // Tính điểm trung bình dựa trên công thức đã cung cấp
  //         const attemptedExams = exams.filter((exam: ExamResult) => exam.highestScore !== null)
  //         const totalHighestScores = attemptedExams.reduce((sum: number, exam: ExamResult) => sum + (exam.highestScore || 0), 0)
  //         const totalMaxScores = attemptedExams.reduce((sum: number, exam: ExamResult) => sum + (exam.maxScore || 0), 0)
  //         const averageScore = totalMaxScores > 0 ? (totalHighestScores / totalMaxScores) * 100 : 0
  //         setAverageExamScore(averageScore)

  //         // Tính phần trăm bài thi đã thực hiện
  //         const attemptedExamsCount = attemptedExams.length
  //         const percentageAttempted = (attemptedExamsCount / totalExams) * 100
  //         setPercentageExamsAttempted(percentageAttempted)

  //         // Hiển thị cảnh báo nếu có bài thi chưa hoàn thành hoặc không đạt
  //         setShowExamWarning(exams.some((exam: ExamResult) => exam.result === 'Fail' || exam.highestScore === null))
  //       } else {
  //         setExamCompletionRate(0)
  //         setAverageExamScore(0)
  //         setPercentageExamsAttempted(0)
  //         setShowExamWarning(false)
  //       }

  //       // Fetch Exam Scores
  //       const scoresResponse = await getUserExamScores(parseInt(courseId || '0', 10))
  //       setExamScores(scoresResponse.data.examScores)

  //       // Fetch Lesson Results
  //       const lessonResponse = await getUserLessonResults(parseInt(courseId || '0', 10))
  //       const lessons = lessonResponse.data.lessonResults
  //       setLessonResults(lessons)

  //       // Tính tỷ lệ hoàn thành bài học
  //       if (lessons.length > 0) {
  //         const totalLessons = lessons.length
  //         const completedLessons = lessons.filter((lesson: LessonResult) => lesson.status === 'Completed').length
  //         setLessonCompletionRate((completedLessons / totalLessons) * 100)

  //         // Hiển thị cảnh báo nếu có bài học chưa hoàn thành
  //         setShowLessonWarning(lessons.some((lesson: LessonResult) => lesson.status === 'Not Attempted'))
  //       } else {
  //         setLessonCompletionRate(0)
  //         setShowLessonWarning(false)
  //       }
  //     } catch (err) {
  //       console.error(err)
  //     }
  //   }

  //   fetchData()
  // }, [courseId])

  useEffect(() => {
    const checkEnrollment = async () => {
      if (courseId) {
        let enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]')
        if (enrollments.includes(parseInt(courseId, 10))) {
          // User is enrolled, proceed with fetching data
          fetchData()
        } else {
          const enrollment = await getEnrollmentByCourseId({ courseId })
          if (enrollment.data) {
            enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]')
            if (!enrollments.includes(parseInt(courseId, 10))) {
              enrollments.push(parseInt(courseId, 10))
            }
            localStorage.setItem('enrollments', JSON.stringify(enrollments))
            fetchData()
          } else {
            navigate('/dashboard-report')
          }
        }
      }
    }

    const fetchData = async () => {
      try {
        const teacherComment = await getTeacherComment(parseInt(courseId || '0', 10))
        setTeacherComment(teacherComment.data.teacherComment)

        // Fetch Exam Results
        const examResponse = await getUserExamResults(parseInt(courseId || '0', 10))
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
        const scoresResponse = await getUserExamScores(parseInt(courseId || '0', 10))
        setExamScores(scoresResponse.data.examScores)

        // Fetch Lesson Results
        const lessonResponse = await getUserLessonResults(parseInt(courseId || '0', 10))
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

    checkEnrollment()
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

  return (
          <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">{t('courseDetails.overview')}</h1>

            {/* Phần cảnh báo */}
            {(showExamWarning || showLessonWarning) && (
              <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
                <p className="font-semibold">
                  {t('courseDetails.incompleteWarning')}
                </p>
              </div>
            )}

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

            {teacherComment &&
            <div className="bg-white shadow p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">{t('courseDetails.showTeacherAssessment')}</h3>
                <div className='border-2 border-gray-100 rounded-sm'>
                  <QuillEditorShow
                    theme='bubble'
                    value={teacherComment}
                    // modules={modules}
                    // className='w-full pb-0 md:h-auto'
                    readOnly={true}
                />
                </div>
            </div>
            }

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
                              className={`font-semibold ${
                                exam.result === 'Pass'
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
                            className={`font-semibold ${
                              lesson.status === 'Completed' ? 'text-green-500' : 'text-gray-500'
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

export default CourseDetailsPage
