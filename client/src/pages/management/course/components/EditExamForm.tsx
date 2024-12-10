/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useRef, useState } from 'react'
import { IconButton } from '@mui/material'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Add, Close, Remove, Save } from '@mui/icons-material'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { newStudyItemAndExam } from 'api/post/post.interface'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import { StudyItem } from 'api/get/get.interface'
import { editExam } from 'api/put/put.interface'
import { editStudyItemAndExam } from 'api/put/put.api'
import { QuillEditor } from './QuillEditor'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

interface EditExamFormProps {
  userId: number
  setIsEditingExam: (value: boolean) => void
  lessionCategoryId: number
  fetchStudyItems: () => Promise<void>
  studyItem: StudyItem
}
const EditExamForm: React.FC<EditExamFormProps> = ({ setIsEditingExam, userId, lessionCategoryId, fetchStudyItems, studyItem }): JSX.Element => {
  const { t } = useTranslation()
  const [dataExam, setDataExam] = useState<newStudyItemAndExam>({
    lessionCategoryId,
    name: studyItem.name,
    description: studyItem.description,
    itemType: 'exam',
    pointToPass: studyItem.Exam?.pointToPass,
    durationInMinute: studyItem.Exam?.durationInMinute,
    numberOfAttempt: studyItem.Exam?.numberOfAttempt,
    createrId: userId
  })
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Hàm tăng/giảm giá trị
  const handleIncrease = (field: keyof typeof dataExam, max: number): void => {
    setDataExam((prevData) => {
      const currentValue = prevData[field] as number
      return {
        ...prevData,
        [field]: currentValue < max ? currentValue + 1 : max
      }
    })
    console.log(dataExam)
  }

  const handleDecrease = (field: keyof typeof dataExam, min: number): void => {
    setDataExam((prevData) => {
      const currentValue = prevData[field] as number
      return {
        ...prevData,
        [field]: currentValue > min ? currentValue - 1 : min
      }
    })
  }

  const startHolding = (action: () => void): void => {
    holdTimeoutRef.current = setTimeout(function repeat () {
      action()
      holdTimeoutRef.current = setTimeout(repeat, 25)
    }, 500) // Độ trễ trước khi bắt đầu lặp
  }

  // Hàm khi thả nút
  const stopHolding = (): void => {
    if (holdTimeoutRef.current != null) {
      clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
  }

  const handleAddExam = async (): Promise<void> => {
    if (dataExam.name.trim() === '') {
      toast.error(t('curriculum.enterExamName'))
      return
    }

    try {
      const payload: editExam = {
        name: dataExam.name,
        description: dataExam.description,
        durationInMinute: dataExam.durationInMinute,
        pointToPass: dataExam.pointToPass,
        numberOfAttempt: dataExam.numberOfAttempt
      }
      editStudyItemAndExam(studyItem.id, payload).then(async () => {
        toast.success(t('curriculum.createSuccess'))
        await fetchStudyItems()
      }).catch(() => {
        toast.error(t('curriculum.createError'))
      })
    } catch (error) {
      console.error('Error create new category:', error)
    }
    console.log('New exam:', dataExam)
    setDataExam({
      lessionCategoryId,
      name: '',
      description: '',
      itemType: 'exam',
      pointToPass: 50,
      durationInMinute: 30,
      numberOfAttempt: 1,
      createrId: userId
    })
    setIsEditingExam(false)
  }

  console.log('data', studyItem.description)
  console.log('data2', dataExam.description)

  return (
    <div className="flex flex-col flex-1 h-auto p-2 mb-4 relative border-4 gap-2 bg-white">
      <div className="w-full flex justify-between items-center p-2">
        <p className="font-bold text-xl">{t('curriculum.addExamTitle')}</p>
        <IconButton
          onClick={() => {
            setIsEditingExam(false)
            setDataExam({
              lessionCategoryId,
              name: '',
              description: '',
              itemType: 'exam',
              pointToPass: 50,
              durationInMinute: 30,
              numberOfAttempt: 1,
              createrId: userId
            })
          }}
        >
          <Close />
        </IconButton>
      </div>

      {/* Tên bài kiểm tra */}
      <div className="flex flex-1 items-center flex-wrap justify-between md:pr-2">
        <p className="ml-2">{t('curriculum.examName')}</p>
        <input
          value={dataExam.name}
          onChange={(e) => setDataExam({ ...dataExam, name: e.target.value })}
          className="w-10/12 h-8 items-center pt-1 px-2 border-solid border-gray-300 focus:outline-none"
          style={{ borderWidth: '1px' }}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 mt-4 p-2">
        <div className="flex-1">
          <p>{t('curriculum.requiredPoints')} (%)</p>
          <div className="flex items-center">
            <IconButton
              onMouseDown={() => startHolding(() => handleDecrease('pointToPass', 0))}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onClick={() => handleDecrease('pointToPass', 0)}
            >
              <Remove />
            </IconButton>
            <textarea
              value={Number(dataExam.pointToPass)}
              onChange={(e) =>
                setDataExam({ ...dataExam, pointToPass: parseInt(e.target.value) })
              }
              className="w-2/3 h-8 border-solid border-gray-300 focus:outline-none text-center pt-1"
              style={{ borderWidth: '1px' }}
              readOnly
            />
            <IconButton
              onMouseDown={() => startHolding(() => handleIncrease('pointToPass', 100))}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onClick={() => handleIncrease('pointToPass', 100)}
            >
              <Add />
            </IconButton>
          </div>
        </div>

        {/* Thời gian làm bài */}
        <div className="flex-1">
          <p>{t('curriculum.examDuration')} ({t('curriculum.minutes')})</p>
          <div className="flex items-center">
            <IconButton
              onMouseDown={() => startHolding(() => handleDecrease('durationInMinute', 0))}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onClick={() => handleDecrease('durationInMinute', 0)}
            >
              <Remove />
            </IconButton>
            <textarea
              value={Number(dataExam.durationInMinute)}
              onChange={(e) =>
                setDataExam({ ...dataExam, durationInMinute: parseInt(e.target.value) })
              }
              className="w-2/3 h-8 border-solid border-gray-300 focus:outline-none text-center pt-1"
              style={{ borderWidth: '1px' }}
              readOnly
            />
            <IconButton
              onMouseDown={() => startHolding(() => handleIncrease('durationInMinute', 360))}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onClick={() => handleIncrease('durationInMinute', 360)}
            >
              <Add />
            </IconButton>
          </div>
        </div>

        {/* Số lần thử */}
        <div className="flex-1">
          <p>{t('curriculum.attemptsNumber')}</p>
          <div className="flex items-center">
            <IconButton
              onMouseDown={() => startHolding(() => handleDecrease('numberOfAttempt', 0))}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onClick={() => handleDecrease('numberOfAttempt', 0)}
            >
              <Remove />
            </IconButton>
            <textarea
              value={Number(dataExam.numberOfAttempt)}
              onChange={(e) =>
                setDataExam({ ...dataExam, numberOfAttempt: parseInt(e.target.value) })
              }
              className="w-2/3 h-8 border-solid border-gray-300 focus:outline-none text-center pt-1"
              style={{ borderWidth: '1px' }}
              readOnly
            />
            <IconButton
              onMouseDown={() => startHolding(() => handleIncrease('numberOfAttempt', 10))}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onClick={() => handleIncrease('numberOfAttempt', 10)}
            >
              <Add />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Mô tả */}
      <div className="flex flex-1 h-auto flex-col justify-between md:pr-2 mt-4">
        <p className="mb-2 ml-2 w-20">{t('curriculum.description')}</p>
        <QuillEditor
          theme="snow"
          value={dataExam.description}
          onChange={(value) => setDataExam({ ...dataExam, description: value })}
          // modules={modules}
          // className="w-full pb-0 md:h-auto"
        />
      </div>

      {/* Nút lưu */}
      <div className='w-full space-x-2 justify-end flex'>
        <div
          className="p-2 cursor-pointer flex justify-center items-center gap-1 text-white text-lg hover:bg-teal-400 bg-teal-500 rounded-md active:scale-95" onClick={handleAddExam}
        >
          {t('curriculum.button.save')}
          <Save fontSize='small'/>
        </div>
      </div>
    </div>
  )
}

export default EditExamForm
