/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: COURSE
   ========================================================================== */

// TODO: remove later
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Pagination } from '@mui/material'
import MyCourseCard from './components/MyCourseCard'
import { DataListCourse, ListCourseParams } from 'api/post/post.interface'
import { getListMyCourses, getCategoryCourseData, getListMyCoursesActive, getListMyCoursesDone } from 'api/post/post.api'
import { getFromLocalStorage } from 'utils/functions'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { styled } from '@mui/system'
import { HashLoader } from 'react-spinners'
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
interface ParamsList extends ListCourseParams {
}

const MyCourse = () => {
  const CustomPagination = styled(Pagination)({
    '.MuiPagination-ul': {
      display: 'inline-flex',
      fontSize: 'large',
      listStyle: 'none',
      margin: '10px'
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
      }
    },
    '.MuiPaginationItem-page.Mui-selected': {
      color: '#667eea',
      fontWeight: 'bold',
      border: '2px solid #667eea',
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
  const [page, setPage] = useState<number>(1)
  const [pageDone, setPageDone] = useState<number>(1)
  const [pageActive, setPageActive] = useState<number>(1)
  const [dataState, setDataState] = useState<DataListCourse | undefined>(
    undefined
  )
  const [dataStateDone, setDataStateDone] = useState<DataListCourse | undefined>(
    undefined
  )
  const [dataStateActive, setDataStateActive] = useState<DataListCourse | undefined>(
    undefined
  )
  const { t } = useTranslation()
  const [currentTab, setCurrentTab] = useState(0)
  const navigate = useNavigate()
  const defaultStartDate = new Date('1970-01-01')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const defaultEndDate = new Date('9999-12-31')
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [dataCategory, setDataCategory] = useState<any>(null)
  const [categorySearch, setCategorySearch] = useState('all')
  const [search, setSearch] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPressed, setIsPressed] = useState(false)
  const [displayGrid, setDisplayGrid] = useState<boolean>(true)
  const [isGridView, setIsGridView] = useState(true)
  const handleViewToggle = () => {
    setIsGridView(!isGridView)
  }
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    if (isNaN(date.getTime())) {
      setStartDate(null)
    } else {
      setStartDate(date)
    }
  }

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    if (isNaN(date.getTime())) {
      setEndDate(null)
    } else {
      setEndDate(date)
    }
  }
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategorySearch(event.target.value)
  }
  const getDataMyCourse = async (params?: ParamsList) => {
    setIsLoading(true)
    try {
      const page = params?.page ?? 1
      const listCourseResponse = await getListMyCourses({ params })
      if (!listCourseResponse.data) {
        setDataState(undefined)
      } else {
        const data = listCourseResponse?.data
        console.log(data, 'dataState')
        setDataState(data)
        setPage(page)
      }
    } catch (e) {
      const tokens = getFromLocalStorage<any>('tokens')
      if (tokens === null) {
        navigate('/login', {
          replace: true
        })
      }
    }
    setIsLoading(false)
  }
  useEffect(() => {
    getDataMyCourse({ page: 1 })
  }, [])
  // COURSE DONE
  const getDataMyCourseDone = async (params?: ParamsList) => {
    try {
      const page = params?.page ?? 1
      const listCourseResponse = await getListMyCoursesDone({ params })
      if (!listCourseResponse.data) {
        setDataStateDone(undefined)
      } else {
        const data = listCourseResponse?.data
        setDataStateDone(data)
        setPageDone(page)
      }
    } catch (e) {
      const tokens = getFromLocalStorage<any>('tokens')
      if (tokens === null) {
        navigate('/login', {
          replace: true
        })
      }
    }
  }
  useEffect(() => {
    getDataMyCourseDone({ page: 1 })
  }, [])

  // COURSE ACTIVE
  const getDataMyCourseActive = async (params?: ParamsList) => {
    try {
      const page = params?.page ?? 1
      const listCourseResponse = await getListMyCoursesActive({ params })
      if (!listCourseResponse.data) {
        setDataStateActive(undefined)
      } else {
        const data = listCourseResponse?.data
        console.log(data, 'dataStateActive')
        setDataStateActive(data)
        setPageActive(page)
      }
    } catch (e) {
      const tokens = getFromLocalStorage<any>('tokens')
      if (tokens === null) {
        navigate('/login', {
          replace: true
        })
      }
    }
  }
  useEffect(() => {
    getDataMyCourseActive({ page: 1 })
  }, [])

  useEffect(() => {
    getDataMyCourse({ page: 1, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    getDataMyCourseDone({ page: 1, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    getDataMyCourseActive({ page: 1, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
  }, [currentTab])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setIsPressed(false)
    setIsLoading(true)

    if (currentTab === 0) {
      getDataMyCourse({ page: 1, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    } else if (currentTab === 1) {
      getDataMyCourseActive({ page: 1, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    } else {
      getDataMyCourseDone({ page: 1, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    }

    setDisplayGrid(false)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }
  const totalPage = useMemo(() => {
    const size = (dataState != null) ? dataState.size : 8
    const totalRecord = (dataState != null) ? dataState.totalRecords : 8
    return Math.ceil(totalRecord / size)
  }, [dataState])
  const totalPageDone = useMemo(() => {
    const size = (dataStateDone != null) ? dataStateDone.size : 8
    const totalRecord = (dataStateDone != null) ? dataStateDone.totalRecords : 8
    return Math.ceil(totalRecord / size)
  }, [dataStateDone])
  const totalPageActive = useMemo(() => {
    const size = (dataStateActive != null) ? dataStateActive.size : 8
    const totalRecord = (dataStateActive != null) ? dataStateActive.totalRecords : 8
    return Math.ceil(totalRecord / size)
  }, [dataStateActive])
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

  const handleChangePagination = (value: number) => {
    getDataMyCourse({ page: value, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
  }
  const handleChangePaginationDone = (value: number) => {
    getDataMyCourseDone({ page: value, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
  }
  const handleChangePaginationActive = (value: number) => {
    getDataMyCourseActive({ page: value, search, startDate: startDate ?? defaultStartDate, endDate: endDate ?? defaultEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
  }
  const categoryNames = dataCategory?.map((item: { name: any }) => item.name) ?? []
  return (
    <div className='w-full mx-auto'>
      <div className='font-semibold text-2xl mt-8 ml-10'>{t('mycourse.myCourse')}</div>
      <div className='w-full flex items-center justify-center mt-8'>
        {isLoading
          ? <div className="flex justify-center items-center w-full h-140 mt-20">
            <HashLoader
              className='flex justify-center items-center w-full mt-20'
              color='#5EEAD4'
              cssOverride={{
                display: 'block',
                margin: '0 auto',
                borderColor: 'blue'
              }}
              loading
            /></div>
          : <div className='w-11/12'>
            <Tabs selectedIndex={currentTab} onSelect={(index) => setCurrentTab(index)}>
              <TabList className="flex lg:w-2/5 sm:w-4/5 w-full mt-5">
                <Tab className="font-bold cursor-pointer text-center rounded-lg w-1/3" selectedClassName="text-blue-500 bg-blue-100 underline text-lg">{t('mycourse.enrolledCourses')} ({(dataState?.totalRecords ?? 0).toString().padStart(2, '0')})</Tab>
                <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg" selectedClassName="text-blue-500 bg-blue-100 underline text-lg">{t('mycourse.activeCourses')} ({(dataStateActive?.totalRecords ?? 0).toString().padStart(2, '0')})</Tab>
                <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg" selectedClassName="text-blue-500 bg-blue-100 underline text-lg">{t('mycourse.completedCourses')} ({(dataStateDone?.totalRecords ?? 0).toString().padStart(2, '0')})</Tab>
              </TabList>
              {/* <button onClick={handleViewToggle}>
                  {isGridView ? <FormatListBulletedOutlinedIcon/> : <GridViewOutlinedIcon/>}
              </button> */}
              <div className='inline-flex space-x-2 mt-4'>
                <div className={`rounded-md cursor-pointer transition-colors duration-500 ${isGridView ? 'bg-blue-200' : ''}`}>
                  <GridViewOutlinedIcon fontSize='large' onClick={() => setIsGridView(true)} />
                </div>
                <div className={`rounded-md cursor-pointer transition-colors duration-500 ${!isGridView ? 'bg-blue-200' : ''}`}>
                  <FormatListBulletedOutlinedIcon fontSize='large' onClick={() => setIsGridView(false)} />
                </div>
              </div>
              <TabPanel className={`flex flex-col justify-between ${isGridView ? '' : 'w-4/5'}`}>
                <div className={isGridView ? 'grid grid-cols-12 gap-6 mt-4' : 'flex flex-col mt-4'}>
                  {dataState?.data?.length
                    ? (
                        dataState?.data.map?.((item, index) => (
                        <MyCourseCard
                          id={item.id}
                          name={item.name}
                          description={item.description}
                          key={index}
                          summary={item.summary}
                          durationInMinute={item.durationInMinute}
                          startDate={new Date(item.startDate)}
                          endDate={new Date(item.endDate)}
                          status={item.status ? 'true' : 'false'}
                          progressPercentage={item.progressPercentage ? item.progressPercentage : 0}
                          price={item.price}
                          assignedBy={item.assignedBy}
                          locationPath={item.locationPath}
                          category={item.categoryCourseName}
                          lessonCount={item.lessonCount}
                          doneCount={item.doneCount}
                          lastUpdate={item.lastUpdate}
                        />
                        ))
                      )
                    : (
                      <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('mycourse.haventLearnYet')}</div>
                      )}
                  {(page === totalPage || dataState?.totalRecords === 0) && (
                    <div className='h-[477px] group mt-4 col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 border-4 border-dashed border-gray-200 hover:border-teal-500 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer transition-colors duration-700' onClick={(e: React.MouseEvent<HTMLDivElement>) => navigate('/')}>
                      <div className='w-12 h-12 bg-gray-500 group-hover:bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold duration-700'>
                        +
                      </div>
                      <button className='mt-6 px-6 py-2 border-2 border-teal-500 rounded-full text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-700'>
                      {t('mycourse.addCourse')}
                      </button>
                    </div>
                  )}
                </div>
                <div className='flex justify-center mt-4'>
                  <CustomPagination
                    count={totalPage}
                    page={page}
                    onChange={(_, page) => handleChangePagination(page)}
                    boundaryCount={1}
                    siblingCount={0}
                  />
                </div>
              </TabPanel>
              <TabPanel className="flex flex-col justify-between">
                <div className='grid grid-cols-12 gap-6 mt-4'>
                  {dataStateActive?.data?.length
                    ? (
                        dataStateActive?.data?.map?.((item, index) => (
                        <MyCourseCard
                          id={item.id}
                          name={item.name}
                          description={item.description}
                          key={index}
                          summary={item.summary}
                          durationInMinute={item.durationInMinute}
                          startDate={new Date(item.startDate)}
                          endDate={new Date(item.endDate)}
                          status={item.status ? 'true' : 'false'}
                          progressPercentage={item.progressPercentage ? item.progressPercentage : 0}
                          price={item.price}
                          assignedBy={item.assignedBy}
                          locationPath={item.locationPath}
                          category={item.categoryCourseName}
                          lessonCount={item.lessonCount}
                          doneCount={item.doneCount}
                          lastUpdate={item.lastUpdate}
                        />
                        ))
                      )
                    : (
                      <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('mycourse.haventLearnYet')}</div>
                      )}
                  {(pageActive === totalPageActive || dataStateActive?.totalRecords === 0) && (

                    <div className='h-[477px] group mt-4 col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 border-4 border-dashed border-gray-200 hover:border-teal-500 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer transition-colors duration-700' onClick={(e: React.MouseEvent<HTMLDivElement>) => navigate('/')}>
                      <div className='w-12 h-12 bg-gray-500 group-hover:bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold duration-700'>
                        +
                      </div>
                      <button className='mt-6 px-6 py-2 border-2 border-teal-500 rounded-full text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-700'>
                      {t('mycourse.addCourse')}
                      </button>
                    </div>
                  )}

                </div>

                <div className='flex justify-center mt-4'>
                  <CustomPagination
                    count={totalPageActive}
                    page={pageActive}
                    onChange={(_, page) => handleChangePaginationActive(page)}
                    boundaryCount={1}
                    siblingCount={0}
                  />
                </div>
              </TabPanel>
              <TabPanel className="flex flex-col justify-between">
                <div className='grid grid-cols-12 gap-6 mt-4'>
                  {dataStateDone?.data?.length
                    ? (
                        dataStateDone?.data?.map?.((item, index) => (
                        <MyCourseCard
                          id={item.id}
                          name={item.name}
                          description={item.description}
                          key={index}
                          summary={item.summary}
                          durationInMinute={item.durationInMinute}
                          startDate={new Date(item.startDate)}
                          endDate={new Date(item.endDate)}
                          status={item.status ? 'true' : 'false'}
                          progressPercentage={item.progressPercentage ? item.progressPercentage : 0}
                          price={item.price}
                          assignedBy={item.assignedBy}
                          locationPath={item.locationPath}
                          category={item.categoryCourseName}
                          lessonCount={item.lessonCount}
                          doneCount={item.doneCount}
                          lastUpdate={item.lastUpdate}
                        />
                        ))
                      )
                    : (
                      <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('mycourse.haventLearnYet')}</div>
                      )}
                  {(pageDone === totalPageDone || dataStateDone?.totalRecords === 0) && (
                    <div className='h-[477px] group mt-4 col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 border-4 border-dashed border-gray-200 hover:border-teal-500 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer transition-colors duration-700' onClick={(e: React.MouseEvent<HTMLDivElement>) => navigate('/')}>
                      <div className='w-12 h-12 bg-gray-500 group-hover:bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold duration-700'>
                        +
                      </div>
                      <button className='mt-6 px-6 py-2 border-2 border-teal-500 rounded-full text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-700'>
                        {t('mycourse.addCourse')}
                      </button>
                    </div>
                  )}

                </div>

                <div className='flex justify-center mt-4'>
                  <CustomPagination
                    count={totalPageDone}
                    page={pageDone}
                    onChange={(_, page) => handleChangePaginationDone(page)}
                    boundaryCount={1}
                    siblingCount={0}
                  />
                </div>
              </TabPanel>

            </Tabs>

          </div>
        }
      </div>
    </div>
  )
}

export default MyCourse
