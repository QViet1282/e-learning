/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// import axios from 'axios'
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable-next-line no-trailing-spaces */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/comma-dangle */

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
// import { addNotification } from '../../redux/notification/notifySlice'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCategoryLessionsByCourse, getLessionByCategory, getLessionById, getEnrollmentByUserId, getProgressByEnrollmentId, addProgress, markCourseAsDone, createNotification, getCourseDetail, getDetailExamsOne } from 'api/post/post.api'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import LockIcon from '@mui/icons-material/Lock'
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone'
import { useTranslation } from 'react-i18next'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import NoteAltIcon from '@mui/icons-material/NoteAlt'
import HelpIcon from '@mui/icons-material/Help'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import 'react-circular-progressbar/dist/styles.css'
import { toast } from 'react-toastify'
import Tooltip from '@mui/material/Tooltip'
import MenuIcon from '@mui/icons-material/Menu'
// import Comment from 'components/comment'
import YouTube from 'react-youtube'
import { useMediaQuery } from 'react-responsive'
import ROUTES from 'routes/constant'
import { getFromLocalStorage } from 'utils/functions'
import { useTheme } from 'services/styled-themes'
// import Plyr from 'plyr-react'
import { relative } from 'path'
import { title } from 'process'
// import 'plyr-react/dist/plyr.css'
import QuizIcon from '@mui/icons-material/Quiz'
import ExamCard from '../home/components/ExamCard'
import { DataListExam } from 'api/post/post.interface'
import Detail from '../detail'
import ExamHistory from '../examHistory'
import ReactPlayer from 'react-player'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
declare global {
  interface Window {
    YT: any
  }
}
interface CourseData {
  assignBy: 1
  categoryCourseId: string
  categoryCourseName: string
  createdAt: Date
  description: string
  durationInMinute: number
  endDate: Date
  id: string
  locationPath: string
  name: string
  prepare: string
  price: number
  startDate: Date
  summary: string
  updatedAt: Date
}
const Learning = () => {
  const { theme } = useTheme()
  const [comment, setComment] = useState('')
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [numPages, setNumPages] = useState<number>(1)
  const location = useLocation()
  const navigate = useNavigate()
  const [lession, setLession] = useState<any>({})
  const [enrollData, setEnrollData] = useState<any>(null)
  const [lessionCategories, setLessionCategories] = useState<any[]>([])
  const [lessions, setLessions] = useState<any[]>([])
  const [activeIndexes, setActiveIndexes] = useState<number[]>([])
  const [activeDrop, setActiveDrop] = useState<string | null>(null)
  const [courseProgress, setCourseProgress] = useState<Array<{ lessionId: string, enrollmentId: any }>>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const isSmallScreen = useMediaQuery({ maxWidth: 767 })
  const watchRef = useRef<boolean>(false)
  const pdfContainerRef = useRef(null)
  const tt = useRef<any>({})
  const dispatch = useDispatch()
  const [comments, setComments] = useState([
    { name: 'Toan', content: 'so good' },
    { name: 'Hien', content: 'great wrork!' },
    { name: 'Quoc', content: 'nice try' }
  ])
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const courseID = location.pathname.split('/')[2]// nghĩa là lấy id của khóa học từ url /learning/:id
  // Hàm getCourseDetail sẽ gọi API để lấy thông tin chi tiết của khóa học dựa vào id lấy từ url

  useEffect(() => {
    const fetchData = async () => {
      const response = await getCourseDetail({ id: courseID })
      console.log('response', response.data)
      setCourseData(response.data)
    }
    fetchData()
  }, [location.pathname])
  const [confirmMessage, setConfirmMessage] = useState('')
  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  const userId = tokens?.id

  const getPdfFilePath = (fileName: string) => {
    try {
      return require(`../../assets/uploads/lessions/${fileName}`)
    } catch (error) {
      console.error(`Failed to load PDF file: ${fileName}`, error)
      return null
    }
  }
  const fetchFirstLessonId = async (id: string) => {
    try {
      const fetchedLessionCategories = await getCategoryLessionsByCourse({ id: courseData?.id }) // sau khi lấy dữ liệu khóa học thì sẽ lấy dữ liệu các bài học
      // Sort the categories by order
      const sortedCategories = fetchedLessionCategories.data.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      const firstCategory = sortedCategories[0]
      if (firstCategory) {
        const lessions = await getLessionByCategory({ id: firstCategory.id })
        if (lessions.data.length > 0) {
          // Sort the lessons by order
          const sortedLessions = lessions.data.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
          const firstLessonId = sortedLessions[0].id
          console.log('firstLessonOrder', sortedLessions[0].name)
          return firstLessonId
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching first lesson:', error)
      return null
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const fetchedLessionCategories = await getCategoryLessionsByCourse({ id: courseData?.id })
      setLessionCategories(fetchedLessionCategories.data)

      const promises = fetchedLessionCategories.data.map(async (category: { id: string }) => {
        const lessions = await getLessionByCategory({ id: category.id })
        return lessions.data
      })
      Promise.all(promises)
        .then((lessionsDataArray) => {
          setLessions(lessionsDataArray)
        })
        .catch((error) => {
          console.error('Error fetching lessions:', error)
        })
      if (enrollData) {
        const courseProgress = await getProgressByEnrollmentId({ id: enrollData.id })
        setCourseProgress(courseProgress.data.data)
      }
    }
    if (courseData) {
      fetchData()
    }
  }, [courseData, enrollData])

  // =========================================================================
  const hasPermissionToViewLesson = (newLessonId: number, courseProgress: any[], lessons: any[], firstLessonId: number) => {
    const drops = lessions.map(lessionArray => lessionArray.map((lession: { name: any, id: string, type: string, order: number, description: string, lessionCategoryId: number }) => ({ name: lession.name, id: lession.id, type: lession.type, order: lession.order, description: lession.description, lessionCategoryId: lession.lessionCategoryId })))
    const sortedDrops = drops.map(dropArray =>
      dropArray.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    )
    const flattenedSortedDrops = sortedDrops.flat()
    const lessonIds: number[] = flattenedSortedDrops.map(lesson => lesson.id)
    if (!lessonIds.includes(newLessonId)) {
      // toast.error('Lesson not found in the course')
      return false
    }
    console.log(lessonIds, 'lessonIds')
    const newLessonIndex = lessonIds.indexOf(newLessonId)
    console.log(newLessonIndex, 'newLessonIndex')
    const allPreviousLessonsCompleted = flattenedSortedDrops.slice(0, newLessonIndex).every(lesson => {
      const isCompleted = courseProgress.some(progress => progress.lessionId === lesson.id)
      if (isCompleted) {
        console.log(`Lesson ID ${lesson.id} is completed.`)
      }
      return isCompleted
    })
    console.log(allPreviousLessonsCompleted, 'allPreviousLessonsCompleted')
    if (!allPreviousLessonsCompleted && newLessonId !== firstLessonId) {
      toast.error('You need to complete all previous lessons before continuing')
      return false
    }
    return true
  }
  // =====================================
  // useEffect(() => {
  //   console.log('Running')
  //   let isMounted = true
  //   const lessonIds: Array<number | React.SetStateAction<null>> = []
  //   lessions.forEach((category) => {
  //     category.forEach((lesson: { id: number | React.SetStateAction<null> }) => {
  //       lessonIds.push(lesson.id)
  //     })
  //   })
  //   if (enrollData && lessions && lessonIds.length > 0) {
  //     const fetchData = async () => {
  //       const queryParams = new URLSearchParams(location.search)
  //       const newLessonId = Number(queryParams.get('id')) || 0
  //       const firstLessonId = await fetchFirstLessonId(courseData?.id ?? '')
  //       if (newLessonId) {
  //         const hasPermission = hasPermissionToViewLesson(newLessonId, courseProgress, lessions, firstLessonId)
  //         if (!hasPermission) {
  //           navigate(`?id=${firstLessonId}`, { state: { courseData }, replace: true })
  //         } else if (isMounted) {
  //           const fetchedLession = await getLessionById({ id: String(newLessonId) })
  //           console.log('fetchedLession____________', fetchedLession?.data.name)
  //           setActiveDrop(fetchedLession?.data.name)
  //           setLession(fetchedLession.data)
  //           console.log('check Lession --------------------------', fetchedLession.data)
  //           let categoryIndex = -1
  //           for (let i = 0; i < parts?.length; i++) {
  //             const part = parts[i]
  //             if (part.name === fetchedLession.data.categoryLessionName) {
  //               categoryIndex = i
  //               break
  //             }
  //           }
  //           setActiveIndexes(prevIndexes => [...prevIndexes, categoryIndex])
  //         }
  //       }
  //     }
  //     fetchData()
  //   }
  //   return () => {
  //     isMounted = false
  //   }
  // }, [courseProgress, location])
  useEffect(() => {
    console.log('Running')
    let isMounted = true
    const lessonIds: Array<number | React.SetStateAction<null>> = []
    lessions.forEach((category) => {
      category.forEach((lesson: { id: number | React.SetStateAction<null> }) => {
        lessonIds.push(lesson.id)
      })
    })
    if (enrollData && lessions && lessonIds.length > 0) {
      const fetchData = async () => {
        const queryParams = new URLSearchParams(location.search)
        const newLessonId = Number(queryParams.get('id')) || 0
        const firstLessonId = await fetchFirstLessonId(courseData?.id ?? '')
        if (newLessonId) {
          const hasPermission = hasPermissionToViewLesson(newLessonId, courseProgress, lessions, firstLessonId)
          if (!hasPermission) {
            navigate(`?id=${firstLessonId}`, { state: { courseData }, replace: true })
          } else if (isMounted) {
            const fetchedLession = await getLessionById({ id: String(newLessonId) })
            setActiveDrop(fetchedLession?.data.name)
            setLession(fetchedLession.data)
            let categoryIndex = -1
            for (let i = 0; i < parts?.length; i++) {
              const part = parts[i]
              if (part.name === fetchedLession.data.categoryLessionName) {
                categoryIndex = i
                break
              }
            }
            setActiveIndexes(prevIndexes => [...prevIndexes, categoryIndex])
          }
        }
      }
      fetchData()
    }
    return () => {
      isMounted = false
    }
  }, [courseProgress, location])
  // SỬA SCROLL
  let isCallingAPI = false
  const handleScroll = async () => {
    const pdfContainer = pdfContainerRef.current as HTMLElement | null

    if (pdfContainer && !isCallingAPI) {
      const { scrollTop, scrollHeight, clientHeight } = pdfContainer
  
      if (scrollTop + clientHeight >= scrollHeight / 2) {
        isCallingAPI = true // Đặt cờ để ngăn gọi API thêm
        await addProgressNoVideo()
        isCallingAPI = false // Reset cờ sau khi API hoàn thành
        pdfContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }

  const addProgressNoVideo = async () => {
    if (lession && enrollData) {
      const payload = {
        lessionId: lession?.id,
        enrollmentId: enrollData?.id
      }
      const queryParams = new URLSearchParams(location.search)
      const newLessonId = queryParams.get('id')
      // Kiểm tra xem bài học đã được xem chưa
      const isLessonCompleted = courseProgress.some(
        (progress) => Number(progress.lessionId) === Number(newLessonId)
      )
      // Nếu bài học đã hoàn thành, không gọi API nữa
      if (isLessonCompleted) {
        console.log('Tiến độ đã tồn tại, không cần gọi API')
        return
      }
      console.log('isLessonCompleted', isLessonCompleted)
      if (lession.type === 'PDF' && !isLessonCompleted) {
        try {
          const response = await addProgress(payload)
          setCourseProgress([...courseProgress, payload])
          const currentCategoryIndex = lessions.findIndex(category =>
            category.some((lesson: { id: any }) => lesson.id === lession.id)
          )
          const sortedLessions = [...lessions[currentCategoryIndex]].sort((a, b) => a.order - b.order)
          const currentLessonIndex = sortedLessions.findIndex(
            (lesson) => lesson.id === lession.id
          )

          const isLastLesson = currentCategoryIndex === lessions.length - 1 && currentLessonIndex === sortedLessions.length - 1
          // Fix_1000
          // Tìm tất cả các bài học chưa học
          const allLessons = lessions.flat()
          const uncompletedLessons = allLessons.filter(lesson => !courseProgress.some(progress => progress.lessionId === lesson.id))
          const isLastUncompletedLesson = uncompletedLessons.length === 1 && uncompletedLessons[0].id === lession.id
  
          if (isLastLesson || isLastUncompletedLesson) {
            const responseMark = await markCourseAsDone({ courseId: courseData?.id })
            // const responseNoti = await createNotification({ title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses' })
            console.log('responseMark', responseMark)
            // console.log('responseNoti', responseNoti)
            // if (responseMark && responseNoti) {
            if (responseMark) {
              // const data = {
              //   id: responseNoti.data.recipients.recipientId,
              //   notificationId: 1,
              //   status: false,
              //   updatedAt: new Date(),
              //   createdAt: new Date(),
              //   userId,
              //   notificationDetails: { id: 1, title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses', createdAt: new Date(), updatedAt: new Date() }
              // }
              // dispatch(addNotification(data))
              toast.success('Congratulations! Course completed!')
            }
          }
        } catch (error) {
          console.log('error hoc lai>>>', error)
        }
      }
    }
  }

  useEffect(() => {
    const pdfContainer = pdfContainerRef.current as HTMLElement | null

    const checkPDFLoaded = () => {
      if (pdfContainer) {
        if (pdfContainer.scrollHeight > pdfContainer.clientHeight) {
          console.log('PDF has multiple pages')
          pdfContainer.addEventListener('scroll', handleScroll)
        } else {
          addProgressNoVideo()
        }
        clearInterval(intervalId)
      }
    }

    const intervalId = setInterval(checkPDFLoaded, 500)

    return () => {
      clearInterval(intervalId)
      if (pdfContainer) {
        pdfContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [lession.id])

  const opts = {
    height: '750',
    width: '100%',
    playerVars: {
      autoplay: 0,
      allowFullscreen: true
    }
  }

  function onDocumentLoadSuccess ({ numPages }: { numPages: number | null }) {
    setNumPages(numPages ?? 0)
  }

  const handleOpenCommentForm = () => {
    setIsCommentModalOpen(true)
  }

  const handleCloseCommentForm = () => {
    setIsCommentModalOpen(false)
  }
  const handlePress = () => {
    setIsCommentModalOpen(false)
  }
  const { t } = useTranslation()

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded)
  }

  const handleComment = (event: { key: string, preventDefault: () => void }) => {
    if (event.key === 'Enter') {
      event.preventDefault()

      const user = localStorage.getItem('tokens')
      const parsedUser = user ? JSON.parse(user) : null
      if (comment.trim() !== '') {
        const newComment = {
          name: parsedUser.username,
          content: comment
        }
        setComments([...comments, newComment])
        setComment('')
      }
    }
  }

  useEffect(() => {
    if (!courseData?.id) {
      return
    }

    console.log('Running TO:', courseData.id)

    const fetchEnrollmentData = async () => {
      try {
        const enrollments = await getEnrollmentByUserId()
        const enrollment = enrollments.data.find(
          (enrollment: { courseId: string | undefined }) => enrollment.courseId === courseData.id
        )
        if (enrollment) {
          setEnrollData(enrollment)
        } else {
          toast.error('You haven\'t enrolled in this course yet.')
          navigate(ROUTES.homePage)
        }
      } catch (error) {
        console.error('Error fetching enrollment data:', error)
        alert('An error occurred while fetching enrollment data.')
      }
    }

    fetchEnrollmentData()
  }, [courseData?.id])
  useEffect(() => {
    document.body.classList.add('overflow-y-hidden')
    return () => {
      document.body.classList.remove('overflow-y-hidden')
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const parsedDate = new Date(lession.updatedAt)
  const formattedDate = `${parsedDate.getMonth() + 1 < 10 ? '0' : ''}${parsedDate.getMonth() + 1}-${parsedDate.getDate() < 10 ? '0' : ''}${parsedDate.getDate()}-${parsedDate.getFullYear()}`

  const parts = lessionCategories.sort((a, b) => a.order - b.order).map(category => ({ id: category.id, name: category.name, order: category.order }))
  const drops = lessions.map(lessionArray => lessionArray.map((lession: { name: any, id: string, type: string, order: number, description: string, lessionCategoryId: number }) => ({ name: lession.name, id: lession.id, type: lession.type, order: lession.order, description: lession.description, lessionCategoryId: lession.lessionCategoryId })))
  const sortedDrops = drops.map(dropArray =>
    dropArray.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
  )
  const handleClick = (index: number) => {
    setActiveIndexes(activeIndexes.includes(index)
      ? activeIndexes.filter(activeIndex => activeIndex !== index)
      : [...activeIndexes, index])
  }
  const handleDropClick = async (drop: { name: string, id: string, order: number, categoryOrder: number }, dropIndex: number) => {
    setCurrentComponent('examCard')
    const pdfContainer = pdfContainerRef.current as HTMLElement | null
    if (pdfContainer) {
      pdfContainer.scrollTop = 0
    }
    const previousLessonsInSameCategory = lessions[drop.categoryOrder].filter(
      (lesson: { order: number }) => lesson.order < drop.order
    )
    const previousLessonsInPreviousCategories = lessions
      .slice(0, drop.categoryOrder)
      .flatMap(category => category)
    const previousLessons = [...previousLessonsInSameCategory, ...previousLessonsInPreviousCategories]
    const isAllowedToContinue = previousLessons.every((lesson: { id: string }) =>
      courseProgress.some((progress: { lessionId: string }) => progress.lessionId === lesson.id)
    )
    if (!isAllowedToContinue) {
      toast.error('You need to complete the previous lessons before continuing.')
      return
    }
    setActiveDrop(drop.name)
    console.log('Drop', drop.name)
    navigate(`?id=${drop.id}`, { state: { courseData }, replace: true })
  }

  const handleBackToCourse = () => {
    navigate(`/courses/${courseData?.id}`)
  }
  const totalCourses = lessions.reduce((total, currentCategoryCourses) => total + currentCategoryCourses.length, 0)
  const completedLessonsCount = courseProgress.length
  const percentage = parseFloat((completedLessonsCount / totalCourses * 100).toFixed(2))

  const handlePreviousClick = () => {
    setCurrentComponent('examCard')
    const currentCategoryIndex = lessions.findIndex(category =>
      category.some((lesson: { id: any }) => lesson.id === lession.id)
    )

    // Sort lessons in the current category by order
    const sortedLessions = [...lessions[currentCategoryIndex]].sort((a, b) => a.order - b.order)
    const currentLessonIndex = sortedLessions.findIndex(
      (lesson: { id: any }) => lesson.id === lession.id
    )

    if (currentLessonIndex > 0) {
      const previousLesson = sortedLessions[currentLessonIndex - 1]
      navigate(`?id=${previousLesson.id}`, { state: { courseData } })
    } else if (currentCategoryIndex > 0) {
      const previousCategoryIndex = currentCategoryIndex - 1

      // Sort lessons in the previous category by order
      const sortedPreviousCategoryLessions = [...lessions[previousCategoryIndex]].sort((a, b) => a.order - b.order)
      const previousLesson = sortedPreviousCategoryLessions[sortedPreviousCategoryLessions.length - 1]

      if (!activeIndexes.includes(previousCategoryIndex)) {
        setActiveIndexes(prevIndexes => [...prevIndexes, previousCategoryIndex])
      }
      navigate(`?id=${previousLesson.id}`, { state: { courseData }, replace: true })
    }
    setActiveDrop(lession.name)
  }

  const handleNextClick = useCallback(async () => {
    setCurrentComponent('examCard')
    const pdfContainer = pdfContainerRef.current as HTMLElement | null
    if (pdfContainer) {
      pdfContainer.scrollTop = 0
    }
    const currentCategoryIndex = lessions.findIndex(category =>
      category.some((lesson: { id: any }) => lesson.id === lession.id)
    )

    // Sort lessons in the current category by order
    const sortedLessions = [...lessions[currentCategoryIndex]].sort((a, b) => a.order - b.order)
    const currentLessonIndex = sortedLessions.findIndex(
      (lesson: { id: any }) => lesson.id === lession.id
    )

    if (currentLessonIndex < sortedLessions.length - 1) {
      const nextLesson = sortedLessions[currentLessonIndex + 1]
      const isCompleted = courseProgress.some(
        (progress: { lessionId: string }) => progress.lessionId === sortedLessions[currentLessonIndex].id
      )

      if (!isCompleted) {
        toast.warn('You have to complete the current lesson before moving to the next one')
        return
      }

      navigate(`?id=${nextLesson.id}`, { state: { courseData }, replace: true })
    } else if (currentCategoryIndex < lessions.length - 1) {
      const currentLesson = sortedLessions[currentLessonIndex]

      // Check if the current lesson is already in courseProgress
      const isCompleted = courseProgress.some(
        (progress: { lessionId: string }) => progress.lessionId === currentLesson.id
      )

      if (!isCompleted) {
        toast.warn('You have to complete the current lesson before moving to the next one')
        return
      }
      const nextCategoryIndex = currentCategoryIndex + 1

      // Sort lessons in the next category by order
      const sortedNextCategoryLessions = [...lessions[nextCategoryIndex]].sort((a, b) => a.order - b.order)

      if (!activeIndexes.includes(nextCategoryIndex)) {
        setActiveIndexes(prevIndexes => [...prevIndexes, nextCategoryIndex])
      }

      if (sortedNextCategoryLessions.length > 0) {
        const nextLesson = sortedNextCategoryLessions[0]
        navigate(`?id=${nextLesson.id}`, { state: { courseData }, replace: true })
      } else {
        console.error('Next category does not contain any lessons')
      }
    } else {
      // toast.success('Congratulations! Course completed!')
    }
    setActiveDrop(lession.name)
  }, [lessions, lession, courseProgress, enrollData, activeIndexes])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        handleNextClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleNextClick])
  useEffect(() => {
    const isMounted = { current: true }

    const handleBackButtonEvent = (e: { preventDefault: () => void }) => {
      e.preventDefault()
      if (isMounted.current) {
        navigate(`/courses/${courseData?.id}`, { replace: true })
      }
    }

    window.onpopstate = handleBackButtonEvent

    return () => {
      isMounted.current = false
      window.onpopstate = null
    }
  }, [])
  // const videoSrc: Plyr.SourceInfo = {
  //   type: 'video',
  //   sources: [
  //     {
  //       src: 'lCofA723a4A?modestbranding=1&showinfo=0&rel=0',
  //       provider: 'youtube'
  //     }
  //   ]
  // }
  // const videoOptions = {
  //   controls: [
  //     'play', // Nút Play
  //     'progress', // Thanh tiến trình
  //     'current-time', // Thời gian hiện tại
  //     'mute', // Nút tắt tiếng
  //     'volume', // Điều chỉnh âm lượng
  //     'fullscreen' // Nút toàn màn hình
  //   ],
  //   settings: ['captions', 'quality', 'speed'], // Các cài đặt tùy chọn khác (nếu muốn)
  //   youtube: {
  //     noCookie: true, // Tắt cookie theo dõi
  //     controls: 0, // Ẩn các điều khiển của YouTube
  //     modestbranding: 1, // Giảm logo YouTube
  //     rel: 0, // Không hiển thị video liên quan
  //     showinfo: 0, // Ẩn thông tin video
  //     iv_load_policy: 3, // Ẩn chú thích
  //     relative: 0, // Ẩn video liên quan
  //     title: 0

  //   }
  // }
  const videoOptions = {
    controls: [
      'play', // Nút Play
      'progress', // Thanh tiến trình
      'current-time', // Thời gian hiện tại
      'mute', // Nút tắt tiếng
      'volume', // Điều chỉnh âm lượng
      'fullscreen' // Nút toàn màn hình
    ],
    settings: ['captions', 'quality', 'speed'], // Các cài đặt tùy chọn khác (nếu muốn)
    youtube: {
      noCookie: true, // Tắt cookie theo dõi
      controls: 0, // Ẩn các điều khiển của YouTube
      modestbranding: 1, // Giảm logo YouTube
      rel: 0, // Không hiển thị video liên quan
      showinfo: 0, // Ẩn thông tin video
      iv_load_policy: 3, // Ẩn chú thích
      playsinline: 1, // Phát video trong chế độ inline
      enablejsapi: 1, // Kích hoạt API JavaScript
      origin: 'https://plyr.io' // Origin của trang web
    }
  }
  const buildYouTubeEmbedUrl = (videoId: any, options: any) => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`
    const params = new URLSearchParams({
      origin: options.youtube.origin,
      iv_load_policy: options.youtube.iv_load_policy,
      modestbranding: options.youtube.modestbranding,
      playsinline: options.youtube.playsinline,
      showinfo: options.youtube.showinfo,
      rel: options.youtube.rel,
      enablejsapi: options.youtube.enablejsapi
    })

    return `${baseUrl}?${params.toString()}`
  }
  const videoId = 'lCofA723a4A'
  const embedUrl = buildYouTubeEmbedUrl(videoId, videoOptions)

  // trang learning 
  const [examData, setExamData] = useState<any>(null)

  // Thêm các biến trạng thái để quản lý hiển thị
  const [currentComponent, setCurrentComponent] = useState<'examCard' | 'detail' | 'history'>('examCard')
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null)
  const [mode, setMode] = useState<'test' | 'view' | null>(null)

  // Hàm lấy chi tiết bài thi
  const fetchExamDetails = async (id: any) => {
    try {
      const response = await getDetailExamsOne(id) // Gọi API lấy chi tiết bài thi
      console.log('response', response.data.data)
      setExamData(response.data.data) // Lưu dữ liệu vào state
    } catch (error) {
      console.error('Error fetching exam details:', error)
    }
  }

  useEffect(() => {
    if (lession.type === 'exam') {
      // Gọi API khi `lession.type === 'exam'` và có `lession.id`
      fetchExamDetails(lession.id)
    }
  }, [lession])

  // Các hàm xử lý sự kiện
  const handleViewExam = (attempt?: number) => {
    setSelectedAttempt(attempt || null)
    setMode('view')
    setCurrentComponent('detail')
  }

  const handleTestExam = () => {
    setMode('test')
    setSelectedAttempt(null)
    setCurrentComponent('detail')
  }

  const handleViewHistory = () => {
    setCurrentComponent('history')
  }

  const handleBack = async () => {
    setCurrentComponent('examCard')
    setSelectedAttempt(null)
    setMode(null)
    if (lession.type === 'exam') {
      console.log('fetchExamDetails----------------------')
      await fetchExamDetails(lession.id)
    }
  }

  const handleSubmitComplete = async () => {
    // Sau khi nộp bài, chuyển sang chế độ xem kết quả
    setMode('view')
    setCurrentComponent('detail')
    console.log('fetchExamDetails----------------------')
    // Thêm tiến trình cho bài học kiểu exam
    if (lession && enrollData) {
      const payload = {
        lessionId: lession?.id,
        enrollmentId: enrollData?.id
      }
      const queryParams = new URLSearchParams(location.search)
      const newLessonId = queryParams.get('id')
      // Kiểm tra xem bài học đã được xem chưa
      const isLessonCompleted = courseProgress.some(
        (progress) => Number(progress.lessionId) === Number(newLessonId)
      )
      // Nếu bài học đã hoàn thành, không gọi API nữa
      if (isLessonCompleted) {
        console.log('Tiến độ đã tồn tại, không cần gọi API')
        return
      }
      console.log('isLessonCompleted', isLessonCompleted)
      if (lession.type === 'exam' && !isLessonCompleted) {
        try {
          const response = await addProgress(payload)
          setCourseProgress([...courseProgress, payload])
          const currentCategoryIndex = lessions.findIndex(category =>
            category.some((lesson: { id: any }) => lesson.id === lession.id)
          )
          const sortedLessions = [...lessions[currentCategoryIndex]].sort((a, b) => a.order - b.order)
          const currentLessonIndex = sortedLessions.findIndex(
            (lesson) => lesson.id === lession.id
          )
  
          const isLastLesson = currentCategoryIndex === lessions.length - 1 && currentLessonIndex === sortedLessions.length - 1
          // Fix_1000
          // Tìm tất cả các bài học chưa học
          const allLessons = lessions.flat()
          const uncompletedLessons = allLessons.filter(lesson => !courseProgress.some(progress => progress.lessionId === lesson.id))
          const isLastUncompletedLesson = uncompletedLessons.length === 1 && uncompletedLessons[0].id === lession.id
  
          if (isLastLesson || isLastUncompletedLesson) {
            const responseMark = await markCourseAsDone({ courseId: courseData?.id })
            // const responseNoti = await createNotification({ title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses' })
            console.log('responseMark', responseMark)
            // console.log('responseNoti', responseNoti)
            // if (responseMark && responseNoti) {
            if (responseMark) {
              // const data = {
              //   id: responseNoti.data.recipients.recipientId,
              //   notificationId: 1,
              //   status: false,
              //   updatedAt: new Date(),
              //   createdAt: new Date(),
              //   userId,
              //   notificationDetails: { id: 1, title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses', createdAt: new Date(), updatedAt: new Date() }
              // }
              // dispatch(addNotification(data))
              toast.success('Congratulations! Course completed!')
            }
          }
        } catch (error) {
          console.log('error hoc lai>>>', error)
        }
      }
    }
  }
  
  const handleModeChange = (newMode: 'test' | 'view') => {
    setMode(newMode)
  }
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false) 
  const [isFullscreen, setIsFullscreen] = useState(false)
  const playerRef = useRef<ReactPlayer | null>(null)
  const playerContainerRef = useRef<HTMLDivElement | null>(null)
  const [videoKey, setVideoKey] = useState(0) // Thêm key để reset ReactPlayer

  useEffect(() => {
    watchRef.current = false
    setPlaying(false) // Dừng video khi chuyển sang bài học mới
    setProgress(0) // Đặt lại tiến trình khi chuyển sang bài học mới
    setVideoKey((prevKey) => prevKey + 1) // Reset ReactPlayer
  }, [lession?.id])
  // Hàm xử lý tiến độ video
  const handleProgress = (state: { played: number }) => {
    const percentagePlayed = state.played * 100
    setProgress(percentagePlayed)

    // Kiểm tra xem bài học đã được xem chưa
    const queryParams = new URLSearchParams(location.search)
    const newLessonId = queryParams.get('id')

    const alreadyWatched = courseProgress.some(
      (progress) => Number(progress.lessionId) === Number(newLessonId)
    )
    // console.log('alreadyWatched', alreadyWatched)
    // console.log('watchRef.current', watchRef.current)
    // console.log('percentagePlayed', percentagePlayed)
    // Chỉ thêm tiến trình nếu bài học chưa được xem và đạt đủ % đã xem (ví dụ: >= 10%)
    if (percentagePlayed >= 10 && !alreadyWatched && !watchRef.current) {
      watchRef.current = true
      const payload = {
        lessionId: lession?.id,
        enrollmentId: enrollData?.id,
      }
      addProgress(payload)
        .then(async (response) => {
          if (response) {
            console.log('Progress added:', response)
            setCourseProgress([...courseProgress, payload])

            // Kiểm tra nếu là bài học cuối cùng
            const currentCategoryIndex = lessions.findIndex((category) =>
              category.some((lesson: { id: any }) => lesson.id === lession.id)
            )
            const sortedLessions = [...lessions[currentCategoryIndex]].sort(
              (a, b) => a.order - b.order
            )
            const currentLessonIndex = sortedLessions.findIndex(
              (lesson) => lesson.id === lession.id
            )

            const isLastLesson = currentCategoryIndex === lessions.length - 1 && currentLessonIndex === sortedLessions.length - 1
            // Fix_1000
            // Tìm tất cả các bài học chưa học
            const allLessons = lessions.flat()
            const uncompletedLessons = allLessons.filter(lesson => !courseProgress.some(progress => progress.lessionId === lesson.id))
            const isLastUncompletedLesson = uncompletedLessons.length === 1 && uncompletedLessons[0].id === lession.id
    
            if (isLastLesson || isLastUncompletedLesson) {
              const responseMark = await markCourseAsDone({ courseId: courseData?.id })
              // const responseNoti = await createNotification({ title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses' })
              console.log('responseMark', responseMark)
              // console.log('responseNoti', responseNoti)
              // if (responseMark && responseNoti) {
              if (responseMark) {
              //   const data = {
              //     id: responseNoti.data.recipients.recipientId,
              //     notificationId: 1,
              //     status: false,
              //     updatedAt: new Date(),
              //     createdAt: new Date(),
              //     userId,
              //     notificationDetails: { id: 1, title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses', createdAt: new Date(), updatedAt: new Date() }
              //   }
                // dispatch(addNotification(data))
                toast.success('Congratulations! Course completed!')
              }
            }
          } else {
            console.error('Error adding progress')
          }
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }
  }

  const handlePlayPause = () => {
    setPlaying(!playing)
  }

  // Get the current duration of the video
  const getDuration = () => {
    return playerRef.current ? playerRef.current.getDuration() : 0
  }

  // Convert seconds to a time string (mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Handle right-click to prevent the context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  // Show controls on mouse enter
  const handleMouseEnter = () => {
    setShowControls(true)
  }

  // Hide controls on mouse leave
  const handleMouseLeave = () => {
    setShowControls(false)
  }

  // Toggle play/pause when clicking anywhere on the video
  const handleVideoClick = () => {
    setPlaying(!playing)
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume) // Update the state, ReactPlayer will apply this via its `volume` prop
    if (newVolume > 0) {
      setMuted(false) // Unmute when volume is adjusted
    }
  }

  // Toggle mute when the volume icon is clicked
  const handleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent the player from pausing when clicking the icon
    setMuted(!muted) // Toggle mute state
  }

  // Stop click propagation for volume control
  const stopClickPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Toggle fullscreen mode and stop event propagation to prevent pause
  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent pausing when clicking fullscreen button
    if (!isFullscreen) {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className='flex h-screen overflow-hidden'>
      <div className="relative flex flex-col flex-1 lg:overflow-y-hidden overflow-y-auto custom-scrollbar overflow-x-hidden">
        {/* Điều kiện hiển thị modal bình luận */}
        {isCommentModalOpen && <div className="fixed inset-0 z-40  bg-black opacity-50" onClick={handlePress}></div>}
        <div className='lg:relative lg:flex'>
          <div className={`${isExpanded ? 'lg:w-full' : 'lg:w-9/12'} transition-all duration-700 ease-in-out`}>
            <div ref={pdfContainerRef} className='md:overflow-y-auto custom-scrollbar h-full lg:h-lvh' style={{ height: '100vh', overflowY: 'scroll' }}>
              <div className='w-full object-cover xl:mb-24 mb-4 px-6'>
                {/* Điều kiện hiển thị nội dung bài học */}
                {/* Nếu lession.type là 'MP4', nội dung video sẽ được hiển thị. */}
                {lession.type === 'MP4'
                  ? (
                    <div className="rounded-2xl overflow-hidden w-full h-full bg-white">
                   <div
                            ref={playerContainerRef}
                            className="relative w-full h-full"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleVideoClick} // Toggle play/pause on click
                          >
                            {/* ReactPlayer without controls */}
                            <ReactPlayer
                              key={videoKey} // Sử dụng key để force re-render khi chuyển video
                              ref={playerRef}
                              url={lession.locationPath}
                              playing={playing}
                              volume={volume} // Set the volume via prop
                              muted={muted}
                              width="100%"
                              height="100%"
                              className="top-0 left-0 w-full h-full"
                              onProgress={handleProgress}
                              onContextMenu={handleContextMenu} // Disable right-click
                              config={{
                                file: { attributes: { controlsList: 'nodownload noplaybackrate' } }
                              }}
                              controls={false} // Disable default controls
                            />
                            {/* Central Play Button (visible when video is paused) */}
                            {!playing && (
                              <div
                                className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                                onClick={handlePlayPause} // Play video when central button is clicked
                              >
                                <div className="rounded-full bg-sky-600 p-2 flex items-center justify-center">
                                  <PlayArrowIcon
                                    fontSize="large"
                                    className="text-white"
                                    style={{ fontSize: '50px', cursor: 'pointer' }}
                                  />
                                </div>
                              </div>
                            )}
                            {/* Custom Controls (shown on hover) */}
                            {showControls && (
                              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                                <div className="flex justify-between items-center">
                                  {/* Left Side Controls: Play/Pause and Time */}
                                  <div className="flex items-center">
                                    {/* Play/Pause Button */}
                                    <button onClick={handlePlayPause} className="text-white mr-4">
                                      {playing ? <PauseIcon fontSize="medium" /> : <PlayArrowIcon fontSize="medium" />}
                                    </button>

                                    {/* Time Display */}
                                    <div className="text-white text-sm">
                                      {formatTime(playerRef.current?.getCurrentTime() || 0)} / {formatTime(getDuration())}
                                    </div>
                                  </div>

                                  {/* Right Side Controls: Volume and Fullscreen */}
                                  <div className="flex items-center">
                                    {/* Volume Control */}
                                    <div className="flex items-center text-white mr-4">
                                      <button onClick={handleMuteClick} className="text-white mr-2">
                                        {muted || volume === 0 ? <VolumeOffIcon fontSize="medium" /> : <VolumeUpIcon fontSize="medium" />}
                                      </button>
                                      <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={muted ? 0 : volume}
                                        onClick={stopClickPropagation} // Prevent play/pause when interacting with volume slider
                                        onChange={handleVolumeChange} // Update volume
                                        className="w-16 h-1"
                                      />
                                    </div>

                                    {/* Fullscreen Button */}
                                    <button onClick={handleFullscreen} className="text-white">
                                      {isFullscreen ? <FullscreenExitIcon fontSize="medium" /> : <FullscreenIcon fontSize="medium" />}
                                    </button>
                                  </div>
                                </div>

                                {/* Progress Bar (read-only) */}
                                <div className="w-full bg-gray-600 h-1 mt-2 relative">
  <div
    className="bg-red-600 h-full"
    style={{ width: `${progress}%` }} // progress đã là từ 0 đến 100%
  ></div>
</div>
                              </div>
                            )}
                          </div>
                  </div>
                    ) : lession.type === 'exam' ? (
                      examData ? (
                        currentComponent === 'examCard' ? (
                      // Hiển thị ExamCard
                      <div className="w-11/12 mx-auto">
                        <ExamCard
                          name={examData.name}
                          description={examData.description}
                          score={examData.score}
                          id={examData.id}
                          status={examData.attempted > 0 ? 'tested' : 'pending'}
                          attempted={examData.attempted}
                          numberOfAttempt={examData.numberOfAttempt}
                          durationInMinute={examData.durationInMinute}
                          onViewExam={() => handleViewExam()}
                          onTestExam={() => handleTestExam()}
                          onViewHistory={() => handleViewHistory()}
                        />
                      </div>
                        ) : currentComponent === 'detail' && examData.id ? (
                      // Hiển thị Detail
                      <Detail
                        examId={examData.id}
                        attempt={selectedAttempt}
                        mode={mode}
                        onBack={handleBack}
                        onSubmitComplete={handleSubmitComplete}
                        onModeChange={handleModeChange}
                      />
                        ) : currentComponent === 'history' && examData.id ? (
                      // Hiển thị ExamHistory
                      <ExamHistory
                        examId={examData.id}
                        onBack={handleBack}
                        onTestExam={() => handleTestExam()}
                        onViewExam={(attempt) => handleViewExam(attempt)}
                      />
                        ) : null
                      ) : (
                    // Hiển thị thông báo đang tải nếu dữ liệu đang được load
                    <div className="text-center">{t('loading')}</div>
                      )
                    ) : lession.type === 'PDF' ? (
                      <div className=''>
                        {/* Nếu không, nội dung khác (ví dụ: PDF) sẽ được hiển thị. */}
                        <div className='lg:pt-14 pt-8 w-full justify-center items-center flex'>
                          <div className='xl:w-3/5 lg:w-4/5 md:w-4/5 w-full border-b border-gray-200 pb-5 px-2'>
                            <div className='text-3xl font-bold'>{lession.name}</div>
                            <div className='mt-3'>{t('learning.updated_at')} {formattedDate}</div>
                            {/* <div className='font-bold mt-3'>{lession.description}</div> */}
                            <div
                              className="ql-editor"
                              data-gramm="false"
                              dangerouslySetInnerHTML={{ __html: lession?.description ?? '' }}
                            />
                            <div className='mt-3'>{t('learning.description')}</div>
                          </div>
                        </div>
                        <div className='flex items-center justify-center w-full h-auto lg:mb-36 mb-0'>
                          <Document
                            className={isCommentModalOpen ? 'pdf-opacity' : ''}
                            file={(lession.locationPath ?? '')}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={console.error}
                          >
                            {Array.from(new Array(numPages), (el, index) => (
                              <React.Fragment key={`page_${index + 1}`}>
                                <Page
                                  pageNumber={index + 1}
                                  scale={isSmallScreen ? 0.7 : 1.5}
                                  className="pdf-page"
                                  renderMode="canvas"
                                />
                                {index < numPages - 1 && <div className="border-t border-gray-200 my-2" />}
                              </React.Fragment>
                            ))}
                          </Document>
                        </div>
                      </div>
                    ) : null}
                {/* Điều kiện hiển thị thông tin bài học: */}
                {/* Nếu lession.type là 'MP4', thông tin bài học sẽ được hiển thị. */}
                {lession.type === 'MP4' &&
                  (
                    <div className='sm:h-[250px] h-full w-full'>
                      <div className='md:pt-8 md:pl-20 sm:mt-7 sm:pl-10 pt-4 pl-4 w-11/12 lg:pr-16'>
                        <div className='text-lg sm:text-2xl lg:text-3xl font-bold'>{lession.name}</div>
                        <div className='md:mt-3 mt-1 sm:mt-2 sm:text-balance text-sm'>{t('learning.updated_at')} {formattedDate}</div>
                        <div className='font-bold md:mt-3 sm:mt-2 mt-1'>{lession.description}</div>
                        <div className='md:mt-3 sm:mt-2 mt-1'>{t('learning.description')}</div>
                      </div>
                    </div>
                  )}
              </div>
              {/* Điều kiện hiển thị modal bình luận: */}
              {/* Nếu isCommentModalOpen là true, modal bình luận sẽ được hiển thị với lớp translate-x-0. */}
              {/* Nếu không, modal bình luận sẽ được ẩn với lớp translate-x-full. */}
              <div className={`z-50 right-0 w-[45%] bg-red-100 fixed flex justify-end inset-y-0 transition-transform ease-in-out duration-500 transform ${isCommentModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='w-full h-full bg-white shadow-lg shadow-slate-950 overflow-y-auto custom-scrollbar'>
                  <div className='flex justify-end mr-4 pt-4'>
                    <button className='text-gray-400 hover:text-black' onClick={handleCloseCommentForm}>
                      <CloseRoundedIcon fontSize='large' />
                    </button>
                  </div>
                  <div className='pl-14'>
                    <div className='font-bold'>{comments.length} questions</div>
                    <div className='text-sm text-gray-500 italic mt-2'>(If you see any spam comments, please help by reporting them to the admin)</div>
                    <div className='flex mb-16 mt-10'>
                      <img src="https://picsum.photos/200/300" alt='avt' className='w-10 h-10 object-cover rounded-full'></img>
                      <input
                        className="w-4/5 bg-white-200 border-b border-gray-400 border-l-0 border-r-0 focus:outline-none ml-5 text-sm"
                        placeholder='Do you have any question?'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={handleComment}
                      />
                    </div>
                    {/* <div>
                      {[...comments].reverse().map((comment, index) => (
                        <Comment key={index} comment={comment} />
                      ))}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`${isExpanded ? 'lg:w-0' : 'lg:w-3/12'} transition-all duration-700 ease-in-out`}>
            <div className="lg:sticky lg:overflow-x-hidden xl:overflow-y-auto custom-scrollbar lg:shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:w-full 2xl:h-[calc(100vh-120px)] xl:h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] xl:mb-0 lg:mb-56 mb-30">
              <div className='items-center pt-2'>
                <div className='ml-5 flex items-center border-b-2 p-1 font-bold text-lg cursor-pointer' onClick={handleBackToCourse}>
                  <ArrowBackIosNewTwoToneIcon className='font-bold' />
                  <img
                    src={courseData?.locationPath ? courseData.locationPath : require('../../assets/images/user/delete.png')}
                    alt='course'
                    className='ml-3 w-8 h-8 rounded-lg'
                  />
                  <div className='ml-2'>{courseData?.name}</div>
                </div>
                <div className='ml-5 flex items-center border-b-2 p-1'>
                  <div className='font-bold w-1/4'>{completedLessonsCount}/{totalCourses} {t('learning.lession')}</div>
                  <div className='w-1/5 h-14 ml-5'>
                    <CircularProgressbar
                      className='w-14 h-14'
                      value={percentage}
                      text={`${percentage}%`}
                      styles={buildStyles({
                        strokeLinecap: 'round',
                        textSize: '22px',
                        pathTransitionDuration: 0.5,
                        pathColor: `rgba(82, 234, 99, ${percentage / 100})`,
                        textColor: theme === 'dark' ? '#FFFFFF' : '#000000',
                        trailColor: '#d6d6d6',
                        backgroundColor: '#3e98c7'
                      })}
                    />
                  </div>
                  <div className={`w-1/4 font-bold ml-5 cursor-pointer transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-600 hover:text-black'}`}>
                    <NoteAltIcon className={`mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`} />
                    {t('learning.note')}
                  </div>
                  <div className={`w-1/4 font-bold ml-5 cursor-pointer transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-600 hover:text-black'}`}>
                    <HelpIcon className={`mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`} />
                    {t('learning.help')}
                  </div>
                </div>
                <div className='font-bold ml-5 py-3'>{t('course_detail.course_content')}</div>
              </div>
              {parts.map((part, partOrder) => {
                const partIndex = lessionCategories.findIndex(category => category.name === part.name)
                const completedLessonsCount = lessions[partIndex]?.filter((lession: { id: string }) => courseProgress.some(progress => progress.lessionId === lession.id)).length

                return (
                  <div key={partOrder}>
                    {/* <div className='bg-gray-200 font-bold flex items-center justify-between hover:bg-gray-300 transition-colors duration-200 cursor-pointer pl-6 select-none' onClick={() => handleClick(partOrder)}> */}
                    <div
                      className={`font-bold flex items-center justify-between transition-colors duration-200 cursor-pointer pl-6 select-none ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300'
                        }`}
                      onClick={() => handleClick(partOrder)}
                    >
                      <div>
                        {partOrder + 1}. {part.name}<br />
                        <div className='font-thin text-sm'>{`${completedLessonsCount}/${lessions[partIndex]?.length}`}</div>
                      </div>
                      {activeIndexes?.includes(partOrder) ? <ExpandLessIcon className='mr-2' /> : <ExpandMoreIcon className='mr-2' />}
                    </div>
                    {/* Điều kiện hiển thị phần bài học: */}
                    {/* Nếu activeIndexes chứa partOrder, các bài học trong phần đó sẽ được hiển thị. */}
                    {activeIndexes?.includes(partOrder) && sortedDrops[partIndex]?.map((drop: { id: string, name: {} | null | undefined, type: string }, dropOrder: React.Key | null | undefined) => {
                      if (drop) {
                        const dropIndexNumber = dropOrder
                        const dropIndexNumberValue = typeof dropIndexNumber === 'number' ? dropIndexNumber : 0

                        const isFirstLessonOfFirstPart = partOrder === 0 && dropOrder === 0
                        const isFirstLessonOfNextPart = partOrder > 0 && dropOrder === 0

                        const flattenedLessons = lessions.flat()

                        const sortedLessons = flattenedLessons
                          .map(lesson => {
                            const part = parts.find(p => p.id === lesson.lessionCategoryId)
                            return {
                              ...lesson,
                              partOrder: part ? part.order : Infinity
                            }
                          })
                          .sort((a, b) => a.partOrder - b.partOrder || a.order - b.order)

                        // Map courseProgress to sorted lessons
                        const mappedLessons = courseProgress.map(progress => {
                          const foundLesson = sortedLessons.find(lesson => {
                            return String(lesson.id) === String(progress.lessionId)
                          })
                          if (!foundLesson) {
                            console.log(`Lesson not found for id: ${progress.lessionId}`)
                          }
                          return foundLesson
                        })

                        // Find the last completed lesson id
                        const lastCompletedLessonId = mappedLessons
                          .filter(Boolean)
                          .sort((a, b) => a.partOrder - b.partOrder || a.order - b.order)[courseProgress.length - 1]?.id

                        const lastLessonOfPreviousPartId = sortedDrops[partOrder - 1]?.[sortedDrops[partOrder - 1]?.length - 1]?.id

                        const lastLessonOfPreviousPartCompleted = isFirstLessonOfNextPart && lastCompletedLessonId === lastLessonOfPreviousPartId
                        // NGAY TRƯỚC HỌC RỒI THÌ AUTO UNLOKC
                        // const previousLessonCompleted = courseProgress.some(progress => progress.lessionId === sortedDrops[partOrder][dropIndexNumberValue - 1]?.id)

                        // TRONG TỪNG PART, TẤT CẢ BÀI HỌC TRƯỚC ĐÓ ĐÃ HỌC XONG THÌ MỚI MỞ KHÓA
                        // const allPreviousLessonsCompleted = sortedDrops[partOrder].slice(0, dropIndexNumberValue).every((drop: { id: string }) =>
                        //   courseProgress.some(progress => progress.lessionId === drop.id && progress.lessionId)
                        // )

                        // const completedLessonsBeforeCurrent = sortedDrops[partOrder].slice(0, dropIndexNumberValue).filter((drop: { id: string }) =>
                        //   courseProgress.some(progress => progress.lessionId === drop.id && progress.lessionId)
                        // ).map((drop: { id: any }) => drop.id)
                        // console.log(`Completed lessons before ${drop.name}`, completedLessonsBeforeCurrent, allPreviousLessonsCompleted)
                        // gom hết lại mới check
                        const flattenedDrops = sortedDrops.flat()
                        const currentDropIndex = flattenedDrops.findIndex(drop => drop.id === sortedDrops[partOrder][dropIndexNumberValue].id)

                        const allPreviousLessonsCompleted = flattenedDrops.slice(0, currentDropIndex).every((drop: { id: string }) =>
                          courseProgress.some(progress => progress.lessionId === drop.id)
                        )

                        const completedLessonsBeforeCurrent = flattenedDrops.slice(0, currentDropIndex).filter((drop: { id: string }) =>
                          courseProgress.some(progress => progress.lessionId === drop.id)
                        ).map((drop: { name: any }) => drop.name)

                        const isAllowedToView = isFirstLessonOfFirstPart || lastLessonOfPreviousPartCompleted || allPreviousLessonsCompleted
                        // Điều kiện hiển thị bài học:
                        // Nếu isAllowedToView và allPreviousLessonsCompleted là true, bài học sẽ có độ mờ opacity-100.
                        // Nếu không, bài học sẽ có độ mờ opacity-50 và không thể click (pointer-events-none).
                        // Nếu activeDrop là drop.name, bài học sẽ có lớp bg-custom-bg-lesson và hover:bg-green-500.
                        // Nếu không, bài học sẽ có lớp bg-gray-900 text-gray-300 hover:bg-gray-800 (nếu theme là dark) hoặc bg-white hover:bg-gray-200 (nếu theme là light).
                        return (
                          <div
                            // className={`flex p-3 transition-colors duration-200 cursor-pointer pl-7 select-none ${isAllowedToView && allPreviousLessonsCompleted ? 'opacity-100' : 'opacity-50 pointer-events-none'} ${activeDrop === drop.name ? 'bg-custom-bg-lesson hover:bg-green-500' : 'bg-white hover:bg-gray-200'}`}
                            className={`flex p-3 transition-colors duration-200 cursor-pointer pl-7 select-none ${isAllowedToView && allPreviousLessonsCompleted ? 'opacity-100' : 'opacity-50 pointer-events-none'} ${activeDrop === drop.name ? (theme === 'dark' ? 'bg-custom-bg-lesson text-slate-100 hover:bg-green-500' : 'bg-custom-bg-lesson hover:bg-green-500') : (theme === 'dark' ? 'bg-gray-900 text-gray-300 hover:bg-gray-800' : 'bg-white hover:bg-gray-200')}`}
                            key={dropOrder}
                            onClick={() => {
                              if (isAllowedToView && drop && typeof drop.name === 'string') {
                                console.log('Drop:', drop)
                                console.log('Active Drop:', activeDrop)
                                const dropIndexNumberValue = typeof dropIndexNumber === 'number' ? dropIndexNumber : 0
                                const dropWithCategoryOrder = { ...drop, order: dropIndexNumberValue, categoryOrder: partOrder, name: drop.name || '' }
                                handleDropClick(dropWithCategoryOrder, partOrder)
                              }
                            }}
                          >
                            <div className='w-11/12'>
                              {drop?.type === 'PDF' && <PictureAsPdfIcon className="mr-2 text-gray-500" />}
                              {drop?.type === 'DOC' && <TextSnippetIcon className="mr-2 text-gray-500" />}
                              {drop?.type === 'MP4' && <PlayCircleIcon className="mr-2 text-gray-500" />}
                              {drop?.type === 'exam' && <QuizIcon className="mr-2 text-gray-500" />}
                              {drop?.name}
                            </div>
                            <div className='w-1/12 justify-end flex'>
                              {/* Điều kiện hiển thị biểu tượng hoàn thành hoặc khóa: */}
                              {/* Nếu courseProgress chứa drop.id, biểu tượng CheckCircleIcon sẽ được hiển thị.
Nếu không, và nếu !isAllowedToView hoặc !allPreviousLessonsCompleted, biểu tượng LockIcon sẽ được hiển thị. */}
                              {courseProgress.some(progress => progress.lessionId === drop?.id)
                                ? <CheckCircleIcon fontSize='small' className={allPreviousLessonsCompleted ? 'text-green-500' : 'text-gray-500'} />
                                : (!isAllowedToView || !allPreviousLessonsCompleted) && <LockIcon fontSize='small' className="text-gray-500" />
                              }
                            </div>
                          </div>
                        )
                      } else {
                        return null
                      }
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className={`w-full bottom-0 h-14 shadow-sm absolute z-50 ${theme === 'dark' ? 'bg-custom-control-learning' : 'bg-gray-200'}`}>
        <div className="overflow-auto h-full flex justify-center items-center px-4">
          <div className='flex justify-between'>
            <div
              className={`border border-transparent p-2 font-bold rounded-lg cursor-pointer hover:opacity-80 select-none lg:text-sm text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-black'
                }`}
              onClick={handlePreviousClick}
            >
              <ArrowBackIosIcon /> {t('learning.previous')}
            </div>
            <Tooltip title={<span className="lg:text-sm text-xs text-white">{t('learning.shortcut')}</span>} placement="top" arrow>
              <div
                className='border-2 border-green-500 text-green-500 p-2 font-bold rounded-lg cursor-pointer ml-4 hover:border-green-400 hover:bg-green-400 hover:text-white select-none lg:text-sm text-xs transition duration-500'
                onClick={handleNextClick}
              >
                {t('learning.next')} <ArrowForwardIosIcon />
              </div>
            </Tooltip>
          </div>
          <div className='flex items-center justify-center absolute right-2'>
            <div className='font-bold lg:text-xs xl:text-sm lg:block hidden'>{lession.order}. {lession.name}</div>
            <div className='lg:flex hidden items-center rounded-full bg-white text-black w-9 h-9 ml-5 justify-center cursor-pointer' onClick={handleExpandClick}>
              {isExpanded ? <MenuIcon fontSize="medium" /> : <ArrowForwardIcon fontSize="medium" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Learning
// xong 
