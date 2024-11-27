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
import { DeleteOutline, EditTwoTone, VisibilityOff } from '@mui/icons-material'
import EditQuestionForm from './EditQuestionForm'
import { deleteQuestion } from 'api/delete/delete.api'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd'
import { questionOrderItem } from 'api/put/put.interface'
import { stopUsingQuestion, updateQuestionOrder } from 'api/put/put.api'
import 'react-quill/dist/quill.snow.css'
import { StyledQuill } from './ReactQuillConfig'
import DeleteModal from 'pages/management/component/DeleteModal'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

interface DetailProps {
  studyItem: StudyItem
  load: boolean
  userId: number
  courseStatus: number
}

const ExamDetail: React.FC<DetailProps> = ({ studyItem, load, userId, courseStatus }): JSX.Element => {
  const { t } = useTranslation()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedHiddenQuestion, setSelectedHiddenQuestion] = useState<number | null>(null)
  const [selectedDeleteQuestion, setSelectedDeleteQuestion] = useState<number | null>(null)
  const isRequestStatus = [1, 5, 6, 7].includes(courseStatus)
  const isExamPublic = studyItem.status === 1

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
    if (selectedDeleteQuestion != null) {
      await deleteQuestion(selectedDeleteQuestion).then(() => {
        setSelectedQuestion(null)
        toast.success('Xóa thành công')
        void fetchQuestions()
      }).catch((error) => {
        toast.error('Có lỗi xảy ra khi xóa câu hỏi')
        console.error(error)
      })
    }
  }

  const handleStopUsingQuestion = async (): Promise<void> => {
    try {
      if (selectedHiddenQuestion != null) {
        const response = await stopUsingQuestion(selectedHiddenQuestion)
        response.status === 200 && setSelectedHiddenQuestion(null)
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
                        className="flex items-center group w-full justify-between hover:pt-1 hover:border-b-2"
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
                        <div className='flex' {...provided.dragHandleProps}>
                          {(courseStatus === 0 || !isExamPublic) && (
                            <>
                              <IconButton onClick={() => setSelectedQuestion(question)} className="h-6 p-0 opacity-0 group-hover:opacity-100">
                                <EditTwoTone fontSize="small" />
                              </IconButton>
                              <IconButton onClick={() => { setSelectedDeleteQuestion(question.id ?? null) }} className="h-6 p-0 opacity-0 group-hover:opacity-100">
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                              <IconButton style={{ cursor: 'grab' }} className='h-6 opacity-0 group-hover:opacity-100'>
                                <DragIndicatorIcon className='w-1/2' fontSize='small' />
                              </IconButton>
                            </>
                          )}
                          {(courseStatus > 1 && isExamPublic) &&
                            <IconButton onClick={() => setSelectedHiddenQuestion(question.id ?? null)} className={`h-6 p-0 ${question.isQuestionStopped ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
                              <VisibilityOff fontSize="small" />
                            </IconButton>
                          }
                          <DeleteModal
                            isOpen={selectedHiddenQuestion === question.id}
                            onClose={() => setSelectedHiddenQuestion(null)}
                            onDelete={async () => await handleStopUsingQuestion()}
                            warningText={t('curriculum.warningHiddenQuestion')}
                          />
                          <DeleteModal
                            isOpen={selectedDeleteQuestion === question.id}
                            onClose={() => setSelectedDeleteQuestion(null)}
                            onDelete={async () => await handleDeleteQuestion()}
                            warningText={t('curriculum.warningText')}
                          />
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
            className={`flex justify-center text-white bg-teal-500 w-32 py-1.5 mt-2 rounded-md ${isExamPublic ? 'hidden' : ''} ${isRequestStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            onClick={(isRequestStatus || isExamPublic) ? undefined : () => setIsAddingQuestion(true)}
          >
            Thêm câu hỏi
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamDetail
