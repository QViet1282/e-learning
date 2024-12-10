/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState } from 'react'
import { Checkbox, IconButton } from '@mui/material'
import 'react-quill/dist/quill.snow.css'
import axios, { AxiosResponse } from 'axios'
import { Add, Close, DeleteOutlined, Remove, Save } from '@mui/icons-material'
import { newQuestion, newStudyItemAndLession } from 'api/post/post.interface'
import { createQuestion } from 'api/post/post.api'
import { QuillEditor, QuillEditorQuestion } from './QuillEditor'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

interface AddExamFormProps {
  userId: number
  setIsAddingQuestion: (value: boolean) => void
  examId: number
  fetchQuestions: () => Promise<void>
}

const AddQuestionForm: React.FC<AddExamFormProps> = ({ setIsAddingQuestion, userId, examId, fetchQuestions }): JSX.Element => {
  const { t } = useTranslation()
  const maxAnswers = 8

  const [answers, setAnswers] = useState<Array<{ content: string, isCorrect: boolean }>>(
    Array.from({ length: 2 }, () => ({ content: '', isCorrect: false }))
  )
  const [newQuestion, setNewQuestion] = useState<newQuestion>({
    examId,
    instruction: '',
    content: '',
    answer: '',
    explanation: ''
  })

  const instructions = [
    t('curriculum.dropdown.instructionOptions.0'),
    t('curriculum.dropdown.instructionOptions.1'),
    t('curriculum.dropdown.instructionOptions.2'),
    t('curriculum.dropdown.instructionOptions.3')
  ]

  const handleInstructionChange = (event: { target: { value: any } }): void => {
    setNewQuestion({ ...newQuestion, instruction: event.target.value })
  }

  const handleAnswerChange = (index: number, value: string): void => {
    const newAnswers = [...answers]
    newAnswers[index].content = value
    setAnswers(newAnswers)
  }

  const handleCorrectChange = (index: number): void => {
    const newAnswers = [...answers]
    newAnswers[index].isCorrect = !newAnswers[index].isCorrect
    setAnswers(newAnswers)
  }

  const handleAddAnswer = (): void => {
    if (answers.length < maxAnswers) {
      setAnswers([...answers, { content: '', isCorrect: false }]) // Thêm đáp án mới nếu chưa đạt tối đa
    } else {
      toast.error(t('curriculum.toast.error.maxAnswers', { maxAnswers }))
    }
  }

  const handleDeleteAnswer = (index: number): void => {
    const updatedAnswers = answers.filter((_, i) => i !== index)
    setAnswers(updatedAnswers)
  }

  const handleSubmit = async (): Promise<void> => {
    if (!newQuestion.content || newQuestion.content.replace(/<\/?[^>]+(>|$)/g, '').length === 0) {
      toast.error(t('curriculum.toast.error.questionEmpty'))
      return
    }

    console.log(newQuestion.content)

    const hasEmptyAnswer = answers.some((answer) => answer.content.trim() === '')

    const filteredAnswers = answers.filter((answer) => answer.content.trim() !== '')

    if (filteredAnswers.length < 2) {
      toast.error(t('curriculum.toast.error.insufficientAnswers'))
      return
    }

    if (hasEmptyAnswer) {
      toast.error(t('curriculum.toast.error.emptyAnswer'))
      return
    }

    if (!answers.some((answer) => answer.isCorrect)) {
      toast.error(t('curriculum.toast.error.noCorrectAnswer'))
      return
    }

    const correctAnswers = answers
      .map((answer, index) => (answer.isCorrect ? String.fromCharCode(97 + index) : null))
      .filter(Boolean)
      .join('::')

    if (correctAnswers.length === 0) {
      toast.error(t('curriculum.toast.error.noCorrectAnswer'))
      return
    }

    const updatedQuestion: Partial<newQuestion> = {
      a: answers[0]?.content ?? '',
      b: answers[1]?.content ?? '',
      c: answers[2]?.content ?? '',
      d: answers[3]?.content ?? '',
      e: answers[4]?.content ?? '',
      f: answers[5]?.content ?? '',
      g: answers[6]?.content ?? '',
      h: answers[7]?.content ?? '',
      answer: correctAnswers
    }

    const newState = await updateNewQuestion(updatedQuestion)

    try {
      const response: AxiosResponse<any> = await createQuestion({
        ...newState,
        examId
      })

      if (response.status === 201) {
        toast.success(t('curriculum.toast.success.questionCreated'))
        await fetchQuestions()
      }
    } catch (error) {
      console.error('Có lỗi xảy ra khi tạo câu hỏi:', error)
      toast.error(t('curriculum.createError'))
    }

    setIsAddingQuestion(false)
  }

  const updateNewQuestion = async (updatedQuestion: Partial<newQuestion>): Promise<newQuestion> => {
    return await new Promise((resolve) => {
      setNewQuestion((prevState) => {
        const newState = {
          ...prevState,
          ...updatedQuestion
        }

        console.log('Câu hỏi:', newState)
        console.log('Đáp án đúng:', newState.answer)

        resolve(newState)
        return newState
      })
    })
  }

  return (
    <div className="flex flex-col px-4 py-2 border-2 border-gray-200 bg-white mt-2">
      <div className="flex justify-between items-center">
        <p className="font-bold text-lg">{t('curriculum.placeholder.questionContent')}</p>
        <IconButton onClick={() => setIsAddingQuestion(false)}>
          <Close />
        </IconButton>
      </div>
      <div>
        <select
          value={newQuestion.instruction}
          onChange={handleInstructionChange}
          className="my-2 border text-sm border-gray-300 h-9 p-2 focus:outline-none"
        >
          <option value="">{t('curriculum.placeholder.instruction')}</option>
          {instructions.map((instruction, index) => (
            <option key={index} value={instruction}>{index + 1}.{instruction}</option>
          ))}
        </select>

        <div className="">
          <QuillEditorQuestion theme='snow'
            value={newQuestion.content}
            onChange={(value) => {
              setNewQuestion({ ...newQuestion, content: value })
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
                <div className='w-8 items-center opacity-0 group-hover:opacity-100'>
                  {answers.length > 2 && (
                    <div
                      className="cursor-pointer"
                      onClick={() => handleDeleteAnswer(index)} // Gọi hàm xóa đáp án
                    >
                      <DeleteOutlined />
                    </div>
                  )}
                </div>
                <input
                  value={answer.content}
                  placeholder={`${t('curriculum.label.answer')} ${1 + index}`}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className='w-10/12 h-9 items-center px-2 border-solid text-sm border-gray-300 focus:outline-none'
                  style={{ borderWidth: '1px' }}
                />
                <div className='flex justify-center items-center w-1/12 ml-2'>
                  <Checkbox
                    key={index}
                    checked={answer.isCorrect}
                    onChange={() => handleCorrectChange(index)} />
                  <label className="hidden md:block">{t('curriculum.label.correctAnswer')}</label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap">
            <div className="flex items-center w-full mt-1">
              <div className='w-8'></div>
              <textarea
                placeholder={t('curriculum.placeholder.answer').toString()}
                className='w-10/12 h-9 items-center pt-2 px-2 text-sm border-solid border-gray-300 focus:outline-none'
                style={{ borderWidth: '1px' }}
                readOnly
              />
              <div className='flex justify-center items-center w-1/12 border-2 ml-3 py-1 hover:bg-slate-100 cursor-pointer' onClick={handleAddAnswer}>
                <Add />
                {/* <label className="">Thêm</label> */}
              </div>
            </div>
            <textarea
              value={newQuestion.explanation}
              placeholder={t('curriculum.placeholder.explanation').toString()}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              className='w-full h-14 items-center mt-2 pt-1 px-2 text-sm border-solid border-gray-300 focus:outline-none'
              style={{ borderWidth: '1px' }}
            />
          </div>
        </div>

        <div className='flex justify-end w-full'>
          <div
            onClick={() => {
              handleSubmit().catch(error => {
                console.error('Error while submitting:', error)
              })
            }}
            className="px-2 py-1 cursor-pointer flex justify-center items-center gap-1 mt-2 text-white text-lg hover:bg-teal-400 bg-teal-500 rounded-md active:scale-95"
          >
            {t('curriculum.button.save')}
            <Save fontSize='small' />
          </div>
        </div>

      </div>

    </div>
  )
}

export default AddQuestionForm
