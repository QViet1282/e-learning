/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import * as React from 'react'
import { GridRenderCellParams, GridRowParams } from '@mui/x-data-grid'
import { Button, Modal, TextField } from '@mui/material'
import { useState, useEffect, ChangeEvent } from 'react'
import { StyledDataGrid } from './courseList'
import { getAllCategoryCourse, getAllCourse } from 'api/get/get.api'
import { useNavigate } from 'react-router-dom'
import ROUTES from 'routes/constant'
import { CategoryCourse } from 'api/get/get.interface'
import { createCourse } from 'api/post/post.api'
import { newCourse as NewCourseInterface } from 'api/post/post.interface'

const columns = [
  { field: 'id', headerName: 'ID', width: 50 },
  {
    field: 'locationPath',
    headerName: 'Image',
    width: 150,
    renderCell: (params: GridRenderCellParams<string>) => (
      <img
        src={
          params.value
            ? require(`../../../assets/images/uploads/courses/${params.value}`)
            : 'https://picsum.photos/200/300'
        }
        alt="course"
        style={{ width: '100%', height: '80%' }}
      />
    )
  },
  { field: 'name', headerName: 'Course Name', width: 230 },
  { field: 'summary', headerName: 'Summary', width: 380 },
  { field: 'durationInMinute', headerName: 'Duration (min)', type: 'number', width: 110 },
  { field: 'price', headerName: 'Price (USD)', type: 'number', width: 110 }
]

interface Tokens {
  accessToken: string
  email: string | null
  firstName: string | null
  id: number
  key: string
  lastName: string | null
  username: string
}

const CourseManagementPage = (): JSX.Element => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [courseCategories, setCourseCategories] = useState<CategoryCourse[]>([])
  const tokensString = localStorage.getItem('tokens')
  const tokens: Tokens | null = (tokensString != null) ? JSON.parse(tokensString) : null
  const [newCourse, setNewCourse] = useState<NewCourseInterface>({
    categoryCourseId: 0,
    name: '',
    assignedBy: tokens?.id
  })
  useEffect(() => {
    getAllCourse().then((res) => {
      setCourses(res.data)
      setFilteredCourses(res.data)
    })
    void fetchCourseCategories()
  }, [])

  const fetchCourseCategories = async (): Promise<void> => {
    try {
      const response = await getAllCategoryCourse()
      setCourseCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = event.target
    setNewCourse({ ...newCourse, [name]: value })
  }

  const handleSave = async (): Promise<void> => {
    if (!newCourse.categoryCourseId) {
      alert('Please select a valid category.')
      return
    }
    if (!newCourse.name) {
      alert('Tên không được để trống')
      return
    }
    try {
      const response = await createCourse(newCourse)
      console.log('Course Data:', newCourse)
      setOpen(false)
      navigate(ROUTES.detailCourse, {
        state: { courseId: response.data.id }
      })
    } catch (error) {
      console.error('Error creating course:', error)
    }
  }

  const handleRowClick = (params: GridRowParams): void => {
    navigate(ROUTES.detailCourse, {
      state: { courseId: params.row.id }
    })
  }

  return (
    <div className="ml-0 md:ml-14 py-8 md:px-8 px-2">
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 mb-8">
        Course Management
      </h2>
      <div>
        <div className="flex items-center justify-between mb-4 space-x-4">
          <TextField
            label="Search by course name"
            variant="outlined"
            className="w-4/5"
            onChange={(e) =>
              setFilteredCourses(
                courses.filter((course) =>
                  course.name.toLowerCase().includes(e.target.value.toLowerCase())
                )
              )
            }
          />
          <button
            className="bg-teal-600 text-white font-semibold md:py-4 py-1 px-4 w-1/5 rounded hover:bg-teal-500"
            onClick={() => setOpen(true)}
          >
            Add Course
          </button>
        </div>
        <div className="w-full h-140">
          <StyledDataGrid
            rows={filteredCourses}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            rowHeight={100}
            onRowClick={handleRowClick}
          />
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex items-center justify-center min-h-screen p-2">
          <div className="bg-white w-96 p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
            <label className="block text-sm font-medium text-gray-700">
              Course Name
            </label>
            <input
              type="text"
              name="name"
              value={newCourse.name}
              onChange={handleInputChange}
              className="w-full h-9 px-2 mt-1 border border-gray-300 rounded-md focus:outline-none"
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="categoryCourseId"
                value={newCourse.categoryCourseId}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="0" disabled hidden>
                  Select a category
                </option>
                {courseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button onClick={() => setOpen(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={() => {
                handleSave().catch((error) => {
                  console.error('Save failed:', error)
                })
              }} color="primary">
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CourseManagementPage
