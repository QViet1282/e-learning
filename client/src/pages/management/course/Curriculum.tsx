/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: CURRICULUM
   ========================================================================== */
import React, { useState, useEffect } from 'react'
import { StyledButton, StyledTypography } from './courseList'
import { TextField, IconButton, Box, Modal, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { getCategoryLessionByCourse } from 'api/get/get.api'
import CategoryLessionItem from './components/CategoryLesionItem'
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd'
import { createCategoryLession, updateCategoryLessions } from 'api/post/post.api'

interface Category {
  id: number
  courseId: number
  name: string
  order: number
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | undefined
}

interface CurriculumProps {
  courseId: number
}

const Curriculum: React.FC<CurriculumProps> = ({ courseId }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [courseId])

  const fetchCategories = async () => {
    try {
      if (courseId) {
        const response = await getCategoryLessionByCourse(courseId)
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Xử lý khi kéo và thả category
  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(categories)
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
      const response = await updateCategoryLessions(updatedCategories)
      console.log('Ket qua keo tha', response.status)
    } catch (error) {
      console.error('Error updating categories:', error)
    }
  }

  const handleAddClick = (): void => {
    setIsEditing(true)
  }

  const handleCancelClick = (): void => {
    setIsEditing(false)
    setNewCategoryName('')
  }

  const handleSaveClick = async (): Promise<void> => {
    const newCategory: Category = {
      id: 0,
      courseId,
      name: newCategoryName,
      order: categories.length + 1
    }
    try {
      const response = await createCategoryLession(newCategory)
      fetchCategories()
      console.log('Ket qua them newCategory', response.status)
    } catch (error) {
      console.error('Error create new category:', error)
    }
    setIsEditing(false)
    setNewCategoryName('')
  }

  return (
    <div className='flex flex-col w-full max-w-6xl mx-auto'>
      <div className='w-full border-b-2'>
        <StyledTypography variant="h4" fontWeight="bold">
          Curriculum
        </StyledTypography>
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="categories">
          {(provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className='grid grid-cols-1 gap-4 my-4'>
              {categories.map((category, index) => (
                <Draggable key={category.id} draggableId={category.id.toString()} index={index}>
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <CategoryLessionItem
                        id={category.id}
                        courseId={courseId}
                        name={category.name}
                        order={category.order}
                        dragHandleProps={provided.dragHandleProps || undefined}
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

      {/* Nút mở modal thêm category */}
      <div className='text-center border-2 mt-2 w-64'>
        <StyledButton onClick={handleAddClick}>Add new category lesson</StyledButton>
      </div>

      {/* Modal thêm category */}
      <Modal open={isEditing} onClose={handleCancelClick}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add Category</Typography>
            <IconButton onClick={handleCancelClick}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            label="Enter Category Name"
            variant="outlined"
            size="small"
            margin="dense"
            fullWidth
            style={{ marginBottom: 8 }}
          />
          <Box display="flex" justifyContent="flex-end">
            <IconButton onClick={handleSaveClick} color="primary">
              <AddIcon />
            </IconButton>
            <IconButton onClick={handleCancelClick} color="secondary">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Modal>
    </div>
  )
}

export default Curriculum
