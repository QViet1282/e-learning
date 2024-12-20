/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { IconButton } from '@mui/material'
import { Add, Delete, DragIndicator } from '@mui/icons-material'
import { editCourseItem } from 'api/put/put.interface'
import { editCourse } from 'api/put/put.api'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const filterValidLines = (line: string) => line.trim() !== ''
  const [updatedCourse, setUpdatedCourse] = useState<editCourseItem | null>(null)
  const [descriptions, setDescriptions] = useState<string[]>(description.split('.').filter(Boolean))
  const [preparations, setPreparations] = useState<string[]>(prepare.split('.').filter(Boolean))

  useEffect(() => {
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
      newState.splice(index + 1, 0, '')
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
              value={t('targetStudents.addNewItem').toString()}
              className="w-full h-9 px-2 text-sm text-gray-500 border-2 border-dashed border-gray-300 cursor-pointer focus:outline-none"
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
    await editCourse(courseId, { ...updatedCourse, description: validDescriptions, prepare: validPreparations }).then(() => {
      toast.success(t('targetStudents.updateSuccess'))
    }).catch(() => {
      toast.error(t('targetStudents.updateFailure'))
    })
    await fetchCourse()
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto min-h-screen">
      <div className="w-full border-b-2">
        <div className="text-3xl font-bold p-2">{t('targetStudents.title')}</div>
      </div>

      <div className="w-full shadow-2xl mt-6 bg-gradient-to-r from-gray-50 to-gray-100 md:px-8 px-4 py-4 rounded-lg">
        <div className="text-lg font-light font-sans my-6">{t('targetStudents.description')}</div>
        <div className="text-xl font-semibold mb-4">{t('targetStudents.learnWhat')}</div>
        <DragDropContext onDragEnd={(result) => handleDragEnd(result, descriptions, setDescriptions)}>
          {renderList(descriptions, setDescriptions)}
        </DragDropContext>
        <div className="text-xl font-semibold mt-8 mb-4">{t('targetStudents.requirements')}</div>
        <DragDropContext onDragEnd={(result) => handleDragEnd(result, preparations, setPreparations)}>
          {renderList(preparations, setPreparations)}
        </DragDropContext>

        <button
          onClick={handleSave}
          className="hover:bg-teal-400 bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 mt-4"
        >
          {t('targetStudents.saveUpdates')}
        </button>
      </div>
    </div>
  )
}

export default TargetStudents
