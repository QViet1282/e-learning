/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { useTranslation } from 'react-i18next'
import React, { useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import SportsScoreIcon from '@mui/icons-material/SportsScore'
import ModalComponent from 'components/Modal'

interface Props {
  description?: string
  id?: string
  name?: string
  score?: string
  status?: string
  type?: string
  numberOfAttempt: number
  attempted: number
  durationInMinute: number
  onViewExam?: () => void
  onTestExam?: () => void
  onViewHistory?: () => void
}

const ExamCard = ({
  name,
  description,
  score,
  status,
  id,
  attempted,
  numberOfAttempt,
  durationInMinute,
  onViewExam,
  onTestExam,
  onViewHistory
}: Props) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const handleOpenModal = () => {
    setIsOpenModal(true)
  }
  const { t } = useTranslation()
  const handleOkModal = () => {
    setIsOpenModal(false)
    if (onTestExam) {
      onTestExam()
    }
  }
  const statusText = useMemo(() => {
    if (status === 'tested') {
      return (
        t('homepage.filter.tested') +
        ` ${attempted} ${numberOfAttempt ? ' / ' + numberOfAttempt : ''}`
      )
    }
    return t('homepage.filter.pending')
  }, [status, attempted, numberOfAttempt, t])

  const scoreText = useMemo(() => {
    if (!score) {
      return null
    }
    return (
      <div className='flex items-center mb-2'>
        <div className="text-sm text-gray-500 flex items-center">{t('homepage.diem')}: </div>
        <div className="ml-1 text-lg font-semibold">{score}</div>
      </div>
    )
  }, [score, t])

  const duration = useMemo(() => {
    if (!durationInMinute) {
      return `${t('homepage.limitTimeGuid')}: ${t('homepage.noTimeLimited')}`
    } else {
      return `${t('homepage.limitTimeGuid')}: ${durationInMinute} ${t('homepage.minuteText')}`
    }
  }, [durationInMinute, t])

  const confirmMessage: any = useMemo(() => {
    return (
      <>
        {t('homepage.modal_test_description')}
        <br></br>
        <p>{name && name}</p>
        <p>{duration}</p>
      </>
    )
  }, [t])
  return (
    <div className="relative w-full bg-white p-4 rounded-lg border border-gray-300 cursor-pointer transition ease-in-out duration-200 hover:shadow-md md:h-auto lg:h-auto">
      <div className={`text-right text-lg ${status === 'tested' ? 'text-blue-500' : 'text-red-500'}`}>
        {statusText}
      </div>
      <div className="flex flex-col border-b border-gray-300 mb-2 text-gray-800">
        <div className="text-xl font-semibold mb-2" title={name}>{name}</div>
        {scoreText}
        <div className="text-sm text-gray-500 mb-2">{duration}</div>
      </div>
      {/* <div className="text-sm text-gray-800 mb-4">{description}</div> */}
      <div
        className="ql-editor"
        data-gramm="false"
        dangerouslySetInnerHTML={{ __html: description ?? '' }}
      />
      <div className="flex flex-col md:flex-row justify-start mt-2 gap-2">
        {attempted && onViewHistory && (
          <div onClick={onViewHistory} className="flex items-center justify-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 cursor-pointer">
            <SearchIcon />
            <p className="ml-1">{t('homepage.view')}</p>
          </div>
        )}
        {(attempted < numberOfAttempt || !numberOfAttempt) && onTestExam && (
          <div onClick={handleOpenModal} className="flex items-center justify-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-400 cursor-pointer">
            <SportsScoreIcon />
            <p className="ml-1">{t('homepage.test')}</p>
          </div>
        )}
      </div>
      <ModalComponent
        isOpen={isOpenModal}
        okText={t('homepage.start') ?? ''}
        cancelText={t('homepage.another_time') ?? ''}
        title={t('homepage.modal_test_title') ?? ''}
        description={confirmMessage}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleOkModal}
        onClose={() => setIsOpenModal(false)}
      />
    </div>
  )
}

export default ExamCard
