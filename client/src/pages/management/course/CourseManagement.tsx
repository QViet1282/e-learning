/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: CourseManagementPage
   ========================================================================== */
import * as React from 'react'
import { DataGrid, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid'
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
// import './courseList.ts'
import { StyledDataGrid } from './courseList'
import { getAllCourse } from 'api/get/get.api'
import { useNavigate } from 'react-router-dom'
import ROUTES from 'routes/constant'
const columns = [
  { field: 'id', headerName: 'ID', width: 50 },
  {
    field: 'locationPath',
    headerName: 'Image',
    width: 150,
    renderCell: (params: GridRenderCellParams<string>) => (
      <img className='' src={params.value} alt="course" style={{ width: '100%', height: '80%' }} />
    )
  },
  { field: 'name', headerName: 'Course Name', width: 230 },
  { field: 'summary', headerName: 'Summary', width: 380 },
  { field: 'durationInMinute', headerName: 'Duration (min)', type: 'number', width: 110 },
  { field: 'price', headerName: 'Price (USD)', type: 'number', width: 110 }
  // {
  //   field: 'actions',
  //   headerName: 'Actions',
  //   width: 150,
  //   renderCell: (params: GridRenderCellParams) => (
  //     <>
  //       <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
  //         <EditIcon />
  //       </IconButton>
  //       <IconButton color="secondary" onClick={() => handleDelete(params.row.id)}>
  //         <DeleteIcon />
  //       </IconButton>
  //     </>
  //   )
  // }
]

function handleEdit (id: number): void {
  console.log('Edit', id)
}

function handleDelete (id: number): void {
  console.log('Delete', id)
}
const CourseManagementPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [courseData, setCourseData] = useState({
    categoryCourseId: '',
    name: '',
    summary: '',
    assignedBy: '',
    durationInMinute: '',
    startDate: null,
    endDate: null,
    description: '',
    locationPath: '',
    prepare: '',
    price: ''
  })
  const [thumbnailURL, setThumbnailURL] = useState<string | null>(null)

  React.useEffect(() => {
    getAllCourse().then((res) => {
      setCourses(res.data)
      setFilteredCourses(res.data)
    })
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target?.files?.[0]
    if (file) {
      setCourseData((prevData) => ({
        ...prevData,
        thumbnail: file
      }))

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setThumbnailURL(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClickOpen = () => {
    setOpen(true) // Mở modal add course
  }

  const handleClose = () => {
    setOpen(false) // Đóng modal add course
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setCourseData({
      ...courseData,
      [name]: value
    })
  }

  const handleSave = () => {
    // Thực hiện lưu khóa học mới (ví dụ: gọi API)
    console.log('Course Data:', courseData)
    setOpen(false) // Đóng modal sau khi lưu
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const searchTerm = event.target.value.toLowerCase()
    setSearch(searchTerm)
    const filteredRows = filteredCourses.filter(row =>
      row.name.toLowerCase().includes(searchTerm) ||
      row.instructor.toLowerCase().includes(searchTerm)
    )
    setFilteredCourses(filteredRows)
  }

  const handleRowClick = (params: GridRowParams): void => {
    console.log('Row clicked:', params.row.id)
    navigate(ROUTES.detailCourse, { state: { courseId: params.row.id, courseData: params.row } })
  }
  return <div className='ml-0 md:ml-14 p-8'>
    <h2 className='text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 mb-8 tracking-wider' style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)' }}>
      Course Management
    </h2>
    <Container>
      <div className='flex items-center justify-between mb-4 space-x-4'>
      <TextField
        label="Search by course name"
        variant="outlined"
        className='w-4/5'
        onChange={handleSearchChange}
      />
      <button className='bg-teal-600 text-white font-semibold md:py-4 py-1 px-4 w-1/5 rounded hover:bg-teal-500'
      onClick={() => {
        // navigate(ROUTES.addCourse)
        handleClickOpen()
      }}
      >
        <text className='!important'>Add Course</text>
      </button>
    </div>
      <div className='w-full h-140'>
        <StyledDataGrid
          className="data-grid"
          rows={filteredCourses}
          columns={columns}
          pageSize={10}
          // rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
          rowHeight={80}
          onRowClick={handleRowClick}
        />
      </div>
    </Container>
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Course Name"
            fullWidth
            variant="outlined"
            value={courseData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="summary"
            label="Course Summary"
            fullWidth
            variant="outlined"
            value={courseData.summary}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="durationInMinute"
            label="Duration (Minutes)"
            type="number"
            fullWidth
            variant="outlined"
            value={courseData.durationInMinute}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price (USD)"
            type="number"
            fullWidth
            variant="outlined"
            value={courseData.price}
            onChange={handleInputChange}
          />
          <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    display: 'block',
                    marginTop: '8px'
                  }}
                />
                {thumbnailURL && (
                  <div style={{ marginTop: '16px' }}>
                    <img
                      src={thumbnailURL}
                      alt="Thumbnail Preview"
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        height: 'auto',
                        borderRadius: '8px',
                        border: '1px solid #ccc'
                      }}
                    />
                  </div>
                )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
  </div>
}
export default CourseManagementPage
