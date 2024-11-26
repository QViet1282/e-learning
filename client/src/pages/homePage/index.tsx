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
/* PAGE: HOMEPAGE
   ========================================================================== */

// TODO: remove later
import React, { useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { Pagination } from '@mui/material'
import { styled } from '@mui/system'
import { DataListCourse, ListCourseParams } from 'api/post/post.interface'
import { getListCourses, getListNewCourses, getCategoryCourseData } from 'api/post/post.api'
import { getFromLocalStorage } from 'utils/functions'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import FilterListIcon from '@mui/icons-material/FilterList'
import HomeCourseCard from 'pages/homePage/components/HomeCourseCard'
import SlideBar from 'pages/homePage/components/Slide'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { PacmanLoader, ClipLoader } from 'react-spinners'
import { ShowButtonTopContext, DivRefContext } from '../../containers/layouts/default'
import { useTheme } from 'services/styled-themes'
import imgHome from '../../assets/images/homePage/imgHome.png'
import Footer from 'pages/homePage/components/Footer'
import styled2 from '@emotion/styled'
import { keyframes } from '@emotion/react'

// Define the keyframes for color change
const colorChange = keyframes`
  0% { background-color: #FF5733; }   /* Vibrant Orange */
  25% { background-color: #C70039; }  /* Bold Red */
  50% { background-color: #900C3F; }  /* Deep Maroon */
  75% { background-color: #581845; }  /* Rich Purple */
  100% { background-color: #FF5733; }
`
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
`
const AnimatedButton = styled2.button`
animation: ${colorChange} 1s infinite, ${shake} 3s infinite;
`

interface ParamsList extends ListCourseParams {
}
const HomePage = () => {
  const { theme } = useTheme()
  const CustomPagination = styled(Pagination)({
    '.MuiPagination-ul': {
      display: 'inline-flex',
      fontSize: 'large',
      listStyle: 'none',
      margin: '10px',
      '@media (max-width: 600px)': {
        margin: '5px'
      }
    },
    '.MuiPaginationItem-root': {
      fontSize: 'large',
      fontWeight: 'bold',
      borderRadius: '4px',
      margin: '2px',
      border: '1px solid #cbd5e0',
      backgroundColor: 'white',
      color: '#718096',
      '&:hover': {
        backgroundColor: '#667eea',
        color: 'white'
      },
      '@media (max-width: 600px)': {
        margin: '0px'
      }
    },
    '.MuiPaginationItem-firstLast': {
      borderRadius: '4px'
    },
    '.MuiPaginationItem-previousNext': {
      borderRadius: '4px',
      margin: '10px',
      '@media (min-width: 600px)': {
        margin: '20px'
      },
      '@media (max-width: 600px)': {
        fontSize: 'medium',
        margin: '0px'
      }
    },
    '.MuiPaginationItem-page.Mui-selected': {
      color: '#667eea',
      fontWeight: 'bold',
      border: '2px solid #667eea',
      backgroundColor: 'white',
      '&:hover': {
        backgroundColor: '#667eea',
        color: 'white'
      }
    },
    '.MuiPaginationItem-ellipsis': {
      color: '#a0aec0',
      border: '1px solid #cbd5e0',
      backgroundColor: 'white',
      padding: '2px',
      margin: '0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  })
  const divRef = useContext(DivRefContext)
  const targetDivRef = useRef<HTMLDivElement>(null)
  const { showButtonTop, setShowButtonTop } = useContext(ShowButtonTopContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingCourse, setIsLoadingCourse] = useState<boolean>(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [dataCategory, setDataCategory] = useState<any>(null)
  const [categorySearch, setCategorySearch] = useState('all')
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [isPressed, setIsPressed] = useState(false)

  // const [dataStateNew, setDataStateNew] = useState<DataListCourse | undefined>(
  //   undefined
  // )
  const [pageNew, setPageNew] = useState<number>(1)

  const [dataState, setDataState] = useState<DataListCourse | undefined>(
    undefined
  )
  const [displayGrid, setDisplayGrid] = useState<boolean>(true)
  const { t } = useTranslation()
  const navigate = useNavigate()

  // const handleStartDateSelect = (date: Date) => {
  //   setStartDate(date)
  // }
  // const handleEndDateSelect = (date: Date) => {
  //   setEndDate(date)
  // }
  // const handleStartDateChange = (date: Date) => {
  //   setStartDate(date)
  // }
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    if (isNaN(date.getTime())) {
      setStartDate(null)
    } else {
      setStartDate(date)
    }
  }
  // const handleEndDateChange = (date: Date) => {
  //   setEndDate(date)
  // }
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    if (isNaN(date.getTime())) {
      setEndDate(null)
    } else {
      setEndDate(date)
    }
  }
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setIsPressed(false)
    setIsLoading(true)

    const requestParams: any = {
      page: 1,
      search,
      category: categorySearch
    }

    // Chỉ thêm startDate nếu có giá trị
    if (startDate) {
      requestParams.startDate = startDate.toISOString()
    }

    // Chỉ thêm endDate nếu có giá trị
    if (endDate) {
      requestParams.endDate = endDate.toISOString()
    }

    // Gọi API với các giá trị đã được kiểm tra
    getDataCourse(requestParams)

    setDisplayGrid(false)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  useEffect(() => {
    const requestParams: any = {
      page: 1,
      search,
      category: categorySearch
    }

    // Chỉ thêm startDate nếu có giá trị
    if (startDate) {
      requestParams.startDate = startDate.toISOString()
    }

    // Chỉ thêm endDate nếu có giá trị
    if (endDate) {
      requestParams.endDate = endDate.toISOString()
    }

    // Gọi API với các giá trị đã được kiểm tra
    getDataCourse(requestParams)
  }, [currentTab])

  // const getDataProCourse = async (params?: ParamsList) => {
  //   try {
  //     const page = params?.page ?? 1
  //     let data = getFromLocalStorage<any>(`paidCourse-page-${page}`)
  //     if (data) {
  //       setDataStatePaid(data)
  //       setPagePaid(page)
  //       return
  //     } else {
  //       const listCourseResponse = await getListProCourses({ params })
  //       if (!listCourseResponse.data) {
  //         setDataStatePaid(undefined)
  //       } else {
  //         data = listCourseResponse?.data
  //         setToLocalStorage(`paidCourse-page-${page}`, JSON.stringify(data))
  //       }
  //     }
  //     setDataStatePaid(data)
  //     setPagePaid(page)
  //   } catch (e) {
  //     // const tokens = getFromLocalStorage<any>('tokens')
  //     // if (tokens === null) {
  //     //   navigate('/login', {
  //     //     replace: true
  //     //   })
  //     // }
  //   }
  // }
  // useEffect(() => {
  //   getDataProCourse({ page: 1 })
  // }, [])

  // const getDataFreeCourse = async (params?: ParamsList) => {
  //   try {
  //     const page = params?.page ?? 1
  //     let data = getFromLocalStorage<any>(`freeCourse-page-${page}`)
  //     if (data) {
  //       setDataStateFree(data)
  //       setPageFree(page)
  //       return
  //     } else {
  //       const listCourseResponse = await getListFreeCourses({ params })
  //       if (!listCourseResponse.data) {
  //         setDataStateFree(undefined)
  //       } else {
  //         data = listCourseResponse?.data
  //         setToLocalStorage(`freeCourse-page-${page}`, JSON.stringify(data))
  //       }
  //     }
  //     setDataStateFree(data)
  //     setPageFree(page)
  //   } catch (e) {
  //     // const tokens = getFromLocalStorage<any>('tokens')
  //     // if (tokens === null) {
  //     //   navigate('/login', {
  //     //     replace: true
  //     //   })
  //     // }
  //   }
  // }
  // useEffect(() => {
  //   getDataFreeCourse({ page: 1 })
  // }, [])

  // KHONG DUNG LS
  // const getDataNewCourse = async (params?: ParamsList) => {
  //   try {
  //     const listCourseResponse = await getListNewCourses({ params })
  //     if (!listCourseResponse.data) {
  //       setDataStateNew(undefined)
  //     } else {
  //       setDataStateNew(listCourseResponse?.data)
  //       setPageNew(params?.page ?? 1)
  //     }
  //   } catch (e) {
  //     console.error('Không thể lấy dữ liệu khoá học mới:', e)
  //   }
  // }
  // useEffect(() => {
  //   getDataNewCourse({ page: 1 })
  // }, [])

  // KHONG DUNG LOCAL STORAGE
  const getDataCourse = async (params?: ParamsList) => {
    setIsLoadingCourse(true)
    try {
      const listCourseResponse = await getListCourses({ params })
      if (!listCourseResponse.data) {
        setDataState(undefined)
      } else {
        setDataState(listCourseResponse?.data)
        setPage(params?.page ?? 1)
      }
    } catch (e) {
      console.error('Không thể lấy dữ liệu khoá học:', e)
    } finally {
      setIsLoadingCourse(false)
    }
  }
  useEffect(() => {
    getDataCourse()
  }, [])

  // const getDataCourse = async (params?: ParamsList) => {
  //   try {
  //     let total = 0
  //     for (const x in localStorage) {
  //       const amount = (localStorage[x].length * 2) / 1024 / 1024
  //       if (!isNaN(amount) && localStorage.hasOwnProperty(x)) {
  //         total += amount
  //       }
  //     }
  //     console.log(`Total localStorage size in MB: ${total.toFixed(2)}`)
  //     const page = params?.page ?? 1
  //     let data = getFromLocalStorage<any>(`allCourse-page-${page}`)
  //     // Check if search, startDate, endDate, or category is not empty
  //     if ((params?.search || (params?.startDate?.toISOString() !== defaultStartDate.toISOString()) || (params?.endDate?.toISOString() !== defaultEndDate.toISOString()) || params?.category !== 'all')) {
  //       data = null
  //     }

  //     if (data) {
  //       setDataState(data)
  //       setPage(page)
  //       return
  //     } else {
  //       const listCourseResponse = await getListCourses({ params })
  //       if (!listCourseResponse.data) {
  //         setDataState(undefined)
  //       } else {
  //         const fullData: DataListCourse = listCourseResponse?.data
  //         // Use map on fullData.data, not on fullData
  //         data = {
  //           data: fullData.data.map(course => ({
  //             id: course.id,
  //             name: course.name,
  //             locationPath: course.locationPath,
  //             categoryCourseName: course.categoryCourseName,
  //             durationInMinute: course.durationInMinute,
  //             enrollmentCount: course.enrollmentCount
  //           })),
  //           page: fullData.page,
  //           size: fullData.size,
  //           totalRecords: fullData.totalRecords
  //         }
  //         // Only save to LS if search, startDate, endDate, and category are all empty
  //         // console.log('params:', params)
  //         if (!params?.search && (params?.startDate?.toISOString() === defaultStartDate.toISOString()) && (params?.endDate?.toISOString() === defaultEndDate.toISOString()) && params?.category === 'all') {
  //           setToLocalStorage(`allCourse-page-${page}`, JSON.stringify(data))
  //         }
  //       }
  //     }
  //     setDataState(data)
  //     setPage(page)
  //   } catch (e) {
  //     // const tokens = getFromLocalStorage<any>('tokens')
  //     // if (tokens === null) {
  //     //   navigate('/login', {
  //     //     replace: true
  //     //   })
  //     // }
  //   }
  // }

  // const handleChangePaginationPaid = (value: number) => {
  //   getDataProCourse({ page: value, search })
  // }

  // const totalPagePaid = useMemo(() => {
  //   const size = (dataStatePaid != null) ? dataStatePaid.size : 5
  //   const totalRecord = (dataStatePaid != null) ? dataStatePaid.totalRecords : 5
  //   return Math.ceil(totalRecord / size)
  // }, [dataStatePaid])

  // const handleChangePaginationFree = (value: number) => {
  //   getDataFreeCourse({ page: value, search })
  // }

  // const totalPageFree = useMemo(() => {
  //   const size = (dataStateFree != null) ? dataStateFree.size : 5
  //   const totalRecord = (dataStateFree != null) ? dataStateFree.totalRecords : 5
  //   return Math.ceil(totalRecord / size)
  // }, [dataStateFree])

  const handleChangePagination = (value: number) => {
    const requestParams: any = {
      page: value,
      search,
      category: categorySearch
    }

    // Chỉ thêm startDate nếu có giá trị
    if (startDate) {
      requestParams.startDate = startDate.toISOString()
    }

    // Chỉ thêm endDate nếu có giá trị
    if (endDate) {
      requestParams.endDate = endDate.toISOString()
    }

    // Gọi API với các giá trị đã được kiểm tra
    getDataCourse(requestParams)
  }

  const totalPage = useMemo(() => {
    const size = (dataState != null) ? dataState.size : 5
    const totalRecord = (dataState != null) ? dataState.totalRecords : 5
    return Math.ceil(totalRecord / size)
  }, [dataState])

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategorySearch(event.target.value)
  }
  const fetchData = useCallback(async () => {
    try {
      const response = await getCategoryCourseData()
      setDataCategory(response.data)
    } catch (error) {
      setDataCategory(null)
    }
  }, [])
  useEffect(() => {
    fetchData()
  }, [fetchData])
  // const fetchData = async () => {
  //   try {
  //     const data = getFromLocalStorage<any>('categoryCourse')
  //     if (data) {
  //       setDataCategory(data)
  //     } else {
  //       const response = await getCategoryCourseData()
  //       console.log(response)
  //       if (response.data) {
  //         setDataCategory(response.data)
  //         setToLocalStorage('categoryCourse', JSON.stringify(response.data))
  //       } else {
  //         setDataCategory(null)
  //       }
  //     }
  //   } catch (error) {
  //     setDataCategory(null)
  //   }
  // }

  // useEffect(() => {
  //   fetchData()
  // }, [])

  // const categoryNames = dataCategory?.map((item: { name: any }) => item.name) ?? []
  const moveToTop = () => {
    if (divRef && divRef.current) {
      divRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const scrollToTargetDiv = () => {
    if (targetDivRef && targetDivRef.current) {
      targetDivRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }
  return (
    <div>
      <div>
        {/* {isPressed && <div className="fixed inset-0 bg-black opacity-50" onClick={handlePress}></div>} */}
        <div className='w-full mx-auto pb-12'>
          <div className={`flex justify-between items-center ${theme === 'light' ? 'border-gray-200' : 'border-line-dark'} border-y-2`}>
            <div className='flex items-center w-full'>
              <form className="flex flex-col sm:flex-row justify-between items-center rounded-lg w-full space-x-0 sm:space-x-2 py-2 sm:py-0" onSubmit={handleSearch}>
                <div className='flex flex-col sm:flex-row items-center sm:space-x-0 px-2 space-x-0 w-full sm:w-5/12 md:w-1/2'>
                  <div className='flex sm:w-1/2 w-full space-x-2 items-center'>
                    <div className='font-bold items-center bg-gray-200 text-black rounded-md h-11 sm:w-2/5 w-1/5'>
                      <div className='p-2 flex justify-center items-center space-x-3 w-full'>
                        <FilterListIcon />
                        <div className='font-bold items-center hidden sm:hidden lg:flex'>{t('homepage.filter_label')}</div>
                      </div>
                    </div>
                    <select
                      className="h-10 p-2 text-gray-800 w-4/5 sm:w-3/5 outline-none cursor-pointer rounded-md border"
                      value={categorySearch}
                      onChange={handleCategoryChange}
                    >
                      <option value="all">{t('homepage.all_courses')}</option>
                      {dataCategory?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex my-4 w-full sm:w-1/2 items-center justify-center sm:space-x-0 space-x-4">
                    <div className='font-bold md:hidden flex w-1/5 justify-end'>
                      <div className='sm:hidden flex'>Search</div>
                    </div>
                    <div className='w-4/5 flex border border-gray-300 rounded-md'>
                      <div className="p-2 bg-white border-r">
                        <SearchIcon className="text-black" />
                      </div>
                      <input
                        className="py-2 px-4 outline-none w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('homepage.findByCourseName') ?? 'Defaultplaceholder'}
                      />
                    </div>
                  </div>
                </div>
                <div className='flex flex-col sm:flex-row items-center justify-between space-x-0 sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-7/12 md:w-1/2 px-2'>
                  <div className='flex items-center space-x-4 w-full sm:w-1/4 xl:w-1/3 justify-center'>
                    <div className='font-bold w-1/5 text-end justify-end flex sm:hidden md:flex whitespace-nowrap'>
                      {t('homepage.from_label')}
                    </div>
                    <input
                      type='date'
                      className='w-auto text-gray-700 border rounded-md p-2 bg-white'
                      value={startDate ? startDate.toISOString().substring(0, 10) : ''}
                      onChange={handleStartDateChange}
                    />
                  </div>
                  <div className='flex items-center space-x-4 w-full sm:w-1/4 xl:w-1/3 justify-center'>
                    <div className='font-bold w-1/5 text-end justify-end flex sm:hidden md:flex whitespace-nowrap'>
                      {t('homepage.to_label')}
                    </div>
                    <input
                      type='date'
                      className='w-auto text-gray-700 border rounded-md p-2 bg-white'
                      value={endDate ? endDate.toISOString().substring(0, 10) : ''}
                      onChange={handleEndDateChange}
                    />
                  </div>
                  <div className='flex items-center sm:w-auto'>
                    <button
                      type='submit'
                      className={`bg-teal-300 hover:bg-teal-500 rounded-md font-bold px-7 sm:px-4 py-2 m-2 transition duration-200 ${theme === 'dark' ? 'text-black' : 'text-white'}`}
                      onClick={handleSearch}
                    >
                      {t('homepage.find')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          {displayGrid && (
          <div className='w-full h-full flex flex-col sm:flex-row justify-center relative bg-sky-200'>
            <div className='w-full flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row p-10'>
               <div className='flex-1 flex flex-col justify-center'>
                <div className='text-3xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold flex justify-center'>
                  <div className='w-full sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 text-center'>
                    {t('homepage.welcome')}
                  </div>
                </div>
                <div className='flex justify-center mt-5'>
                  <div className='w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-3/5 text-center font-sans text-xl'>
                    &quot;{t('homepage.description')}&quot;
                  </div>
                </div>
                <div className='flex justify-center mt-5'>
                  <div className='flex justify-center w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-2/5'>
                  <AnimatedButton
                    className={`font-bold text-white shadow-xl rounded-3xl py-2 px-3 transition duration-200 ${theme === 'dark' ? 'text-black' : 'text-white'}`}
                    onClick={scrollToTargetDiv}
                  >
                    {t('homepage.getStarted')}
                  </AnimatedButton>
                  </div>
                </div>
              </div>
              <div className='flex-1 flex justify-center items-center mt-5 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0'>
                <img src={imgHome} className='w-[500px] h-[500px]' />
              </div>
            </div>
          </div>
          )}
          {displayGrid && (
            <div className='w-full flex justify-center' id='learnerViewing'>
              <div className='w-4/5'>
                <p className='ml-5 font-bold text-2xl text-shadow-lg mt-14'>{t('homepage.filter_title_course')}</p>
                {/* {isPressed && <div className="fixed inset-0 bg-black opacity-50" onClick={handlePress}></div>} */}
                <SlideBar></SlideBar>
              </div>
            </div>
          )}
          {isLoading
            ? <div className="flex justify-center items-center w-full h-140 mt-20">
              <PacmanLoader
                className='flex justify-center items-center w-full mt-20'
                color='#5EEAD4'
                cssOverride={{
                  display: 'block',
                  margin: '0 auto',
                  borderColor: 'blue'
                }}
                loading
                margin={10}
                speedMultiplier={3}
                size={40}
              /></div>
            : <div className='w-4/5 mx-auto pt-5'>
              <Tabs selectedIndex={currentTab} onSelect={(index) => setCurrentTab(index)}>
                <TabList className="flex lg:w-2/5 sm:w-4/5 w-full mt-5">
                  <Tab className="font-bold cursor-pointer text-center rounded-lg w-1/3" selectedClassName={`text-custom-tab underline text-lg ${theme === 'light' ? 'bg-custom-background-tab' : 'bg-custom-background-tab-dark'}`}>{t('homepage.allCourse')} ({dataState?.totalRecords ?? 0})</Tab>
                  {/* <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg" selectedClassName="text-blue-500 bg-blue-100 underline text-lg">{t('homepage.freeCourse')}</Tab>
                  <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg" selectedClassName="text-blue-500 bg-blue-100 underline text-lg">{t('homepage.paidCourse')}</Tab> */}
                </TabList>
                <hr className={`my-4 border-t -mx-5 ${theme === 'dark' ? 'border-line-dark' : 'border-gray-300'}`} />
                <TabPanel className="flex flex-col justify-between">
                  <div className='grid grid-cols-12 gap-6 mt-4 scroll-mt-32' ref={targetDivRef}>
                  {isLoadingCourse ? (
                  <div className="flex justify-center items-center w-full h-full col-span-12">
                        <ClipLoader color="#5EEAD4" loading={isLoadingCourse} size={50} />
                  </div>
                  ) : dataState?.data?.length
                    ? (
                        dataState?.data.map((item, index) => (
                          <HomeCourseCard
                            name={item.name}
                            description={item.description}
                            assignedBy={item.assignedBy}
                            key={index}
                            summary={item.summary}
                            durationInMinute={item.durationInMinute}
                            id={item.id}
                            startDate={new Date(item.startDate)}
                            endDate={new Date(item.endDate)}
                            price={item.price}
                            category={item.categoryCourseName}
                            locationPath={item.locationPath}
                            enrollmentCount={item.enrollmentCount}
                            createdAt={item.createdAt}
                            lessonCount={item.lessonCount}
                            averageRating={item.averageRating}
                          />
                        ))
                      )
                    : (
                        <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('homepage.empty_data_course')}</div>
                      )}
                  </div>
                  <div className='flex justify-center mt-10 md:mt-5 lg:mt-3'>
                    <CustomPagination
                      count={totalPage}
                      page={page}
                      onChange={(_, page) => handleChangePagination(page)}
                      boundaryCount={1}
                      siblingCount={1}
                    />
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          }
        </div>
        {displayGrid && (
          <Footer />
        )}
        <button
          className={`rounded-full fixed bottom-3 right-8 z-50 text-lg border-none outline-none bg-teal-300 hover:bg-teal-500 text-white cursor-pointer p-4 transition-colors duration-500 ${showButtonTop ? '' : 'hidden'}`}
          onClick={moveToTop}
        ><KeyboardArrowUpIcon style={{ fill: 'rgba(0, 0, 0, 1)', stroke: 'black', strokeWidth: 5 }} />
        </button>
      </div>
    </div>

  )
}
export default HomePage
