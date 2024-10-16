/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react'
import 'tailwindcss/tailwind.css'
import { CategoryCourse, Course } from 'api/get/get.interface'
import { getAllCategoryCourse, getCourseById } from 'api/get/get.api'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { IconButton, Button } from '@mui/material'
import { ChangeCircle, Close } from '@mui/icons-material'
import QuillResizeImage from 'quill-resize-image'
import ImageUploader from 'quill-image-uploader'
import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import axios from 'axios'
import courseDefault from '../../../assets/images/default/course_default.png'
import { editCourseItem } from 'api/put/put.interface'
import { editCourse } from 'api/put/put.api'

interface OverviewProps {
  courseId?: number
  categoryCourseId?: number
  name?: string
  summary?: string
  description?: string
  locationPath?: string
  prepare?: string
  fetchCourse: () => Promise<void>
}

const CourseOverview: React.FC<OverviewProps> = ({ courseId, categoryCourseId, name, summary, description, locationPath, prepare, fetchCourse }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [updatedCourse, setUpdatedCourse] = useState<editCourseItem | null>(null)
  const [courseCategories, setCourseCategories] = useState<CategoryCourse[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    setUpdatedCourse({
      categoryCourseId: Number(categoryCourseId),
      name: name ?? '',
      summary: summary ?? '',
      description: description ?? '',
      locationPath: locationPath ?? '',
      prepare: prepare ?? ''
    })
    void fetchCourseCategories()
  }, [courseId])

  const fetchCourseCategories = async (): Promise<void> => {
    try {
      const response = await getAllCategoryCourse()
      setCourseCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    if (updatedCourse != null) {
      setUpdatedCourse({ ...updatedCourse, [name]: value })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file != null) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async (): Promise<void> => {
    if (updatedCourse != null) {
      try {
        // Nếu có hình ảnh mới, upload lên Cloudinary
        if (image != null) {
          const formData = new FormData()
          formData.append('file', image)
          formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')
          const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/image/upload`, formData)
          const imageUrl = cloudinaryResponse.data.secure_url
          setUpdatedCourse({ ...updatedCourse, locationPath: imageUrl })
        }

        await editCourse(courseId, updatedCourse)
        void fetchCourse()
        setIsEditing(false)
      } catch (error) {
        console.error('Error updating course:', error)
      }
    }
  }

  const modules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        ['link', 'image', 'formula'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['clean']
      ],
      imageUploader: {
        upload: async (file: File) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')
          try {
            const response = await axios.post(
              `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/upload`,
              formData
            )
            return response.data.secure_url
          } catch (error) {
            console.error('Error uploading image:', error)
            throw new Error('Image upload failed')
          }
        }
      },
      resize: { locale: {} }
    }),
    []
  )

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="w-full border-b-2">
        <div className="text-2xl font-bold">Tổng quan khóa học</div>
      </div>
      <div className="w-full shadow-lg rounded-lg bg-gray-100 h-auto mt-4 p-2">
        <div className="bg-white rounded-lg px-8 py-8">
          <>
            <div className="flex justify-between">
              <div className="flex items-center">
              <img
                src={imagePreview ?? ((updatedCourse?.locationPath) != null ? updatedCourse.locationPath : courseDefault)}
                alt="Thumbnail"
                className="w-96 h-52 object-cover"
              />
                {isEditing && (
                  <div className='ml-2'>
                    <label className="cursor-pointer text-white">
                      <ChangeCircle className='text-teal-500' fontSize='large' />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </label>
                  </div>
                )}
              </div>
              {isEditing
                ? (
                  <div className='flex gap-2'>
                    <div className="cursor-pointer flex justify-center text-white text-lg hover:bg-teal-400  mt-2 bg-teal-500 w-28 h-10 items-center"
                    onClick={() => {
                      handleSave().catch(error => {
                        console.error('Error while submitting:', error)
                      })
                    }}
                    >
                      Lưu
                    </div>
                    <div className="cursor-pointer flex justify-center text-white text-lg  mt-2 hover:bg-teal-400 bg-teal-500 w-28 h-10 items-center" onClick={() => {
                      setIsEditing(false)
                      setImagePreview(null)
                      setUpdatedCourse({
                        categoryCourseId: Number(categoryCourseId),
                        name: name ?? '',
                        summary: summary ?? '',
                        description: description ?? '',
                        locationPath: locationPath ?? '',
                        prepare: prepare ?? ''
                      })
                    }}>
                      Hủy
                    </div>
                  </div>
                  )
                : (
                  <div onClick={() => setIsEditing(true)} className="cursor-pointer flex justify-center mt-2 text-white text-lg hover:bg-teal-400 bg-teal-500 w-32 h-10 items-center">
                    Chỉnh sửa
                  </div>
                  )}
            </div>

            <div className="mt-4">
              <label className="block mb-2 font-extralight text-gray-700">Tên khóa học</label>
              {!isEditing
                ? (
                <div className="w-full h-10 px-2 border border-gray-300 bg-white flex items-center">
                  {name}
                </div>
                  )
                : (
                <input
                  type="text"
                  name="name"
                  value={updatedCourse?.name ?? ''}
                  onChange={handleInputChange}
                  className="w-full h-10 px-2 border border-gray-300 bg-white focus:outline-none"
                />
                  )}
            </div>

            <div className="mt-4 w-1/3">
              <label className="block font-extralight text-gray-700">Loại khóa học</label>
              {!isEditing
                ? (
                <div className="w-full mt-1 p-2 border border-gray-300 bg-white">
                  {
                    courseCategories.find(category => category.id === categoryCourseId)?.name
                  }
                </div>
                  )
                : (
                <select
                  name="categoryCourseId"
                  value={updatedCourse?.categoryCourseId ?? 0}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 bg-white focus:outline-none"
                >
                  <option value="0" disabled hidden>Select a category</option>
                  {courseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                  )}
            </div>

            <div className="mt-4">
              <label className="block mb-2 font-extralight text-gray-700">Lời giới thiệu khái quát</label>
              {!isEditing
                ? (
                <div className="w-full h-auto p-2 border border-gray-300 bg-white flex items-center">
                  {summary ?? 'Chưa có lời giới thiệu'}
                </div>
                  )
                : (
                <input
                  type="text"
                  name="summary"
                  value={updatedCourse?.summary ?? ''}
                  onChange={handleInputChange}
                  className="w-full h-10 px-2 border border-gray-300 bg-white focus:outline-none"
                />
                  )}
            </div>

            <div className="mt-4">
              <label className="block mb-2 font-extralight text-gray-700">Mô tả chi tiết</label>
              {!isEditing
                ? (
                  <div
                    className="w-full h-auto p-2 border border-gray-300 bg-white focus:outline-none overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: description ?? '' }}
                  />
                  )
                : (
                  <ReactQuill
                    theme="snow"
                    value={updatedCourse?.description ?? ''}
                    onChange={(value) => {
                      if (updatedCourse?.categoryCourseId !== undefined) {
                        setUpdatedCourse({ ...updatedCourse, description: value })
                      }
                    }}
                    readOnly={!isEditing}
                    className="w-full pb-0 md:h-auto"
                  />
                  )}
            </div>
          </>
        </div>
      </div >
    </div >
  )
}

export default CourseOverview
