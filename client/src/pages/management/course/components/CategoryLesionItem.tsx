/* eslint-disable @typescript-eslint/indent */
/* eslint-disable quote-props */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* PAGE: CategoryLessionItem
   ========================================================================== */
import React, { useEffect, useMemo, useState } from 'react'
import { StyledPaper, StyledTypography } from '../courseList'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { Box, IconButton, Collapse, TextField, Button, Modal } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getAllQuestionByExamId, getStudyItemByCategoryLessionId } from 'api/get/get.api'
import { GridCloseIcon } from '@mui/x-data-grid'
import UploadAndDisplayVideo from './UploadVideo'
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd'
import { Question, StudyItem } from 'api/get/get.interface'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import { StudyItemOrderItem } from 'api/put/put.interface'
import { editCategoryLession, updateStudyItemOrder } from 'api/put/put.api'
import { AssignmentTurnedIn, CheckBoxOutlineBlankSharp, CheckOutlined, ListAlt, PictureAsPdf, PictureAsPdfOutlined, Quiz, QuizOutlined, VideoLibraryOutlined, Add, Remove, Edit, EditOutlined, EditTwoTone, Close, DeleteOutline } from '@mui/icons-material'
import QuillResizeImage from 'quill-resize-image'
import ImageUploader from 'quill-image-uploader'

import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import LessionDetail from './LessionDetail'
import ExamDetail from './ExamDetail'
import AddExamForm from './AddExamForm'
import AddLessionForm from './AddLessionForm'
import EditLessionForm from './EditLessionForm'
import EditExamForm from './EditExamForm'
import { deleteCategoryLession, deleteStudyItem } from 'api/delete/delete.api'

Quill.register('modules/imageUploader', ImageUploader)
Quill.register('modules/resize', QuillResizeImage)

interface DraggableStudyItem extends StudyItem {
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | undefined
}

interface CategoryItemProps {
  lessionCategoryId: number
  userId: number
  courseId: number
  name: string
  order: number
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  fetchCategories: () => Promise<void>
}

const CategoryLessonItem: React.FC<CategoryItemProps> = ({ lessionCategoryId, userId, courseId, name, order, dragHandleProps, fetchCategories }) => {
  const [openLessonIds, setOpenLessonIds] = useState<number[]>([])
  const [studyItems, setStudyItems] = useState<StudyItem[]>([])
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [isAddingExam, setIsAddingExam] = useState(false)
  const [seletedDeleteStudyItem, setSeletedDeleteStudyItem] = useState<number | null>(null)
  const [openModalEditCategoryLession, setOpenModalEditCategoryLession] = useState(false)
  const [selectedStudyItem, setSelectedStudyItem] = useState<StudyItem | null>(null)
  const [openModalDeleteLessionCategory, setOpenModalDeleteLessionCategory] = useState(false)
  const [newNameCategory, setNewNameCategory] = useState<string>(name)
  const [nameCategory, setNameCategory] = useState<string>(name)
  useEffect(() => {
    void fetchStudyItems()
  }, [lessionCategoryId])

  const fetchStudyItems = async (): Promise<void> => {
    try {
      if (lessionCategoryId !== 0) {
        const response = await getStudyItemByCategoryLessionId(lessionCategoryId)
        setStudyItems(response.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleToggle = (studyItemId: number): void => {
    if (openLessonIds.includes(studyItemId)) {
      setOpenLessonIds(openLessonIds.filter(id => id !== studyItemId))
    } else {
      setOpenLessonIds([...openLessonIds, studyItemId])
    }
  }

  const handleOnDragEnd = async (result: DropResult) => {
    if (result.destination == null) return

    const items = Array.from(studyItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // setStudyItems(
    //   items.map((item, index) => ({
    //     ...item,
    //     order: index + 1
    //   }))
    // )
    const updatedLessons = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    setStudyItems(updatedLessons)

    try {
      const newOrder = result.destination.index + 1
      if (reorderedItem.id != null) {
        const StudyItemOrderUpdate: StudyItemOrderItem = { studyItemId: reorderedItem.id, oldOrder: reorderedItem.order, newOrder, lessionCategoryId, updatedAt: reorderedItem.updatedAt }
        const response = await updateStudyItemOrder(StudyItemOrderUpdate)
        console.log('Ket qua keo tha', response.status)
      }
    } catch (error) {
      console.error('Error updating categories:', error)
    }
  }

  const handleSaveCategoryLession = async (): Promise<void> => {
    const payload = {
      name: newNameCategory,
      order: null
    }
    try {
      const response = await editCategoryLession(lessionCategoryId, payload)
      if (response.status === 200) {
        setOpenModalEditCategoryLession(false)
        setNameCategory(newNameCategory)
      }
    } catch (error) {
      setNewNameCategory(nameCategory)
      console.error('Error edit category:', error)
    }
  }

  // Xoa categorylession
  const handleDeleteCategoryLession = async (): Promise<void> => {
    try {
      if (studyItems.length > 0) {
        setOpenModalDeleteLessionCategory(false)
        alert('Không thể xóa. Có phần tử liên kết với chương này.')
        return
      }
      const response = await deleteCategoryLession(lessionCategoryId)
      response.status === 200 && setOpenModalDeleteLessionCategory(false)
    } catch (error) {
      console.error('Error edit category:', error)
    }
    void fetchCategories()
  }

  // Xoa studyItem
  const handleDeleteStudyItem = async (): Promise<void> => {
    try {
      if (seletedDeleteStudyItem != null) {
        const response = await deleteStudyItem(seletedDeleteStudyItem)
        response.status === 200 && setOpenModalEditCategoryLession(false)
      }
    } catch (error) {
      console.error('Error edit category:', error)
    }
    void fetchStudyItems()
  }

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image', 'formula'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
    imageUploader: {
      upload: async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')
        try {
          const response = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/upload`, formData)
          const imageUrl = response.data.secure_url
          return imageUrl // Trả về URL của ảnh sau khi upload thành công
        } catch (error) {
          console.error('Error uploading image:', error)
          throw new Error('Image upload failed')
        }
      }
    },
    resize: {
      locale: {}
    }
  }), [])
  console.log(studyItems)

  return (
    <div key={lessionCategoryId} className="px-4 py-2 flex flex-col bg-gray-100 shadow-md rounded-lg">
      <div className="flex items-center justify-between group">
        <div className="flex items-center w-4/5">
          <div className="text-xl font-medium leading-6 tracking-wide mr-2 whitespace-nowrap overflow-hidden break-words text-ellipsis max-w-full">
            Chương {order}: {nameCategory}
          </div>
          <div className='flex opacity-0 group-hover:opacity-100'>
            <IconButton onClick={() => setOpenModalEditCategoryLession(true)}>
              <EditTwoTone fontSize='small' />
            </IconButton>
            <IconButton onClick={() => setOpenModalDeleteLessionCategory(true)}>
              <DeleteOutline fontSize='small' />
            </IconButton>
            <Modal open={openModalDeleteLessionCategory} onClose={() => setOpenModalDeleteLessionCategory(false)} className='flex justify-center items-center'>
              <div className="flex flex-col justify-center items-center p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-2 text-gray-800">Xác nhận xóa</h2>
                <p className="text-gray-600 text-center mb-4">
                  Bạn có chắc chắn muốn xóa chương trình giảng dạy này?
                </p>
                <div className="flex justify-between mt-4 w-full">
                  <div
                    className="p-2 flex-1 cursor-pointer flex justify-center items-center text-lg text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-200"
                    onClick={() => { void handleDeleteCategoryLession() }}
                  >
                    Xóa
                  </div>
                  <div
                    className="p-2 flex-1 cursor-pointer flex justify-center items-center text-lg text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-200 ml-2"
                    onClick={() => setOpenModalDeleteLessionCategory(false)}
                  >
                    Hủy
                  </div>
                </div>
              </div>

            </Modal>
          </div>
        </div>
        <div {...dragHandleProps} style={{ cursor: 'grab' }}>
          <IconButton style={{ cursor: 'grab' }}>
            <DragIndicatorIcon />
          </IconButton>
          <Modal open={openModalEditCategoryLession} onClose={() => setOpenModalEditCategoryLession(false)} className='flex justify-center items-center'>
            <div className='flex justify-center items-center md:w-4/12'>
              <div className="flex flex-col flex-1 p-2 mb-4 relative border-4 gap-3 bg-white">
                <div className="w-full flex justify-between items-center">
                  <p className='font-bold'>Chỉnh sửa tên chương học</p>
                  <IconButton onClick={() => {
                    setOpenModalEditCategoryLession(false)
                    setNewNameCategory(nameCategory)
                  }}>
                    <Close />
                  </IconButton>
                </div>
                <textarea
                  value={newNameCategory}
                  onChange={(e) => setNewNameCategory(e.target.value)}
                  className='w-full h-10 items-center pt-2 justify-center px-2 border-solid border-gray-300 focus:outline-none'
                  style={{ borderWidth: '1px' }}
                  placeholder='Tên chương'
                />
                <div className="p-2 cursor-pointer flex justify-center text-white text-lg hover:bg-teal-400 bg-teal-500" onClick={async () => await handleSaveCategoryLession()}>
                  Lưu
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      <Box>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="studyItems">
            {(provided: DroppableProvided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 my-2 ">
                {studyItems.map((studyItem, index) => (
                  <Draggable key={studyItem.id} draggableId={studyItem.id?.toString() ?? '0'} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div key={studyItem.id} className="mb-4 md:ml-24 md:mr-6 shadow p-3 bg-white">
                          <div className='flex justify-between w-full group'>
                            <div className="flex items-center justify-start pl-2 bg-white">
                              {studyItem.itemType === 'lession'
                                ? <p className='mr-2'>{studyItem.Lession?.type === 'MP4' ? <VideoLibraryOutlined /> : <PictureAsPdfOutlined />} {studyItem.order}. {studyItem.name}</p>
                                : <p className='mr-2'><QuizOutlined /> {studyItem.order}. {studyItem.name}</p>}
                              <div className='flex opacity-0 group-hover:opacity-100'>
                                <IconButton onClick={() => setSelectedStudyItem(studyItem)}>
                                  <EditTwoTone fontSize='small' />
                                </IconButton>
                                <IconButton onClick={() => setSeletedDeleteStudyItem(studyItem.id ?? null)}>
                                  <DeleteOutline fontSize='small' />
                                </IconButton>
                                <Modal open={seletedDeleteStudyItem === studyItem.id} onClose={() => setSeletedDeleteStudyItem(null)} className='flex justify-center items-center'>
                                  <div className="flex flex-col justify-center items-center p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
                                    <h2 className="text-2xl font-semibold mb-2 text-gray-800">Xác nhận xóa</h2>
                                    <p className="text-gray-600 text-center mb-4">
                                      Bạn có chắc chắn muốn xóa chương trình giảng dạy này?
                                    </p>
                                    <div className="flex justify-between mt-4 w-full">
                                      <div
                                        className="p-2 flex-1 cursor-pointer flex justify-center items-center text-lg text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-200"
                                        onClick={() => { void handleDeleteStudyItem() }}
                                      >
                                        Xóa
                                      </div>
                                      <div
                                        className="p-2 flex-1 cursor-pointer flex justify-center items-center text-lg text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-200 ml-2"
                                        onClick={() => setSeletedDeleteStudyItem(null)}
                                      >
                                        Hủy
                                      </div>
                                    </div>
                                  </div>

                                </Modal>
                              </div>
                            </div>
                            <div className='flex justify-end'>
                              <Modal
                                open={selectedStudyItem?.id === studyItem.id}
                                onClose={() => setSelectedStudyItem(null)}
                                className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
                              >
                                <div className=" max-w-5xl max-h-[90vh] overflow-y-auto rounded-md">
                                  {studyItem.itemType === 'lession'
                                    ? (
                                      <EditLessionForm
                                        setIsEditingLession={() => setSelectedStudyItem(null)}
                                        userId={userId}
                                        lessionCategoryId={lessionCategoryId}
                                        fetchStudyItems={fetchStudyItems}
                                        studyItem={studyItem}
                                      />
                                    )
                                    : (
                                      <EditExamForm
                                        setIsEditingExam={() => setSelectedStudyItem(null)}
                                        userId={userId}
                                        lessionCategoryId={lessionCategoryId}
                                        fetchStudyItems={fetchStudyItems}
                                        studyItem={studyItem}
                                      />
                                    )}
                                </div>
                              </Modal>

                              {/* Icon mở rộng bài học */}
                              <IconButton onClick={() => handleToggle(studyItem.id ?? 0)}>
                                {openLessonIds.includes(studyItem.id ?? 0)
                                  ? <ExpandMoreIcon className='w-1/2' />
                                  : <ExpandMoreIcon style={{ transform: 'rotate(180deg)' }} />}
                              </IconButton>

                              {/* Icon để kéo thả bài học */}
                              <IconButton {...provided.dragHandleProps} style={{ cursor: 'grab' }}>
                                <DragIndicatorIcon className='w-1/2' />
                              </IconButton>

                            </div>
                          </div>
                          {/* Nội dung mở rộng của bài học hoặc bài kiểm tra */}
                          <Collapse in={openLessonIds.includes(studyItem.id ?? 0)}>
                            {studyItem.itemType === 'lession'
                              ? <LessionDetail studyItem={studyItem} load={openLessonIds.includes(studyItem.id ?? 0)} />
                              : <ExamDetail studyItem={studyItem} userId={userId} load={openLessonIds.includes(studyItem.id ?? 0)} />}
                          </Collapse>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {/* Placeholder cho drag */}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Nút thêm bài học */}
        {isAddingLesson
          ? (
            <AddLessionForm setIsAddingLession={setIsAddingLesson} userId={userId} lessionCategoryId={lessionCategoryId} fetchStudyItems={fetchStudyItems} />
          )
          // eslint-disable-next-line multiline-ternary
          : isAddingExam ? (
            <AddExamForm userId={userId} lessionCategoryId={lessionCategoryId} setIsAddingExam={setIsAddingExam} fetchStudyItems={fetchStudyItems} />
          ) : (
            <div className='mb-4 ml-20 flex gap-3'>
              <div className='cursor-pointer flex justify-center text-white bg-teal-500 w-36 p-2' onClick={() => {
                setIsAddingLesson(true)
              }}>
                Thêm bài học
              </div>
              <div className='cursor-pointer flex justify-center text-white bg-teal-500 w-40 p-2' onClick={() => {
                setIsAddingExam(true)
              }}>
                Thêm trắc nghiệm
              </div>
            </div>
          )}
      </Box>
    </div>
  )
}

export default CategoryLessonItem
