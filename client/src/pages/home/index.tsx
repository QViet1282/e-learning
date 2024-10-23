/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: HOME
   ========================================================================== */
import React, { useEffect, useState } from 'react'
import ExamCard from './components/ExamCard'
import { DataListExam } from 'api/post/post.interface'
import { getListExams } from 'api/post/post.api'
import { useTranslation } from 'react-i18next'
import Detail from '../detail'
import ExamHistory from '../examHistory'

const Home = () => {
  const [dataState, setDataState] = useState<DataListExam | undefined>(undefined)
  const { t } = useTranslation()

  // Thêm các biến trạng thái để quản lý hiển thị
  const [currentComponent, setCurrentComponent] = useState<'list' | 'detail' | 'history'>('list')
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null)
  const [mode, setMode] = useState<'test' | 'view' | null>(null)

  const getData = async () => {
    try {
      const listExamsResponse = await getListExams()
      if (!listExamsResponse.data) {
        setDataState(undefined)
      } else {
        setDataState(listExamsResponse?.data)
      }
    } catch (e) {
      // Xử lý lỗi nếu cần
    }
  }
  useEffect(() => {
    getData()
  }, [])

  // Các hàm xử lý sự kiện
  const handleViewExam = (id: string, attempt?: number) => {
    setSelectedExamId(id)
    setSelectedAttempt(attempt || null)
    setMode('view')
    setCurrentComponent('detail')
  }

  const handleTestExam = (id: string) => {
    setSelectedExamId(id)
    setMode('test')
    setSelectedAttempt(null)
    setCurrentComponent('detail')
  }

  const handleViewHistory = (id: string) => {
    setSelectedExamId(id)
    setCurrentComponent('history')
  }

  const handleBack = async () => {
    setCurrentComponent('list')
    setSelectedExamId(null)
    setSelectedAttempt(null)
    setMode(null)
    await getData()
  }

  const handleSubmitComplete = () => {
    // Sau khi nộp bài, chuyển sang chế độ xem kết quả
    setMode('view')
    setCurrentComponent('detail')
  }

  if (currentComponent === 'list') {
    return (
         <div className="w-4/5 mx-auto py-12">
           <div className="grid gap-4 mt-8">
             {dataState?.data?.length
               ? dataState?.data.map?.((item, index) => (
                   <ExamCard
                     name={item.name}
                     description={item.description}
                     key={index}
                     score={item.score}
                     id={item.id}
                     status={item.attempted > 0 ? 'tested' : 'pending'}
                     attempted={item.attempted}
                     numberOfAttempt={item.numberOfAttempt}
                     durationInMinute={item.durationInMinute}
                     onViewExam={() => handleViewExam(item.id)}
                     onTestExam={() => handleTestExam(item.id)}
                     onViewHistory={() => handleViewHistory(item.id)}
                   />
               ))
               : (
                 <div className="text-center italic">{t('homepage.empty_data')}</div>
                 )}
           </div>
         </div>
    )
  } else if (currentComponent === 'detail' && selectedExamId) {
    return (
         <Detail
           examId={selectedExamId}
           attempt={selectedAttempt}
           mode={mode}
           onBack={handleBack}
           onSubmitComplete={handleSubmitComplete}
           onModeChange={setMode}
         />
    )
  } else if (currentComponent === 'history' && selectedExamId) {
    return (
         <ExamHistory
           examId={selectedExamId}
           onBack={handleBack}
           onTestExam={() => handleTestExam(selectedExamId)}
           onViewExam={(attempt) => handleViewExam(selectedExamId, attempt)}
         />
    )
  } else {
    return null
  }
}

export default Home
