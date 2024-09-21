/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: COURSEPAGE
   ========================================================================== */
// AdminPage.tsx
import React, { useState } from 'react'
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Box,
  Select,
  InputLabel,
  FormControl,
  AppBar,
  Toolbar
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

const categories = [
  { id: 1, name: 'Programming' },
  { id: 2, name: 'Design' },
  { id: 3, name: 'Marketing' }
  // Thêm các danh mục khác nếu cần
]

export default function AddCoursePage (): JSX.Element {
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setCourseData({ ...courseData, [name]: value })
  }

  const handleSelectChange: any = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCourseData({ ...courseData, categoryCourseId: event.target.value as string })
  }

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

  const handleSubmit = () => {
    // Xử lý dữ liệu khi gửi
    console.log(courseData)
  }

  return (
    <LocalizationProvider>
      {/* <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" onClick={() => window.history.back()}>
            Back to Previous Page
          </Button>
        </Toolbar>
      </AppBar> */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="auto"
      >
        <Box width="60%" maxWidth="800px" className='border p-10 mx-10 my-2'>
          {/* <Typography
            variant="h4"
            gutterBottom
            align="center"
            style={{
              color: 'black',
              marginTop: '20px', // Adjust the value as needed
              transition: 'color 0.3s ease-in-out, transform 0.3s ease-in-out'
            }}
          >
            <h2 className='text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 mb-8 tracking-wider' style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)' }}>
              Course Management
            </h2>
          </Typography> */}

          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <p className='text-2xl mb-2'>What would you like to name your course?</p>
                <TextField
                  fullWidth
                  label="Course Name"
                  name="name"
                  value={courseData.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <p className='text-2xl mb-2'>Which category does this course belong to?</p>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={courseData.categoryCourseId}
                    onChange={handleSelectChange}
                    label="Category"
                    name="categoryCourseId"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <p className='text-2xl mb-2'>Can you summarize the content of your course in a few lines?</p>
                <TextField
                  fullWidth
                  label="Summary"
                  name="summary"
                  value={courseData.summary}
                  onChange={handleInputChange}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <p className="text-2xl mb-2">Where can we find the thumbnail for your course?</p>
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
              </Grid>
            </Grid>
            <div className='mt-3 h-14 flex justify-center'>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Add Course
              </Button>
            </div>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}
