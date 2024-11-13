/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-redeclare */
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import DoneIcon from '@mui/icons-material/Done'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import TheatersIcon from '@mui/icons-material/Theaters'
import BatteryChargingFullTwoToneIcon from '@mui/icons-material/BatteryChargingFullTwoTone'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getFromLocalStorage } from 'utils/functions'
import { getCourseDetail, getCategoryLessionsByCourse, getLessionByCategory, addEnrollments, getEnrollmentByUserId } from 'api/post/post.api'
import bannerLight from '../../assets/images/courseDetail/inner-banner.jpg'
import bannerDark from '../../assets/images/courseDetail/inner-banner2.jpg'
import TimerIcon from '@mui/icons-material/Timer'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import ShareIcon from '@mui/icons-material/Share'
import ModalEnrollComponent from 'components/ModelEnroll'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import KeyIcon from '@mui/icons-material/Key'
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned'
import SchoolIcon from '@mui/icons-material/School'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import StyleIcon from '@mui/icons-material/Style'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import YouTube from 'react-youtube'
import { useTheme } from 'services/styled-themes'
import QuizIcon from '@mui/icons-material/Quiz' // đã fix 1
import { useDispatch, useSelector } from 'react-redux'
import { addCourseToCart, fetchCart, selectCartItems } from '../../redux/cart/cartSlice'
import { AppDispatch, RootState } from 'redux/store'
import ReactPlayer from 'react-player'
import ChoiceModal from '../../components/ChoiceModal/index'

import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import { set } from 'react-hook-form'
import CommentSection from './components/CommentSection'

interface Course {
  id: number
  name: string
  price: number
  averageRating: number
  assignedByName: string
  locationPath: string
}

export interface IDetail {
  videoLocationPath?: string
  description?: string
  id?: string
  name?: string
  durationInMinute?: number | 0
  summary?: string
  assignedBy?: string
  startDate?: Date
  endDate?: Date
  locationPath?: string
  prepare?: string
  price?: number
  categoryCourseId?: string
  categoryCourseName?: string
  itemType?: string // đã fix
  averageRating?: number
  assignedByName?: string
}
export enum ModalType {
  SUBMIT = 'submit',
  FAIL = 'fail',
  ALREADY_ENROLLED = 'already_enrolled'
}
export interface Lesson {
  locationPath: string
}
const CourseDetail = () => {
  const { theme } = useTheme()
  const location = useLocation()
  // Kiểm tra nếu người dùng đã đăng nhập dựa trên token trong localStorage
  const isAuthenticated = !!getFromLocalStorage<any>('tokens')?.accessToken
  const assignedBy = location.state?.assignedBy
  const params = useParams()
  const [data, setData] = useState<IDetail>({} as IDetail)
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<ModalType>(ModalType.SUBMIT)
  const [courseLession, setCourseLession] = useState<string | null>(null)
  const [enrollDataa, setEnrollData] = useState<any>(null)
  const [lessionCategories, setLessionCategories] = useState<any[]>([])
  const [lessions, setLessions] = useState<any[]>([])
  const [activeIndexes, setActiveIndexes] = useState<number[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const dataRef = useRef(data)
  const courseLessionRef = useRef(courseLession)
  const opts = {
    playerVars: {
      autoplay: 0,
      allowFullscreen: false
    }
  }
  const dispatch: AppDispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const tokens = getFromLocalStorage<any>('tokens')
  const userId = tokens?.id
  const [modalOpen, setModalOpen] = useState(false)
  const [isLoading2, setIsLoading2] = useState(false)
  const [isLoading3, setIsLoading3] = useState(false)
  useEffect(() => {
    if (userId) {
      dispatch(fetchCart({ userId, forceReload: true }))
    }
  }, [dispatch, userId, location.key])
  const handleAddToCart = async (course: IDetail) => {
    if (!userId) {
      setModalOpen(true)
      return
    }
    const courseToAdd: Course = {
      id: Number(course.id),
      name: course.name!,
      price: course.price!,
      averageRating: course.averageRating!,
      assignedByName: course.assignedByName!,
      locationPath: course.locationPath!
    }
    setIsLoading2(true)
    try {
      await dispatch(addCourseToCart({ userId, course: courseToAdd })).unwrap()
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading2(false)
    }
  }

  const handleAddToCart2 = async (course: IDetail) => {
    if (!userId) {
      setModalOpen(true)
      return
    }
    const courseToAdd: Course = {
      id: Number(course.id),
      name: course.name!,
      price: course.price!,
      averageRating: course.averageRating!,
      assignedByName: course.assignedByName!,
      locationPath: course.locationPath!
    }
    setIsLoading3(true)
    try {
      await dispatch(addCourseToCart({ userId, course: courseToAdd })).unwrap()
      window.location.href = '/cart'
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading3(false)
    }
  }

  const { t } = useTranslation()
  useEffect(() => {
    dataRef.current = data
    courseLessionRef.current = courseLession
  }, [data, courseLession])

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }

  const priceText = useMemo(() => {
    if (Number(data.price) !== 0) {
      return formatCurrency(Number(data.price))
    }
    return t('homepage.free')
  }, [data.price])

  const navigate = useNavigate()

  const handleOkModal = useCallback(() => {
    if (modalType === ModalType.FAIL) {
      setIsOpenModal(false)
      return
    }
    handleEnrollClick()
  }, [modalType])

  const handleEnrollClick = async () => {
    if (!userId) {
      setModalOpen(true)
      return
    }
    if (courseLessionRef.current) {
      const payload = { courseId: dataRef.current.id }

      try {
        if (modalType === ModalType.ALREADY_ENROLLED) {
          navigate(courseLessionRef.current, {
            state: { courseData: dataRef.current }
          })
        } else {
          const response = await addEnrollments(payload.courseId)
          if (response.status === 200) {
            navigate(courseLessionRef.current, {
              state: { courseData: dataRef.current }
            })
          } else {
            console.error('Failed to enroll in course')
          }
        }
      } catch (error) {
        console.error('An error occurred while enrolling in the course:', error)
      }
    }
  }

  const handleOpenModal = async () => {
    setIsOpenModal(true)
  }
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const enrollments = await getEnrollmentByUserId()
        const enrollment = enrollments.data.find((enrollment: { courseId: string | undefined }) => enrollment.courseId === dataRef.current.id)
        if (enrollment) {
          setModalType(ModalType.ALREADY_ENROLLED)
          setEnrollData(enrollment)
        } else {
          setModalType(ModalType.SUBMIT)
        }
      } catch (error) {
        console.error('An error occurred while checking enrollment:', error)
      }
    }
    if (isAuthenticated && data.id) {
      checkEnrollment()
    }
  }, [isAuthenticated, data.id])

  const confirmMessage: string = useMemo(() => {
    if (!modalType) return ''
    else if (modalType === ModalType.ALREADY_ENROLLED) {
      return (
        t('course_detail.continued_course')
      )
    } else return t('course_detail.enroll_confirm')
  }, [modalType])

  const getData = useCallback(
    async (id?: string) => {
      try {
        const courseData = await getCourseDetail({ id }) // lấy thông tin khóa học
        if (courseData) {
          setData(courseData.data)
        } else {
          navigate('/error', {
            replace: true
          })
        }
      } catch (e) {
        console.log(e)
        navigate('/error', {
          replace: true
        })
      }
    },
    []
  )

  useEffect(() => {
    if (params?.id) {
      window.scrollTo(0, 0)
      getData(params?.id)
    }
  }, [getData, params?.id])
  useEffect(() => {
    if (data) {
      localStorage.setItem('courseData', JSON.stringify(data))
    }
  }, [data])

  // Tìm bài học đầu tiên có loại MP4 và cập nhật state firstLessonMP4 nếu tìm thấy.
  useEffect(() => {
    const fetchData = async () => {
      const fetchedLessonCategories = await getCategoryLessionsByCourse({ id: data.id }) // lấy danh mục bài học theo khóa học
      setLessionCategories(fetchedLessonCategories.data)
      const promises = fetchedLessonCategories.data.map(async (category: { id: string }) => {
        const lessions = await getLessionByCategory({ id: category.id }) // lấy bài học theo danh mục
        return lessions.data
      })
      const lessonsDataArray = await Promise.all(promises) // mảng chứa các mảng bài học theo danh mục
      setLessions(lessonsDataArray)
      const flattenedLessons = lessonsDataArray.flat()
      const sortedLessons = flattenedLessons
        .map(lesson => {
          const part = parts.find(p => p.id === lesson.lessonCategoryId)
          return {
            ...lesson,
            partOrder: part ? part.order : Infinity
          }
        })
        .sort((a, b) => a.partOrder - b.partOrder || a.order - b.order)

      let counter = 0 // Initialize counter
      const lessonsGroupedByCategory = sortedLessons.reduce((acc, lesson) => {
        const existingKey = Object.keys(acc).find(key => acc[key][0]?.lessonCategoryId === lesson.lessonCategoryId)
        if (existingKey !== undefined) {
          acc[existingKey].push(lesson)
        } else {
          acc[counter] = [lesson]
          counter++
        }
        return acc
      }, {})
      if (Object.keys(lessonsGroupedByCategory).length > 0) {
        const firstLessonId = lessonsGroupedByCategory[0][0].id
        setCourseLession(`/learning/${data.id ?? ''}?id=${firstLessonId}`)
      }
      // console.log('flattenedLessons', flattenedLessons)
      // const firstMP4Lesson = flattenedLessons.find(lesson => lesson.type === 'MP4')
      // if (firstMP4Lesson) {
      //   setFirstLessonMP4(firstMP4Lesson)
      // }
    }
    if (data.id) {
      fetchData()
    }
  }, [data.id])

  const parts = lessionCategories.sort((a, b) => a.order - b.order).map(category => ({ id: category.id, name: category.name, order: category.order }))
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
  let counter = 0
  const lessonsGroupedByCategory = sortedLessons.reduce((acc, lesson) => {
    const existingKey = Object.keys(acc).find(key => acc[key][0]?.lessionCategoryId === lesson.lessionCategoryId)
    if (existingKey !== undefined) {
      acc[existingKey].push(lesson)
    } else {
      acc[counter] = [lesson]
      counter++
    }
    return acc
  }, {})

  const items = lessionCategories
  useEffect(() => {
    const allOpen = activeIndexes.length === items.length
    setIsExpanded(allOpen)
  }, [activeIndexes, items.length])
  const handleClick = (index: number) => {
    setActiveIndexes(activeIndexes.includes(index)
      ? activeIndexes.filter(activeIndex => activeIndex !== index)
      : [...activeIndexes, index])
  }
  const handleExpandCollapseAll = () => {
    const allOpen = activeIndexes.length === items.length
    setActiveIndexes(prevActiveIndexes => {
      if (allOpen) {
        setIsExpanded(false)
        return []
      } else {
        setIsExpanded(true)
        return items.map((item, index) => index)
      }
    })
  }
  const totalCourses = lessions.reduce((total, currentCategoryCourses) => total + currentCategoryCourses.length, 0)

  const handleHomeClick = () => {
    const tokens = getFromLocalStorage<any>('tokens')
    if (tokens === null) {
      navigate('/', {
        replace: true
      })
    }
    navigate('/', {
      replace: true
    })
  }
  useEffect(() => {
    const handleBackButtonEvent = (e: { preventDefault: () => void }) => {
      e.preventDefault()
      navigate('/')
    }
    window.onpopstate = handleBackButtonEvent

    return () => {
      window.onpopstate = null
    }
  }, [])
  useEffect(() => {
    document.body.classList.add('overflow-x-hidden')
    return () => {
      document.body.classList.remove('overflow-x-hidden')
    }
  }, [])
  let orderCounter = 0
  const bannerSrc = theme === 'light' ? bannerLight : bannerDark

  const isCourseInCart = (courseId: number) => {
    return cartItems.some((cartItem) => cartItem.id === courseId)
  }

  // const isCourseInCart = (courseId: number) => {
  //   if (cartItems.length > 0) {
  //     return cartItems.some((cartItem) => cartItem.id === courseId)
  //   }
  // }
  const handleLoginRedirect = () => {
    // Nếu `from` không tồn tại, lưu `location.pathname`
    if (!location.state?.from) {
      sessionStorage.setItem('redirectPath', location.pathname)
    }
    navigate('/login', { state: { from: location } })
  }
  return (
    <div className='overflow-x-hidden pb-14'>
      <div className='h-14 flex items-center lg:mx-40 mx-8 w-11/12 py-2 text-lg'>
        <div className='font-bold cursor-pointer hover:text-red-400 transition-colors duration-300' onClick={handleHomeClick}>{t('course_detail.home')}</div>
        <ArrowForwardIosIcon fontSize='small' />
        <div className='font-bold ml-3'>{data.name}</div>
      </div>
      <div className="relative w-full">
        <img src={bannerSrc} alt="Banner" className="w-full h-auto object-cover min-h-[250px]" />
        <div className="absolute inset-0 flex items-center">
          <div className='lg:ml-40 sm:ml-20 ml-10'>
            <div className='flex items-center space-x-5'>
              <div className='flex items-center'>
                <img src="https://picsum.photos/200/300" alt='avt' className='w-14 h-14 object-cover rounded-full'></img>
                <div className={`ml-5 flex items-center font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} hover:text-red-400 cursor-pointer transition-colors`}>
                  {assignedBy}
                </div>
              </div>
              <div className='bg-orange-500 p-2 rounded-xl text-white hover:bg-orange-600 cursor-text flex items-center justify-center w-1/3 sm:w-1/5 md:w-1/6 lg:w-48'>{data.categoryCourseName}</div>

            </div>
            <div className={`sm:text-2xl lg:text-3xl text-xl font-bold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              {data.name}
            </div>
            <div className='flex'>
              <div className='flex items-center mr-5'>
                <MenuBookIcon className='text-red-400 mr-3' />
                {totalCourses}+ {t('course_detail.lessions')}
              </div>
              <div className='flex items-center mr-5'>
                <TimerIcon className='text-yellow-400 mr-3' />
                {data.durationInMinute} {t('course_detail.minute')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full mx-auto'>
        {/* <div className='w-full z-10 relative flex justify-center' style={{ backgroundImage: `url(${banner})` }}>
          <div className="absolute inset-0 bg-black opacity-50 -z-20"></div>
          <div className='sm:w-11/12 lg:w-10/12 w-full'>
            <div className='font-bold transform z-30 text-white ml-10'>
              <div className='flex flex-col py-2 space-y-5 sm:space-y-0 space-x-0 sm:space-x-5 w-full sm:flex-row'>
                <div className='flex items-center'>
                  <img src="https://picsum.photos/200/300" alt='avt' className='w-14 h-14 object-cover rounded-full'></img>
                  <div className='ml-5 flex items-center hover:text-red-400 cursor-pointer transition-colors'>{assignedBy}</div>
                </div>
                <div className='bg-orange-500 p-2 rounded-3xl text-white hover:bg-orange-600 cursor-text flex items-center justify-center w-1/3 sm:w-1/5 md:w-1/6 lg:w-48'>{data.categoryCourseName}</div>
              </div>
              <div className='text-3xl mb-4'>{data.name}</div>

              <div className='flex'>
                <div className='mr-5'><MenuBookIcon className='text-red-400 mr-3'></MenuBookIcon>{totalCourses}+ {t('course_detail.lessions')}</div>
                <div className='mr-5'><TimerIcon className='text-yellow-400 mr-3'></TimerIcon>{data.durationInMinute} {t('course_detail.minute')}</div>
              </div>
            </div>
          </div>
        </div> */}
        <div className='w-full justify-center flex'>
          <div className='flex w-10/12 mt-10 lg:space-x-8 xl:space-x-16 flex-col lg:flex-row'>
            <div className='items-center w-full lg:w-3/4 justify-center'>
              <div>
                <div className={`w-full rounded-2xl shadow-2xl sticky top-0 mt-4 ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='p-5'>
                    <div className='text-blue-700 font-bold text-xl'>{t('course_detail.overview')}</div>
                    <div className='font-bold text-pretty mt-3'>{t('course_detail.course_summary')}</div>
                    <div className='mt-3'>{data.summary}</div>
                    <div className='font-bold text-pretty mt-3'>{t('course_detail.what_u_will_learn')}</div>
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      {data.description?.split('.').map((item, index) =>
                        item.trim() !== '' && <div key={index} className='text-sm'><DoneIcon className='text-green-300 mr-2' />{item.trim()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='pt-5 pl-5'>
                <div className='font-bold text-lg p-1'>{t('course_detail.course_content')}</div>
                <div className='flex justify-between mr-2'>
                  <div className='flex sm:flex-row flex-col'>
                    <div className='p-1'><strong>{parts.length}</strong> {t('course_detail.chapter')} •</div>
                    <div className='p-1'><strong>{totalCourses}</strong> {t('course_detail.lessions')} •</div>
                    <div className='p-1'>{t('course_detail.duration')} <strong>{data.durationInMinute} {t('course_detail.minute')}</strong></div>
                  </div>
                  <div className='text-green-400 font-bold hover:text-green-300 cursor-pointer' onClick={handleExpandCollapseAll}>
                    {isExpanded ? t('course_detail.collapse_all') : t('course_detail.expand_all')}
                  </div>
                </div>
              </div>
              <div className={`w-full rounded-2xl p-5 mb-5 shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                {parts.map((part, index) => {
                  return (
                    <div key={index}>
                      <div className='bg-slate-100 font-bold flex items-center justify-between pl-6 select-none mt-2 rounded-lg p-2 sm:p-3 cursor-pointer space-x-4' onClick={() => handleClick(index)}>
                        <div className='flex items-center w-5/6 text-black'>
                          {activeIndexes.includes(index) ? <RemoveIcon className='mr-2 text-green-300' /> : <AddIcon className='mr-2 text-green-300' />}
                          <div className='ml-4'>
                            <div></div>{index + 1}. {part.name}
                          </div>
                        </div>
                        <div className='text-center text-sm font-thin w-1/6 text-black'>{lessonsGroupedByCategory[index]?.length} {t('course_detail.lessions')}</div>
                      </div>
                      {lessonsGroupedByCategory[index] && lessonsGroupedByCategory[index].map((drop: { name: string, id: string, type: string, order: number, description: string, itemType: string } | null | undefined, dropIndex: React.Key | null | undefined) => { // đã fix 1: thêm itemType vào để làm icon
                        orderCounter += 1
                        return (
                          activeIndexes.includes(index) && (
                            <div
                              className='flex items-center justify-center p-2 cursor-text pl-10 select-none opacity-70'
                              key={dropIndex}
                            >
                              <div className='w-full sm:p-2 p-1 border-b-2 items-center flex'>
                                {drop?.type === 'PDF' && <PictureAsPdfIcon className="mr-2 text-orange-500" />}
                                {drop?.type === 'DOC' && <TextSnippetIcon className="mr-2 text-blue-500" />}
                                {drop?.type === 'MP4' && <PlayCircleIcon className="mr-2 text-red-400" />}
                                {/* đã fix 1 */}
                                {drop?.itemType === 'exam' && <QuizIcon className="mr-2 text-green-400" />}
                                {orderCounter}. {drop?.name}
                              </div>
                            </div>
                          )
                        )
                      })}
                    </div>
                  )
                })}
              </div>
              <div>
                <div className={`w-full rounded-2xl shadow-2xl sticky top-0 mt-4 ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='p-5'>
                    <div className='text-blue-700 font-bold text-xl'>{t('course_detail.requirements')}</div>
                    <ul className='py-3'>
                      {data.prepare?.split('.').map((item, index) =>
                        item.trim() !== '' && <li key={index} className='mt-3'><DoneIcon className='text-green-300 mr-2' />{item.trim()}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <div className={`w-full rounded-2xl shadow-2xl sticky top-0 mt-4 ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='p-5'>
                  <CommentSection courseId={data.id ?? ''} />
                  </div>
                </div>
              </div>

            </div>
            <div className='justify-center items-center lg:ml-10 w-full lg:w-2/5 mt-10'>
              <div className='w-full lg:p-5 p-0 flex-col lg:flex-col justify-between space-x-0 flex space-y-8'>
                <div className={`lg:w-full w-full rounded-2xl p-3 shadow-2xl flex-grow ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='w-full rounded-lg overflow-hidden justify-center flex'>
                    <div className='w-full h-full'>
                      {data.videoLocationPath
                        ? (
                          <div
                            className="w-full h-full"
                          >
                            {/* ReactPlayer without controls */}
                            <ReactPlayer
                              // Disable download button
                              config={{ file: { attributes: { controlsList: 'nodownload' } } }}

                              // Disable right click
                              onContextMenu={(e: { preventDefault: () => any }) => e.preventDefault()}

                              controls={true} // Hiển thị control
                              playing={false} // Để điều khiển việc phát tự động
                              url={data.videoLocationPath}
                              width='100%'
                              height='100%'
                              className="top-0 left-0 w-full h-full"
                            />
                          </div>
                          )
                        : (
                          <div className='flex items-center justify-center w-full h-full'>
                            <div className='font-bold item'>{t('course_detail.no_video')}</div>
                          </div>
                          )}
                    </div>
                  </div>
                  <div className='text-green-600 text-2xl font-bold ml-5 mb-3 mt-3'> {Number(priceText) === 0 ? t('homepage.free') : `${priceText}`}</div>

                  <div className='w-full justify-center flex mt-3'>
                    <div className='flex w-4/5 justify-center'>
                      {modalType !== ModalType.ALREADY_ENROLLED && data.id && (
                        // Check if the course is in the cart
                        !isCourseInCart(Number(data.id)) ? (
                          <button
                            onClick={async () => await handleAddToCart(data)}
                            disabled={isLoading2}
                            className="text-red-400 flex-1 border border-red-400 rounded-3xl p-2 mr-5 text-sm hover:bg-red-400 hover:text-white transition-colors duration-200 font-bold"
                          >
                            {isLoading2 ? t('course_detail.adding') : (
                              <>
                                <AddShoppingCartIcon className="mr-2" />
                                {t('course_detail.add')} {/* Assuming t is for translations */}
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => { navigate('/cart') } }
                            className="text-red-400 flex-1 border border-red-400 rounded-3xl p-2 mr-5 text-sm hover:bg-red-400 hover:text-white transition-colors duration-200 font-bold">
                            <AddShoppingCartIcon className="mr-2" />
                            {t('course_detail.go_to_cart')} {/* Assuming t is for translations */}
                          </button>
                        )
                      )}
                      <button className='text-red-400 flex-1 border border-red-400 rounded-3xl p-2 text-sm hover:bg-red-400 hover:text-white transition-colors duration-200 font-bold'>
                        <ShareIcon className='mr-2' />
                        {t('course_detail.share')}
                      </button>
                    </div>
                  </div>
                  <div className='flex justify-center mt-4'>
                    <button
                      className='bg-green-400 w-4/5 rounded-3xl p-3 font-bold text-lg hover:bg-green-500'
                      onClick={async () => {
                        if (modalType === ModalType.ALREADY_ENROLLED) {
                          handleOpenModal()
                        } else {
                          if (isCourseInCart(Number(data.id))) {
                            navigate('/cart')
                          } else {
                            await handleAddToCart2(data)
                          }
                        }
                      }}
                      disabled={isLoading3}
                    >
                      {isLoading3
                        ? t('course_detail.enrolling')
                        : modalType === ModalType.ALREADY_ENROLLED
                          ? t('course_detail.continueLearning')
                          : t('course_detail.enrollNow')}
                    </button>
                  </div>
                </div>
                <div className={`lg:w-full w-full rounded-2xl p-3 shadow-2xl flex-grow ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='w-full'>
                    <div className='p-2 font-bold text-lg'>{t('course_detail.includes')}</div>
                    <div className='w-full border-b'>
                      <div className='p-2'><StyleIcon className='mr-3 text-orange-400' />{t('course_detail.chapter2')}: <strong>{parts.length} {t('course_detail.chapter')}</strong></div>
                      <div className='p-2'><TheatersIcon className='mr-3 text-orange-400' />{t('course_detail.total')}: <strong>{totalCourses} {t('course_detail.lessions')}</strong></div>
                      <div className='p-2'><TimerIcon className='mr-3 text-orange-400' />{t('course_detail.duration')}: <strong>{data.durationInMinute} {t('course_detail.minute')}</strong></div>
                    </div>
                    <div className='p-2'><BatteryChargingFullTwoToneIcon className='mr-3 text-indigo-800' />{t('course_detail.study_anywhere_anytime')}</div>
                    <div className='p-2'><KeyIcon className='mr-3 text-indigo-800' />{t('course_detail.full_life_time_access')}</div>
                    <div className='p-2'><AssignmentReturnedIcon className='mr-3 text-indigo-800' />{t('course_detail.assignments')}</div>
                    <div className='p-2'><SchoolIcon className='mr-3 text-indigo-800' />{t('course_detail.certificate_of_completion')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChoiceModal
        title="Bạn chưa đăng nhập"
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      >
        <p className="text-center">Vui lòng đăng nhập để tiếp tục.</p>
        <div className="flex justify-center mt-4">
          <button
            className="bg-blue-500 text-white rounded px-4 py-2"
            onClick={handleLoginRedirect}
          >
            Đăng nhập
          </button>
        </div>
      </ChoiceModal>
      <ModalEnrollComponent
        isOpen={isOpenModal}
        title={confirmMessage}
        description=''
        onCancel={() => setIsOpenModal(false)}
        onOk={handleOkModal}
        onClose={() => setIsOpenModal(false)}
      />
    </div>
  )
}

export default CourseDetail
