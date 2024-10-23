/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable multiline-ternary */

import { getAllQuestionByExamId } from 'api/get/get.api'
import { Question, StudyItem } from 'api/get/get.interface'
import React, { useEffect, useState } from 'react'
import AddQuestionForm from './AddQuestionForm'
import { IconButton, Modal } from '@mui/material'
import { DeleteOutline, EditTwoTone } from '@mui/icons-material'
import EditQuestionForm from './EditQuestionForm'
import { deleteQuestion } from 'api/delete/delete.api'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd'
import { questionOrderItem } from 'api/put/put.interface'
import { updateQuestionOrder } from 'api/put/put.api'
import 'react-quill/dist/quill.snow.css'
import { StyledQuill } from './ReactQuillConfig'

interface DetailProps {
  studyItem: StudyItem
  load: boolean
  userId: number
}

const ExamDetail: React.FC<DetailProps> = ({ studyItem, load, userId }): JSX.Element => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedDeleteQuestion, setSelectedDeleteQuestion] = useState<number | null>(null)

  useEffect(() => {
    if (load) { void fetchQuestions() }
  }, [load, studyItem.Exam?.studyItemId])

  const fetchQuestions = async (): Promise<void> => {
    try {
      if ((studyItem.Exam?.studyItemId) != null && load) {
        const response = await getAllQuestionByExamId(studyItem.Exam?.studyItemId)
        setQuestions(response.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDeleteQuestion = async (): Promise<void> => {
    try {
      if (selectedDeleteQuestion != null) {
        const response = await deleteQuestion(selectedDeleteQuestion)
        response.status === 200 && setSelectedQuestion(null)
      }
    } catch (error) {
      console.error('Error edit category:', error)
    }
    void fetchQuestions()
  }

  const handleOnDragEnd = async (result: DropResult) => {
    if (result.destination == null) return

    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    console.log(reorderedItem)
    const updatedQuestions = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    setQuestions(updatedQuestions)

    try {
      const newOrder = result.destination.index + 1
      if (reorderedItem.id != null && studyItem.id != null && reorderedItem.order != null && reorderedItem.updatedAt != null) {
        const questionOrderUpdate: questionOrderItem = { questionId: reorderedItem.id, oldOrder: reorderedItem.order, newOrder, examId: studyItem.id, updatedAt: reorderedItem.updatedAt }
        const response = await updateQuestionOrder(questionOrderUpdate)
        console.log('Ket qua keo tha', response.status)
      }
    } catch (error) {
      console.error('Error updating questions:', error)
    }
  }

  return (
    <div className="border-t-2 border-gray-200">
      <div className="flex">
        <p className="text-base sm:text-base font-medium w-1/4 border-2 border-t-0 p-2 text-center"> Điểm đạt yêu cầu: {studyItem.Exam?.pointToPass} %</p>
        <p className="text-base sm:text-base font-medium w-1/4 border-2 border-t-0 p-2 text-center"> Thời gian làm bài: {studyItem.Exam?.durationInMinute} phút</p>
        <p className="text-base sm:text-base font-medium w-1/4 border-2 border-t-0 p-2 text-center"> Số lần thử: {studyItem.Exam?.numberOfAttempt}</p>
        <p className="text-base sm:text-base font-medium w-1/4 border-2 border-t-0 p-2 text-center border-b-0"> Mô tả </p>
      </div>
      <div className="text-base border-x-2 p-2">
        <StyledQuill
          theme="bubble"
          value={studyItem.description ?? ''}
          readOnly
          className="ml-1 w-auto md:h-auto bg-white p-0 m-0"
        />
      </div>

      <div className="border-2 border-gray-200 p-2">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="questionsList">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className=""
              >
                {questions.map((question, index) => (
                  <Draggable key={question.id} draggableId={String(question.id)} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center group w-full justify-between hover:border-teal-600 hover:border-2 hover:p-1"
                      >
                        <div className="flex items-center flex-wrap">
                          <div className='font-medium text-sm w-auto'>
                            Câu {question.order}:
                          </div>
                          <div className='ml-2 flex justify-between items-center' >
                            <StyledQuill
                              theme="bubble"
                              value={question.content ?? ''}
                              readOnly
                              className="ml-1 w-auto md:h-auto bg-white p-0 m-0"
                            />
                          </div>
                        </div>
                        <div className='flex group-hover:opacity-100 opacity-0' {...provided.dragHandleProps}>
                          <IconButton onClick={() => setSelectedQuestion(question)} className="h-6 p-0">
                            <EditTwoTone fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => { setSelectedDeleteQuestion(question.id ?? null) }} className="h-6 p-0">
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                          {/* Modal for delete confirmation */}
                          <Modal open={selectedDeleteQuestion === question.id} onClose={() => setSelectedDeleteQuestion(null)} className='flex justify-center items-center'>
                            <div className="flex flex-col justify-center items-center p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
                              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Xác nhận xóa</h2>
                              <p className="text-gray-600 text-center mb-4">
                                Bạn có chắc chắn muốn câu hỏi này?
                              </p>
                              <div className="flex justify-between mt-4 w-full">
                                <div
                                  className="p-2 flex-1 cursor-pointer flex justify-center items-center text-lg text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-200"
                                  onClick={() => { void handleDeleteQuestion() }}
                                >
                                  Xóa
                                </div>
                                <div
                                  className="p-2 flex-1 cursor-pointer flex justify-center items-center text-lg text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-200 ml-2"
                                  onClick={() => setSelectedDeleteQuestion(null)}
                                >
                                  Hủy
                                </div>
                              </div>
                            </div>
                          </Modal>
                          <IconButton style={{ cursor: 'grab' }} className='h-6'>
                            <DragIndicatorIcon className='w-1/2' fontSize='small' />
                          </IconButton>
                        </div>
                        <Modal
                          open={selectedQuestion?.id === question.id}
                          onClose={() => setSelectedQuestion(null)}
                          className='flex justify-center items-center'>
                          <div className=" max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-md">
                            <EditQuestionForm userId={userId} examId={studyItem.Exam?.studyItemId ?? 0} setIsAddingQuestion={() => setSelectedQuestion(null)} fetchQuestions={fetchQuestions} question={question} />
                          </div>
                        </Modal>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Form thêm câu hỏi */}
        {isAddingQuestion ? (
          <div>
            <AddQuestionForm userId={userId} examId={studyItem.Exam?.studyItemId ?? 0} setIsAddingQuestion={setIsAddingQuestion} fetchQuestions={fetchQuestions} />
          </div>
        ) : (
          <div
            className="cursor-pointer flex justify-center text-white bg-teal-500 w-32 p-1 mt-2"
            onClick={() => setIsAddingQuestion(true)}
          >
            Thêm câu hỏi
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamDetail
