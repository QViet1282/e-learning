/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-redeclare */

import { FormProvider, useForm, useWatch } from 'react-hook-form'
import Question, { QUESTION_TYPE } from './components/question/Question'
import { getDetailExams, markExam, saveTempAnswer } from 'api/post/post.api'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ModalComponent from 'components/Modal'
import CountDownTimer from './components/timer/CountDownTimer'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { ClipLoader } from 'react-spinners'

enum Mode {
  VIEW = 'view',
  TEST = 'test',
}

export enum ModalType {
  SUBMIT = 'submit',
  FAIL = 'fail',
}

export interface Question {
  order: any
  a: string | null
  b: string | null
  c: string | null
  d: string | null
  e: string | null
  f: string | null
  g: string | null
  h: string | null
  i: string | null
  j: string | null
  k: string | null
  l: string | null
  m: string | null
  n: string | null
  o: string | null
  p: string | null
  createdAt: string
  score: string
  id: string
  isCorrect: boolean
  title: string
  type: string
  updatedAt: string
  userAnswer: string
  explanation: string
  correctAnswer: string
  isSelect: boolean
}

export interface IDetail {
  description?: string
  id?: string
  name?: string
  score?: string | number
  questions?: Question[]
  numberOfAttempt?: number
  attempted?: number
  lastAttempted?: number
  enterTime?: Date | null
  exitTime?: Date | null
  durationInMinute?: number | 0
}

interface DetailProps {
  examId: string
  attempt?: number | null
  mode: 'test' | 'view' | null
  onBack: () => void
  onSubmitComplete: () => void
  onModeChange: (mode: 'test' | 'view') => void
}

const Detail = ({ examId, attempt, mode, onBack, onSubmitComplete, onModeChange }: DetailProps) => {
  const method = useForm()
  const [data, setData] = useState<IDetail>({} as IDetail)
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<ModalType>(ModalType.SUBMIT)
  const [formPayload, setFormPayload] = useState({})
  const [payload, setPayload] = useState({})
  const [reload, setReload] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { t } = useTranslation()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0) // New state variable

  const handleOpenModal = () => {
    setModalType(ModalType.SUBMIT)
    setIsOpenModal(true)
  }

  const isInViewMode = useMemo(() => {
    return mode === 'view'
  }, [mode])

  const onSubmit = useCallback(
    async (payload: any) => {
      setIsLoading(true)
      try {
        await markExam(data.id as string, payload)
        setIsOpenModal(false)
        onSubmitComplete()
      } catch (e) {
        // Handle error if needed
      } finally {
        setIsLoading(false)
      }
    },
    [data.id, onSubmitComplete]
  )

  const getData = useCallback(
    async (id?: string, attempt?: number) => {
      setIsLoading(true)
      try {
        const status = mode
        const listExamsResponse = await getDetailExams({ id, attempt: attempt?.toString(), status })
        if (listExamsResponse?.data) {
          let questions = listExamsResponse.data.questions
          // Chỉ hoán đổi vị trí câu hỏi khi ở chế độ TEST
          if (mode === Mode.TEST) {
            questions = questions?.sort(() => Math.random() - 0.5)
          }
          setData({ ...listExamsResponse.data, questions })
          questions?.forEach((i: { id: { toString: () => any }, userAnswer: any }) => {
            if (i.userAnswer) {
              method.setValue(i.id.toString(), i.userAnswer)
              if (status === 'test') {
                setPayload(method.getValues())
              }
            }
          })
        } else {
          setData({} as IDetail)
        }
      } catch (e) {
        // Handle error if needed
      } finally {
        setIsLoading(false)
      }
    },
    [mode]
  )

  const handleOkModal = useCallback(() => {
    const payload = method.getValues()
    if (modalType === ModalType.FAIL) {
      setIsOpenModal(false)
      return
    }
    if (data?.questions && Object.keys(payload).length < data.questions.length) {
      setModalType(ModalType.FAIL)
      setFormPayload(payload)
      return
    }
    onSubmit(payload)
  }, [data?.questions, method, modalType, onSubmit])

  useEffect(() => {
    if (examId) {
      getData(examId, attempt || undefined)
    }
  }, [getData, examId, attempt])

  const statusText = useMemo(() => {
    if (data.attempted && data.attempted > 0) {
      return (
        t('homepage.filter.tested') +
        ` ${data.lastAttempted} ${data.numberOfAttempt ? ' / ' + data.numberOfAttempt : ''
        }`
      )
    }
    return t('homepage.filter.pending')
  }, [data.attempted, data.numberOfAttempt, t])

  const haveMoreAttempt = useMemo(() => {
    if (!data.numberOfAttempt) {
      return true
    } else if (!data.attempted) {
      return true
    } else if (data.attempted < data.numberOfAttempt) {
      return true
    } else {
      return false
    }
  }, [data.attempted, data.numberOfAttempt])

  const confirmMessage: string = useMemo(() => {
    if (!modalType) return ''
    else if (modalType === ModalType.FAIL) {
      return t('detail.not_enough_field')
    } else return t('detail.modal_test_description')
  }, [modalType, t])

  const validEndTime: Date | null = useMemo(() => {
    if (data?.enterTime != null && data?.durationInMinute != null && data?.exitTime == null) {
      const enterTime = new Date(data?.enterTime)
      return new Date(enterTime.getTime() + data?.durationInMinute * 60000)
    } else {
      return null
    }
  }, [data])

  const watchedFields = useWatch({
    control: method.control
  })

  useEffect(() => {
    if (mode === Mode.TEST) {
      setPayload(watchedFields)
      const saveData = async () => {
        await saveTempAnswer(data.id as string, watchedFields)
      }
      saveData().catch(console.error)
    }
  }, [watchedFields, mode, data.id])

  useEffect(() => {
    data?.questions?.forEach((question) => {
      Object.keys(payload).forEach((key, index) => {
        if (String(question.id) === String(key)) {
          if (Object.values(payload)[index] !== '') {
            question.isSelect = true
            question.userAnswer = String(Object.values(payload)[index])
          } else {
            question.isSelect = false
          }
        }
      })
    })
    setReload((prev: boolean) => !prev)
  }, [payload])

  const refs = data?.questions?.reduce((acc: any, value) => {
    acc[value.id] = React.createRef()
    return acc
  }, {})

  const handleClickToElement = (id: string) => {
    const index = data?.questions?.findIndex((q) => q.id === id)
    if (index !== undefined && index !== -1) {
      setCurrentQuestionIndex(index)
    }
  }

  return (
    isLoading ? (
    <div className="flex justify-center items-center h-[40vh]">
      <ClipLoader color="red" loading={isLoading} size={50} />
    </div>
    ) : (
    <FormProvider {...method}>
      <form className="w-11/12 mx-auto pb-6" onSubmit={method.handleSubmit(onSubmit)}>
        <div className="bg-[#00a6d8] w-full top-0 flex justify-between p-2 flex-wrap mb-2 z-10 text-white min-h-32">
          <div className="flex flex-col items-start w-full md:w-1/2">
            <button
              type="button"
              onClick={onBack}
              className="flex justify-center items-center px-3 py-2 bg-[#ff5858] mb-3 rounded-lg text-white hover:bg-[#d14545] border-none cursor-pointer"
            >
              <ArrowBackIcon />
              <p className="ml-2">{t('detail.back')}</p>
            </button>
            <div className="text-2xl font-bold">{data?.name}</div>
            {/* <div className="text-lg break-words">{data?.description}</div> */}
            <div
              className="ql-editor"
              data-gramm="false"
              dangerouslySetInnerHTML={{ __html: data?.description ?? '' }}
            />
          </div>
          {validEndTime && (
            <CountDownTimer targetDate={validEndTime.getTime()}></CountDownTimer>
          )}
        </div>

        <div className="text-xl font-bold">{statusText}</div>

        {data?.attempted !== 0 && mode === Mode.VIEW && (
          <>
            <div className="font-bold text-black m-3">
              {`${t('detail.attempt')} ${data?.attempted}`}
            </div>
            <div className="font-bold text-black m-3">
              {`${t('detail.score')} ${data?.score}`}
            </div>
          </>
        )}
        {mode === Mode.VIEW && (
          <div className=" w-72 grid grid-cols-5 gap-1 border-3 border-gray-500 rounded-lg p-2">
            {data?.questions?.map((question, index) => (
              <div
                key={question.id}
                className={`h-14 cursor-pointer grid grid-rows-3 border ${isInViewMode
                    ? question.isCorrect
                      ? 'border-green-500 bg-green-100'
                      : 'border-red-500 bg-red-100'
                    : question.isSelect
                      ? 'border-black bg-yellow-100'
                      : 'border-gray-500'
                  } rounded-md text-center capitalize`}
              >
                <div className="border-b border-black">{index + 1}</div>
                <div className="flex justify-center items-center">
                  {isInViewMode
                    ? question.isCorrect
                      ? <CheckIcon className="text-green-500" />
                      : <CloseIcon className="text-red-500" />
                    : question.type === 'SINGLE_CHOICE' && question.userAnswer}
                </div>
              </div>
            ))}
          </div>
        )}
        {mode === Mode.TEST && (
          <div className="w-72 grid grid-cols-5 gap-1 border-3 border-gray-500 rounded-lg p-2">
            {data?.questions?.map((question, index) => (
              <div
                key={question.id}
                className={`h-14 cursor-pointer grid grid-rows-3 border ${question.isSelect
                    ? 'border-black bg-yellow-100'
                    : 'border-gray-500'
                  } rounded-md text-center capitalize`}
                onClick={() => handleClickToElement(question.id)}
              >
                <div className="border-b border-black">{index + 1}</div>
              </div>
            ))}
          </div>
        )}

        {mode === Mode.TEST ? (
          // Render only the current question
          data?.questions && data.questions[currentQuestionIndex] && (
            <div ref={refs[data.questions[currentQuestionIndex].id]} key={data.questions[currentQuestionIndex].id}>
              <Question
                formPayload={formPayload}
                statusType={modalType}
                key={data.questions[currentQuestionIndex].id}
                questionId={data.questions[currentQuestionIndex].id.toString()}
                type={data.questions[currentQuestionIndex].type as QUESTION_TYPE}
                title={data.questions[currentQuestionIndex].title}
                option_1={data.questions[currentQuestionIndex].a}
                option_2={data.questions[currentQuestionIndex].b}
                option_3={data.questions[currentQuestionIndex].c}
                option_4={data.questions[currentQuestionIndex].d}
                option_5={data.questions[currentQuestionIndex].e}
                option_6={data.questions[currentQuestionIndex].f}
                option_7={data.questions[currentQuestionIndex].g}
                option_8={data.questions[currentQuestionIndex].h}
                option_9={data.questions[currentQuestionIndex].i}
                option_10={data.questions[currentQuestionIndex].j}
                option_11={data.questions[currentQuestionIndex].k}
                option_12={data.questions[currentQuestionIndex].l}
                option_13={data.questions[currentQuestionIndex].m}
                option_14={data.questions[currentQuestionIndex].n}
                option_15={data.questions[currentQuestionIndex].o}
                option_16={data.questions[currentQuestionIndex].p}
                value={data.questions[currentQuestionIndex].userAnswer === null ? undefined : data.questions[currentQuestionIndex].userAnswer}
                no={currentQuestionIndex + 1}
                isCorrect={data.questions[currentQuestionIndex].isCorrect}
                explanation={data.questions[currentQuestionIndex].explanation}
                correctAnswer={data.questions[currentQuestionIndex].correctAnswer}
              />
            </div>
          )
        ) : (
          // Render all questions
          data?.questions?.map((i, index) => (
            <div ref={refs[i.id]} key={i.id}>
              <Question
                formPayload={formPayload}
                statusType={modalType}
                key={i.id}
                questionId={i.id.toString()}
                type={i.type as QUESTION_TYPE}
                title={i.title}
                option_1={i.a}
                option_2={i.b}
                option_3={i.c}
                option_4={i.d}
                option_5={i.e}
                option_6={i.f}
                option_7={i.g}
                option_8={i.h}
                option_9={i.i}
                option_10={i.j}
                option_11={i.k}
                option_12={i.l}
                option_13={i.m}
                option_14={i.n}
                option_15={i.o}
                option_16={i.p}
                value={i.userAnswer === null ? undefined : i.userAnswer}
                no={index + 1}
                isCorrect={i.isCorrect}
                explanation={i.explanation}
                correctAnswer={i.correctAnswer}
              />
            </div>
          ))
        )}

        {mode === Mode.TEST && (
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 bg-blue-500 text-white rounded ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
            >
              {t('detail.previous')}
            </button>
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === (data?.questions?.length || 1) - 1}
              className={`px-4 py-2 bg-blue-500 text-white rounded ${currentQuestionIndex === (data?.questions?.length || 1) - 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
                }`}
            >
              {t('detail.next')}
            </button>
          </div>
        )}

        <div className="bg-[#00a6d8] w-full sticky bottom-0 p-2">
          <div className="flex justify-center gap-3">
            {data && mode === Mode.TEST && (
              <button
                type="button"
                onClick={handleOpenModal}
                className="w-28 h-12 border-2 border-white bg-[#ff5858] rounded-lg text-white font-semibold text-sm hover:bg-[#d14545]"
              >
                {t('detail.submit')}
              </button>
            )}
          </div>
        </div>
      </form>

      <ModalComponent
        isOpen={isOpenModal}
        title={t('detail.modal_test_title') ?? ''}
        description={confirmMessage}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleOkModal}
        onClose={() => setIsOpenModal(false)}
      />
    </FormProvider>
    )
  )
}

export default Detail
