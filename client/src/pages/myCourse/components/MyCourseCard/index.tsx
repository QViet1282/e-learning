/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React, { ReactElement, useMemo } from 'react'
import { t } from 'i18next'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '@ramonak/react-progress-bar'
import { calculateTime } from '../../../../utils/CalculateTime'
import { useTranslation } from 'react-i18next'
interface Props {
  id?: string
  description?: string
  name?: string
  summary?: string
  assignedBy?: string
  durationInMinute?: number
  startDate?: Date
  endDate?: Date
  status?: string
  progressPercentage?: number
  price?: number
  locationPath?: string
  category?: string
  lessonCount?: number
  doneCount?: number
  lastUpdate?: Date
}
// const statusText = useMemo(() => {
//   if (status === 'tested') {
//     return (
//       t('homepage.filter.tested') +
//       ` ${attempted} ${numberOfAttempt ? ' / ' + numberOfAttempt : ''}`
//     )
//   }
//   return t('homepage.filter.pending')
// }, [status, attempted, numberOfAttempt])
// const filterOptions = useMemo(() => {
//   return [
//     {
//       label: t('homepage.filter.all'),
//       value: StatusExam.ALL
//     },
//     {
//       label: t('homepage.filter.pending'),
//       value: StatusExam.NOT_DONE
//     },
//     {
//       label: t('homepage.filter.tested'),
//       value: StatusExam.DONE
//     }
//   ]
// }, [t])
const MyCourseCard = ({
  id,
  name,
  summary,
  assignedBy,
  durationInMinute,
  startDate,
  endDate,
  description,
  status,
  price,
  locationPath,
  category,
  progressPercentage,
  lessonCount,
  doneCount,
  lastUpdate
}: Props): ReactElement => {
  console.log('MyCourseCard Props:', {
    id,
    name,
    summary,
    assignedBy,
    durationInMinute,
    startDate,
    endDate,
    description,
    status,
    price,
    locationPath,
    category,
    progressPercentage,
    lessonCount,
    doneCount,
    lastUpdate
  })
  const navigate = useNavigate()
  const { t } = useTranslation()
  const courseDetailView = useMemo(() => {
    console.log('Course ID: ', id) // Add this line
    return `/courses/${id}`
  }, [id])
  // console.log(status)
  const handleCourseClick = () => {
    navigate(courseDetailView, { state: { assignedBy: assignedBy } })
  }
  const statusText = useMemo(() => {
    if (status === 'true') {
      return (
        t('homepage.course_done')
      )
    }
    return t('homepage.course_not_done')
  }, [status])
  const timeString = calculateTime((lastUpdate ?? '').toString(), {
    'hôm nay': t('mycourse.today'),
    '1 ngày trước': t('mycourse.1_day_ago'),
    'ngày trước': t('mycourse.days_ago'),
    '1 tháng trước': t('mycourse.one_month_ago'),
    'nửa tháng trước': t('mycourse.half_month_ago'),
    'tháng trước': t('mycourse.months_ago'),
    '1 năm trước': t('mycourse.one_year_ago'),
    'năm trước': t('mycourse.years_ago')
  })
  return (
  // <div onClick={handleCourseClick} className="w-full h-auto bg-white p-5 rounded-md cursor-pointer border border-gray-300 transition-all duration-200 ease-in-out hover:shadow-lg">
  //   <div className="flex justify-between border-b border-gray-300 mb-2 text-gray-800">

  //     <div className='flex flex-col'>
  //       <div className="text-lg font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap" title={name}>{name}</div>
  //       <div className='text-sm font-bold whitespace-nowrap'>{summary}</div>
  //     </div>

  //     <div className='flex flex-col justify-center'>
  //       <div className='flex items-center text-sm'>{t('homepage.progress')}: {progressPercentage}%</div>
  //       <div className='flex items-center text-sm'>{t('homepage.status')}: {statusText}</div>
  //       <div className='flex items-center text-sm'>
  //         {t('homepage.limitTimeCourse')}: {durationInMinute} {t('homepage.minuteText')}
  //       </div>
  //     </div>

  //   </div>
  //   <div className="text-base text-gray-800 whitespace-pre overflow-auto overflow-wrap break-word">
  //     {description}
  //   </div>
  //   <div className='flex mt-10 justify-between'>
  //     <div className="flex justify-center items-center p-3 bg-blue-600 mb-3 rounded-lg h-8 text-white hover:bg-blue-700 border-0 cursor-pointer">
  //       <PlayArrowIcon />
  //       <p className="ml-1.5">{t('homepage.study')}</p>
  //     </div>
  //     <div className='flex justify-center items-center'>
  //       {startDate?.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ~ {endDate?.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
  //     </div>
  //   </div>

    <div className="mt-4 cursor-pointer col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white shadow-lg rounded-lg border border-slate-200 overflow-hidden transition-all duration-200 ease-in-out" onClick={handleCourseClick}>
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className='w-full rounded-t-md h-40 overflow-hidden'>
          <img className="w-full h-full object-cover rounded-t-md transition-transform duration-700 hover:scale-110" src={locationPath ?? 'https://picsum.photos/200/300'} width="286" height="160" alt="CourseImage" />
          {/* <img className="w-full h-full object-cover rounded-t-md transition-transform duration-700 hover:scale-110" src={locationPath ? `assets/image/${locationPath}` : 'https://picsum.photos/200/300'} width="286" height="160" alt="CourseImage" /> */}
        </div>
        {/* Card Content */}
        <div className="grow flex flex-col p-3 px-5">
          {/* Card body */}
          <div className="grow">
            {/* Header */}
            <header className="mb-3">
              <h3 className="text-lg text-slate-800 font-semibold h-16 flex items-center">{name}</h3>
            </header>
            {/* Rating and price */}
            {/* <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center space-x-2 mr-2">
            <div className="flex space-x-1">
              <button>
                <span className="sr-only">1 star</span>
                <svg className="w-4 h-4 fill-current text-amber-500" viewBox="0 0 16 16">
                  <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                </svg>
              </button>
              <button>
                <span className="sr-only">2 stars</span>
                <svg className="w-4 h-4 fill-current text-amber-500" viewBox="0 0 16 16">
                  <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                </svg>
              </button>
              <button>
                <span className="sr-only">3 stars</span>
                <svg className="w-4 h-4 fill-current text-amber-500" viewBox="0 0 16 16">
                  <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                </svg>
              </button>
              <button>
                <span className="sr-only">4 stars</span>
                <svg className="w-4 h-4 fill-current text-amber-500" viewBox="0 0 16 16">
                  <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                </svg>
              </button>
              <button>
                <span className="sr-only">5 stars</span>
                <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 16 16">
                  <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                </svg>
              </button>
            </div>
            <div className="inline-flex text-sm font-medium text-amber-600">4.2</div>
          </div>
          <div>
            <div className="inline-flex text-sm font-bold bg-emerald-100 text-emerald-600 rounded-full text-center px-2 py-0.5">${priceText}</div>
          </div>
        </div> */}
            {/* Features list */}
            <ul className="text-sm space-y-2 mb-5">
            {/* <div>{lastUpdate ? `${t('mycourse.studied_at')} ${calculateTime(lastUpdate.toString())}` : t('mycourse.haventStudyYet')}</div> */}
            {/* <div className='h-8'>{lastUpdate ? `${t('mycourse.studied_at')} ${calculateTime(new Date(lastUpdate).toString())}` : t('mycourse.haventStudyYet')}</div> */}
            <div className='text-gray-500 italic'>{lastUpdate ? `${t('mycourse.studied_at')} ${timeString}` : t('mycourse.haventStudyYet')}</div>
              <div className='font-bold'>{t('mycourse.progress')}: </div>
              <ProgressBar className='pb-4' maxCompleted={100} completed={Number((((doneCount ?? 0) / (lessonCount ?? 1)) * 100).toFixed(0))} />
              <li className="flex items-center">
                <svg className="w-4 h-4 fill-current text-slate-400 shrink-0 mr-3" viewBox="0 0 16 16">
                  <path d="M15.686 5.695L10.291.3c-.4-.4-.999-.4-1.399 0s-.4.999 0 1.399l.6.599-6.794 3.697-1-1c-.4-.399-.999-.399-1.398 0-.4.4-.4 1 0 1.4l1.498 1.498 2.398 2.398L.6 13.988 2 15.387l3.696-3.697 3.997 3.996c.5.5 1.199.2 1.398 0 .4-.4.4-.999 0-1.398l-.999-1 3.697-6.694.6.6c.599.6 1.199.2 1.398 0 .3-.4.3-1.1-.1-1.499zM8.493 11.79L4.196 7.494l6.695-3.697 1.298 1.299-3.696 6.694z" />
                </svg>

                <div>{durationInMinute} {t('course.minutes')}</div>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 shrink-0 fill-current mr-3 text-slate-400" viewBox="0 0 16 16">
                  <path d="M11 0c1.3 0 2.6.5 3.5 1.5 1 .9 1.5 2.2 1.5 3.5 0 1.3-.5 2.6-1.4 3.5l-1.2 1.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l1.1-1.2c.6-.5.9-1.3.9-2.1s-.3-1.6-.9-2.2C12 1.7 10 1.7 8.9 2.8L7.7 4c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l1.2-1.1C8.4.5 9.7 0 11 0zM8.3 12c.4-.4 1-.5 1.4-.1.4.4.4 1 0 1.4l-1.2 1.2C7.6 15.5 6.3 16 5 16c-1.3 0-2.6-.5-3.5-1.5C.5 13.6 0 12.3 0 11c0-1.3.5-2.6 1.5-3.5l1.1-1.2c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L2.9 8.9c-.6.5-.9 1.3-.9 2.1s.3 1.6.9 2.2c1.1 1.1 3.1 1.1 4.2 0L8.3 12zm1.1-6.8c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-4.2 4.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l4.2-4.2z" />
                </svg>
                <div>{category}</div>
              </li>
              {/* <li className="flex items-center">
                <svg className="w-4 h-4 shrink-0 fill-current mr-3 text-slate-400" viewBox="0 0 16 16">
                  <path d="M11 0c1.3 0 2.6.5 3.5 1.5 1 .9 1.5 2.2 1.5 3.5 0 1.3-.5 2.6-1.4 3.5l-1.2 1.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l1.1-1.2c.6-.5.9-1.3.9-2.1s-.3-1.6-.9-2.2C12 1.7 10 1.7 8.9 2.8L7.7 4c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l1.2-1.1C8.4.5 9.7 0 11 0zM8.3 12c.4-.4 1-.5 1.4-.1.4.4.4 1 0 1.4l-1.2 1.2C7.6 15.5 6.3 16 5 16c-1.3 0-2.6-.5-3.5-1.5C.5 13.6 0 12.3 0 11c0-1.3.5-2.6 1.5-3.5l1.1-1.2c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L2.9 8.9c-.6.5-.9 1.3-.9 2.1s.3 1.6.9 2.2c1.1 1.1 3.1 1.1 4.2 0L8.3 12zm1.1-6.8c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-4.2 4.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l4.2-4.2z" />
                </svg>
                <div>{new Date(lastUpdate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} Start</div>
              </li> */}
              {/* <li className="flex items-center">
            <svg className="w-4 h-4 fill-current text-slate-400 shrink-0 mr-3" viewBox="0 0 16 16">
              <path d="M15 15V5l-5-5H2c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h12c.6 0 1-.4 1-1zM3 2h6v4h4v8H3V2z" />
            </svg>
            <div>{lessonCount} {t('course.articles')}</div>
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 fill-current text-slate-400 shrink-0 mr-3" viewBox="0 0 16 16">
              <path d="M13 7h2v6a1 1 0 01-1 1H4v2l-4-3 4-3v2h9V7zM3 9H1V3a1 1 0 011-1h10V0l4 3-4 3V4H3v5z" />
            </svg>
            <div>{t('course.access')}</div>
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 shrink-0 fill-current text-slate-400 mr-3" viewBox="0 0 16 16">
              <path d="M12.311 9.527c-1.161-.393-1.85-.825-2.143-1.175A3.991 3.991 0 0012 5V4c0-2.206-1.794-4-4-4S4 1.794 4 4v1c0 1.406.732 2.639 1.832 3.352-.292.35-.981.782-2.142 1.175A3.942 3.942 0 001 13.26V16h14v-2.74c0-1.69-1.081-3.19-2.689-3.733zM6 4c0-1.103.897-2 2-2s2 .897 2 2v1c0 1.103-.897 2-2 2s-2-.897-2-2V4zm7 10H3v-.74c0-.831.534-1.569 1.33-1.838 1.845-.624 3-1.436 3.452-2.422h.436c.452.986 1.607 1.798 3.453 2.422A1.943 1.943 0 0113 13.26V14z" />
            </svg>
            <div>{assignedBy}</div>
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 shrink-0 fill-current mr-3 text-slate-400" viewBox="0 0 16 16">
              <path d="M6.974 14c-.3 0-.7-.2-.9-.5l-2.2-3.7-2.1 2.8c-.3.4-1 .5-1.4.2-.4-.3-.5-1-.2-1.4l3-4c.2-.3.5-.4.9-.4.3 0 .6.2.8.5l2 3.3 3.3-8.1c0-.4.4-.7.8-.7s.8.2.9.6l4 8c.2.5 0 1.1-.4 1.3-.5.2-1.1 0-1.3-.4l-3-6-3.2 7.9c-.2.4-.6.6-1 .6z" />
            </svg>
            <div>{enrollmentCount} {t('course.active_installations')}</div>
          </li>
          <li className="flex items-center">
          <svg className="w-4 h-4 shrink-0 fill-current mr-3 text-slate-400" viewBox="0 0 16 16">
          <path d="M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z" />
        </svg>
            <div>{createdAtDate?.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ({t('course.createdAt')})</div>
          </li> */}
            </ul>
          </div>
          {/* Card footer */}
          {/* <div className='bg-red-100 items-center flex'>
        <a className="font-bold py-1 rounded-md items-center text-center px-5 w-full bg-indigo-500 hover:bg-indigo-600 text-white " href="#0">
          {Number(price) === 0 ? 'Free Now' : 'Buy Now'}
        </a>
      </div> */}
          <div className='bg-red-100 items-center flex'>
            {/* <a className="font-bold py-1 rounded-md items-center text-center px-5 w-full bg-indigo-500 hover:bg-indigo-600 text-white" onClick={handleCourseClick}>
              {doneCount === lessonCount ? t('mycourse.learnAgain') : t('mycourse.continueLearning')}
            </a> */}
            <a
              className="font-bold py-1 rounded-md items-center text-center px-5 w-full bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {
                console.log(status)
                handleCourseClick()
              }}
            >
              {status === 'true' ? t('mycourse.learnAgain') : t('mycourse.continueLearning')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCourseCard
