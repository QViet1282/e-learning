/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { IconButton } from '@mui/material'
import { Add, Delete, DragIndicator } from '@mui/icons-material'
import { editCourseItem } from 'api/put/put.interface'
import { editCourse } from 'api/put/put.api'

interface TargetStudentsProps {
  courseId?: number
  description?: string
  prepare?: string
  fetchCourse: () => Promise<void>
}

const TargetStudents: React.FC<TargetStudentsProps> = ({
  courseId,
  description = '',
  prepare = '',
  fetchCourse
}) => {
  const filterValidLines = (line: string) => line.trim() !== ''
  const [updatedCourse, setUpdatedCourse] = useState<editCourseItem | null>(null)
  const [descriptions, setDescriptions] = useState<string[]>(description.split('.').filter(Boolean))
  const [preparations, setPreparations] = useState<string[]>(prepare.split('.').filter(Boolean))

  useEffect(() => {
    // Tách các chuỗi và loại bỏ các dòng trống
    const updatedDescriptions = description.split('.').filter(filterValidLines)
    const updatedPreparations = prepare.split('.').filter(filterValidLines)

    setDescriptions(updatedDescriptions)
    setPreparations(updatedPreparations)
    // setUpdatedCourse({
    //   prepare: prepare ?? '',
    //   description: description ?? ''
    // })
  }, [courseId, prepare, description])

  const handleAddItemAt = (index: number, setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState((prev) => {
      const newState = [...prev]
      newState.splice(index + 1, 0, '') // Thêm dòng trống mới sau dòng hiện tại
      return newState
    })
  }

  const handleInputChange = (
    index: number,
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) => {
      const newState = [...prev]
      newState[index] = value
      return newState
    })
  }

  const handleDeleteItem = (index: number, setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragEnd = (
    result: DropResult,
    items: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const { source, destination } = result
    if (destination == null) return

    const reorderedItems = [...items]
    const [movedItem] = reorderedItems.splice(source.index, 1)
    reorderedItems.splice(destination.index, 0, movedItem)
    setState(reorderedItems)
  }

  const renderList = (
    items: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <Droppable droppableId="list">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
          {items.map((item, index) => (
            <Draggable key={index} draggableId={`item-${index}`} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className="flex items-center space-x-2"
                >
                  <input
                    value={item}
                    onChange={(e) => handleInputChange(index, e.target.value, setState)}
                    className="w-full h-9 px-2 border-solid text-sm border-gray-300 border-2 focus:outline-none"
                  />
                  <IconButton onClick={() => handleDeleteItem(index, setState)} color="error">
                    <Delete />
                  </IconButton>
                  <div {...provided.dragHandleProps}>
                    <DragIndicator className="cursor-move" />
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          {/* Dòng cuối cùng để thêm mục mới */}
          <div className="flex items-center space-x-2">
            <input
              readOnly
              value="+ Thêm mục mới"
              className="w-full h-9 px-2 text-sm text-gray-500 border-2 border-dashed border-gray-300 cursor-pointer"
              onClick={() => handleAddItemAt(items.length - 1, setState)}
            />
          </div>
        </div>
      )}
    </Droppable>
  )

  const handleSave = async () => {
    const validDescriptions = descriptions.filter(filterValidLines).join('.')
    const validPreparations = preparations.filter(filterValidLines).join('.')
    console.log('Saved Descriptions:', validDescriptions)
    console.log('Saved Preparations:', validPreparations)
    await editCourse(courseId, { ...updatedCourse, description: validDescriptions, prepare: validPreparations })
    void fetchCourse()
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="w-full border-b-2">
        <div className="text-3xl font-bold p-2">Học viên mục tiêu</div>
      </div>

      <div className="w-full shadow-2xl mt-6 bg-slate-100 px-8 py-4 rounded-lg">
        <div className="text-lg font-light font-sans my-6">Các mô tả sau sẽ hiển thị công khai trên Trang tổng quan khóa học của bạn và sẽ tác động trực tiếp việc một học viên quyết định khóa học đó có phù hợp với họ hay không.</div>
        <div className="text-xl font-semibold mb-4">Học viên sẽ học được gì trong khóa học của bạn?</div>
        <DragDropContext onDragEnd={(result) => handleDragEnd(result, descriptions, setDescriptions)}>
          {renderList(descriptions, setDescriptions)}
        </DragDropContext>

        <div className="text-xl font-semibold mt-8 mb-4">Yêu cầu hoặc điều kiện tiên quyết để tham gia khóa học của bạn là gì?</div>
        <DragDropContext onDragEnd={(result) => handleDragEnd(result, preparations, setPreparations)}>
          {renderList(preparations, setPreparations)}
        </DragDropContext>

        <button
          onClick={handleSave}
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Lưu
        </button>
      </div>
    </div>
  )
}

export default TargetStudents
