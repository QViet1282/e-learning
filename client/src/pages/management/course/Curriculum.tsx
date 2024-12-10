/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* PAGE: CURRICULUM
   ========================================================================== */
import React, { useState, useEffect } from 'react'
import { getCategoryLessionByCourse } from 'api/get/get.api'
import CategoryLessionItem from './components/CategoryLesionItem'
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd'
import { createCategoryLession } from 'api/post/post.api'
import { newCategory } from 'api/post/post.interface'
import { GridCloseIcon } from '@mui/x-data-grid'
import { categoryLessionOrderItem } from 'api/put/put.interface'
import { updateCategoryLessionOrder } from 'api/put/put.api'
import { Category } from 'api/get/get.interface'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { Save } from '@mui/icons-material'

interface DraggableCategory extends Category {
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | undefined
}

interface CurriculumProps {
  courseId: number
  courseStatus: number
}

interface Tokens {
  accessToken: string
  email: string | null
  firstName: string | null
  id: number
  key: string
  lastName: string | null
  username: string
}

const Curriculum: React.FC<CurriculumProps> = ({ courseId, courseStatus }) => {
  const { t } = useTranslation()
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const tokensString = localStorage.getItem('tokens')
  const tokens: Tokens | null = (tokensString != null) ? JSON.parse(tokensString) : null
  const isRequestStatus = [1, 5, 6, 7].includes(courseStatus)

  useEffect(() => {
    fetchCategories()
  }, [courseId])

  const fetchCategories = async () => {
    try {
      if (!Number.isNaN(courseId)) {
        const response = await getCategoryLessionByCourse(courseId)
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Xử lý khi kéo và thả category
  const handleOnDragEnd = async (result: DropResult) => {
    if (result.destination == null) return

    const items: Category[] = Array.from(categories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setCategories(
      items.map((item, index) => ({
        ...item,
        order: index + 1
      }))
    )
    const updatedCategories = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    setCategories(updatedCategories)

    try {
      const newOrder = result.destination.index + 1
      if (reorderedItem.id != null) {
        const categoryLessionOrderUpdate: categoryLessionOrderItem = { lessionCategoryId: reorderedItem.id, oldOrder: reorderedItem.order, newOrder, courseId, updatedAt: reorderedItem.updatedAt }
        const response = await updateCategoryLessionOrder(categoryLessionOrderUpdate)
        console.log('Ket qua keo tha', response.status)
      }
    } catch (error) {
      console.error('Error updating categories:', error)
    }
  }

  const handleAddClick = (): void => {
    setIsAddingCategory(true)
  }

  const handleCancelClick = (): void => {
    setIsAddingCategory(false)
    setNewCategoryName('')
  }

  const handleSaveClick = async (): Promise<void> => {
    if (newCategoryName.trim() === '') {
      toast.error(t('curriculum.errorCategoryName'))
      return
    }

    const newCategory: newCategory = {
      id: undefined,
      courseId,
      name: newCategoryName,
      order: categories.length + 1
    }

    try {
      await createCategoryLession(newCategory).then(() => {
        toast.success(t('curriculum.successCreateCategory'))
      }).catch(() => {
        toast.error(t('curriculum.errorCreateCategory'))
      })
      fetchCategories()
      setIsAddingCategory(false)
      setNewCategoryName('')
    } catch (error) {
      toast.error(t('curriculum.errorCreateCategory'))
    }
  }

  return (
    <div className='flex flex-col w-full max-w-6xl mx-auto'>
      <div className='w-full border-b-2'>
        <div className="text-3xl font-bold p-2">
          {t('curriculum.title')}
        </div>
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="categories">
          {(provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className='grid grid-cols-1 gap-4 my-4'>
              {categories.map((category, index) => (
                <Draggable key={category.id} draggableId={category.id?.toString() ?? ''} index={index}>
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <CategoryLessionItem
                        lessionCategoryId={category.id ?? 0}
                        userId={tokens?.id ?? 0}
                        // courseId={courseId}
                        courseStatus={courseStatus}
                        name={category.name}
                        order={category.order}
                        fetchCategories={fetchCategories}
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        dragHandleProps={(provided.dragHandleProps) ?? undefined}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isAddingCategory
        ? (
          <div className="flex flex-col flex-1 p-2 md:w-1/3 relative border-4 bg-white">
            <div className="w-full flex justify-between items-center">
              <p className='font-bold py-2'>{t('curriculum.addNewCategoryTitle')}</p>
              <GridCloseIcon onClick={handleCancelClick} />
            </div>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className='w-full h-10 items-center justify-center px-2 border-solid border-gray-300 focus:outline-none'
              style={{ borderWidth: '1px' }}
              placeholder={t('curriculum.categoryNamePlaceholder').toString()}
            />
            <div className='w-full space-x-2 justify-end flex'>
              <div className="mt-2 py-1 px-2 cursor-pointer flex justify-center items-center gap-1 text-white text-lg hover:bg-teal-400 bg-teal-500 rounded-md active:scale-95" onClick={handleSaveClick} >
                <p>{t('curriculum.button.save')}</p>
                <Save fontSize='small'/>
              </div>
            </div>
          </div>
          )
        : (
          <div className='w-56'>
            <div className={`flex justify-center text-white bg-teal-500 w-full p-2 rounded-md ${isRequestStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
             onClick={isRequestStatus ? undefined : handleAddClick}>
              {t('curriculum.addNewCategoryButton')}
            </div>
          </div>

          )}
    </div>
  )
}

export default Curriculum
