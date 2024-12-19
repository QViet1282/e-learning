/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react'
import { Checkbox, IconButton } from '@mui/material'
import 'react-quill/dist/quill.snow.css'
import axios, { AxiosResponse } from 'axios'
import { Add, Close, DeleteOutlined, Remove, Save } from '@mui/icons-material'
import { newQuestion, newStudyItemAndLession } from 'api/post/post.interface'

import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import { Question } from 'api/get/get.interface'
import { editLession, editQuestionItem } from 'api/put/put.interface'
import { editQuestion } from 'api/put/put.api'
import { QuillEditorQuestion, QuillEditorShow } from './QuillEditor'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

interface QuestionDetailProps {
  userId: number
  setIsAddingQuestion: (value: boolean) => void
  examId: number
  fetchQuestions: () => Promise<void>
  question: Question
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ setIsAddingQuestion, userId, examId, fetchQuestions, question }): JSX.Element => {
  const { t } = useTranslation()
  const maxAnswers = 8
  const [answers, setAnswers] = useState<Array<{ content: string, isCorrect: boolean }>>(
    Array.from({ length: 2 }, () => ({ content: '', isCorrect: false }))
  )
  const [dataQuestion, setDataQuestion] = useState<newQuestion>({
    examId,
    instruction: question?.instruction ?? '',
    content: question?.content ?? '',
    answer: question?.answer ?? '',
    explanation: question?.explanation ?? ''
  })

  const instructions = [
    t('curriculum.dropdown.instructionOptions.0'),
    t('curriculum.dropdown.instructionOptions.1'),
    t('curriculum.dropdown.instructionOptions.2'),
    t('curriculum.dropdown.instructionOptions.3')
  ]

  const getQuestionAnswers = (question: any): any[] => {
    const keys = Object.keys(question).filter(key => key.length === 1 && /^[a-p]$/.test(key)) // Lọc các key từ a -> p
    return keys.map(key => ({
      content: question[key],
      isCorrect: question.answer.includes(key)
    })).filter(answer => (Boolean(answer.content)) && answer.content.trim() !== '')
  }

  // useEffect để đồng bộ dữ liệu từ answer và question
  useEffect(() => {
    const questionAnswers = getQuestionAnswers(question)

    setAnswers(questionAnswers)
  }, [dataQuestion, question])

  const handleInstructionChange = (event: { target: { value: any } }): void => {
    setDataQuestion({ ...dataQuestion, instruction: event.target.value })
  }

  return (
    <div className="flex flex-col px-4 py-2 border-2 border-gray-200 bg-gray-50">
      <div className="flex justify-between items-center">
        <p className="font-bold text-lg">{t('curriculum.placeholder.questionContent')}</p>
        <IconButton onClick={() => setIsAddingQuestion(false)}>
          <Close />
        </IconButton>
      </div>
      <div className='pointer-events-none'>
        <select
          value={dataQuestion.instruction}
          onChange={handleInstructionChange}
          className="my-2 border text-sm border-gray-300 h-9 p-2 focus:outline-none"
        >
          <option value="">{t('curriculum.placeholder.instruction')}</option>
          {instructions.map((instruction, index) => (
            <option key={index} value={instruction}>{index + 1}.{instruction}</option>
          ))}
        </select>

        <div className="">
          <QuillEditorShow
            theme='snow'
            value={dataQuestion.content}
            onChange={(value) => {
              setDataQuestion({ ...dataQuestion, content: value })
            }}
            // modules={modules}
            // className="mt-2 text-xl"
            placeholder={t('curriculum.placeholder.questionContent').toString()}
          />
        </div>

        <div className="mt-2">
          <div className="flex flex-wrap">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center w-full group">
                <div className='w-8 items-center opacity-0'>
                  {answers.length > 2 && (
                    <div
                      className="cursor-pointer"
                    //   onClick={() => handleDeleteAnswer(index)} // Gọi hàm xóa đáp án
                    >
                      <DeleteOutlined />
                    </div>
                  )}
                </div>
                <textarea
                  value={answer.content}
                  placeholder={`${t('curriculum.label.answer')} ${1 + index}`}
                  className='w-10/12 h-9 items-center pt-2 px-2 border-solid text-sm border-gray-300 focus:outline-none'
                  style={{ borderWidth: '1px' }}
                />
                <div className='flex justify-center items-center w-1/12 ml-2'>
                  <Checkbox
                    key={index}
                    checked={answer.isCorrect}
                     />
                  <label className="hidden md:block">{t('curriculum.label.correctAnswer')}</label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap">
            <textarea
              value={dataQuestion.explanation}
              placeholder={t('curriculum.placeholder.explanation').toString()}
              onChange={(e) => setDataQuestion({ ...dataQuestion, explanation: e.target.value })}
              className='w-full h-14 items-center mt-2 pt-1 px-2 text-sm border-solid border-gray-300 focus:outline-none'
              style={{ borderWidth: '1px' }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}

export default QuestionDetail
