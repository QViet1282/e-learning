/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react'
import 'tailwindcss/tailwind.css'
import { CategoryCourse, Course } from 'api/get/get.interface'
import { getAllCategoryCourse, getCourseById } from 'api/get/get.api'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { ChangeCircle, Close, CloudUpload } from '@mui/icons-material'
import QuillResizeImage from 'quill-resize-image'
import ImageUploader from 'quill-image-uploader'
import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import axios from 'axios'
import { editCourseItem } from 'api/put/put.interface'
import { editCourse } from 'api/put/put.api'
import VideoOverview from './components/VideoOverview'

import BlotFormatter from 'quill-blot-formatter'
import { ImageActions } from '@xeger/quill-image-actions'
import { ImageFormats } from '@xeger/quill-image-formats'
import { toast } from 'react-toastify'

Quill.register('modules/blotFormatter', BlotFormatter)
Quill.register('modules/imageActions', ImageActions)
Quill.register('modules/imageFormats', ImageFormats)
interface OverviewProps {
  courseId?: number
  categoryCourseId?: number
  name?: string
  summary?: string
  locationPath?: string
  videoLocationPath?: string
  fetchCourse: () => Promise<void>
}

// Mặc định h3 cho quill
const Parchment = Quill.import('parchment')
const Block = Quill.import('blots/block')
Block.tagName = 'H3'
Quill.register(Block, true)

const CourseOverview: React.FC<OverviewProps> = ({ courseId, categoryCourseId, name, summary, locationPath, videoLocationPath, fetchCourse }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [courseCategories, setCourseCategories] = useState<CategoryCourse[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [updatedCourse, setUpdatedCourse] = useState<editCourseItem>({
    categoryCourseId: Number(categoryCourseId),
    name,
    summary,
    locationPath,
    videoLocationPath
  })

  const formats = [
    'align',
    'bold',
    'code-block',
    'color',
    'float',
    'height',
    'image',
    'italic',
    'link',
    'list',
    'placeholder',
    'calltoaction',
    'size',
    'underline',
    'width'
  ]
  const modules = useMemo(
    () => ({
      imageActions: {},
      imageFormats: {},
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true
      },
      toolbar: [
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        // [{ indent: '-1' }, { indent: '+1' }],
        ['link', 'image']
      ],
      imageUploader: {
        upload: async (file: File) => {
          try {
            const resizedImage = await resizeAndCompressImage(file, 1200, 1200)
            const formData = new FormData()
            formData.append('file', resizedImage)
            formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')

            const response = await axios.post(
              `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/upload`,
              formData
            )

            return response.data.secure_url
          } catch (error) {
            console.error('Lỗi upload ảnh:', error)
            throw new Error('Upload ảnh thất bại.')
          }
        }
      },
      blotFormatter: {}
    }),
    []
  )

  useEffect(() => {
    if (courseId != null) {
      setUpdatedCourse({
        categoryCourseId: Number(categoryCourseId),
        name: name ?? '',
        summary: summary ?? '',
        locationPath: locationPath ?? '',
        videoLocationPath: videoLocationPath ?? ''
      })
      void fetchCourseCategories()
    }
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
      setUpdatedCourse(prev => ({ ...prev, [name]: value }))
    }
  }

  const resizeAndCompressImage = async (
    file: File,
    maxW: number = 800,
    maxH: number = 800
  ): Promise<File> => {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result !== 'string') {
          reject(new Error('Không thể đọc nội dung ảnh.'))
          return
        }

        const img = new Image()
        img.src = result

        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img

          // Resize giữ nguyên tỉ lệ
          if (width > maxW || height > maxH) {
            if (width > height) {
              height = Math.floor((height * maxW) / width)
              width = maxW
            } else {
              width = Math.floor((width * maxH) / height)
              height = maxH
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Chuyển canvas thành Blob và tạo File mới từ Blob
          canvas.toBlob(
            (blob) => {
              if (blob != null) {
                const resizedFile = new File([blob], file.name, { type: 'image/webp' })
                resolve(resizedFile)
              } else {
                reject(new Error('Không thể nén ảnh.'))
              }
            },
            'image/webp',
            1 // Chất lượng nén 100%
          )
        }
      }

      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (file != null) {
      try {
        const resizedImage = await resizeAndCompressImage(file, 768, 408)
        setImagePreview(URL.createObjectURL(resizedImage))

        const imageUrl = await uploadImage(resizedImage)
        await editCourse(courseId, { locationPath: imageUrl }).then(() => {
          toast.success('Cập nhật ảnh đại diện khóa học thành công!')
        }).catch(() => {
          toast.error('Cập nhật ảnh đại diện khóa học thất bại. Vui lòng thử lại!')
        })
        await fetchCourse()
        // setUpdatedCourse(prev => ({ ...prev, locationPath: imageUrl }))
        console.log('URL hình ảnh đã upload:', imageUrl)
      } catch (error) {
        console.error('Lỗi khi xử lý hình ảnh hoặc upload:', error)
      }
    }
  }

  const uploadImage = async (image: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', image)
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/image/upload`,
      formData
    )

    return response.data.secure_url
  }

  const handleSave = async (): Promise<void> => {
    try {
      await editCourse(courseId, updatedCourse).then(() => {
        toast.success('Cập nhật thông tin khóa học thành công!')
      }).catch(() => {
        toast.error('Cập nhật thông tin khóa học thất bại. Vui lòng thử lại!')
      })
      console.log('Cập nhật thành công:', updatedCourse)
      await fetchCourse()
      setIsEditing(false)
    } catch (error) {
      console.error('Lỗi khi cập nhật khóa học:', error)
    }
  }

  // useEffect(() => {
  //   console.log('Updated Course:', updatedCourse)
  // }, [updatedCourse])

  console.log('data', summary)
  console.log('data2', updatedCourse.summary)

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="w-full border-b-2">
        <div className="text-3xl font-bold p-2">
          Tổng quan khóa học
        </div>
      </div>
      <div className="w-full shadow-2xl mt-6 bg-gradient-to-r from-gray-50 to-gray-100 md:px-8 md:py-8 p-2 rounded-lg">
          <div className='flex flex-wrap pb-6 border-b-2'>
            <div className='flex flex-col w-full items-center xl:w-1/2'>
              <label className="text-xl font-medium mb-2 flex items-center">
                Hình ảnh khóa học
                {/* {isEditing && ( */}
                <div className='ml-2'>
                  <label className="cursor-pointer">
                    <CloudUpload fontSize="large" className='active:scale-95'/>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                  </label>
                </div>
                {/* )} */}
              </label>
              <div className='flex'>
                <div className='border-4 border-gray-300'>
                  <div className='md:w-96 md:h-52 flex justify-center items-center'>
                    {(locationPath || imagePreview) ? (<img
                    src={imagePreview ?? locationPath}
                    alt="Thumbnail"
                    className="w-full h-full" // object-cover nếu cần
                  />) : (<div className="text-gray-500 italic p-4">Ảnh đại diện là ấn tượng đầu tiên mà học viên có về khóa học của bạn. Một hình ảnh chất lượng, hấp dẫn sẽ thu hút sự chú ý và tăng cơ hội ghi danh.</div>)}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col w-full items-center xl:w-1/2'>
              <VideoOverview
                videoLocationPath={videoLocationPath ?? ''}
                setUpdatedCourse={(course) =>
                  setUpdatedCourse((prev) => ({ ...prev, ...course }))
                }
                courseId={courseId ?? undefined}
                fetchCourse={fetchCourse}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center w-3/4 text-lg font-light my-4 border-r-2 font-sans pr-2">
              Trang tổng quan khóa học của bạn rất quan trọng đối với thành công của bạn. Hãy nghĩ đến việc tạo trang tổng quan khóa học hấp dẫn thể hiện lý do ai đó muốn ghi danh khóa học của bạn.
            </div>
            {isEditing
              ? (
                <div className='flex gap-2 pl-2 flex-wrap'>
                  <div className="cursor-pointer flex justify-center text-white text-lg hover:bg-teal-400 p-1 px-2 mt-2 bg-teal-500 md:w-28 md:h-10 items-center rounded-md active:scale-95"
                    onClick={() => {
                      handleSave().catch(error => {
                        console.error('Error while submitting:', error)
                      })
                    }}
                  >
                    Lưu
                  </div>
                  <div className="cursor-pointer flex justify-center text-white text-lg  mt-2 hover:bg-teal-400 p-1 px-2 bg-teal-500 md:w-28 md:h-10 items-center rounded-md active:scale-95" onClick={() => {
                    setIsEditing(false)
                    setImagePreview(null)
                    setUpdatedCourse({
                      categoryCourseId: Number(categoryCourseId),
                      name: name ?? '',
                      summary: summary ?? '',
                      locationPath: locationPath ?? '',
                      videoLocationPath: videoLocationPath ?? ''
                    })
                  }}>
                    Hủy
                  </div>
                </div>
                )
              : (
                <div onClick={() => setIsEditing(true)} className="cursor-pointer flex justify-center mt-2 text-center text-white text-lg hover:bg-teal-400 bg-teal-500 md:w-32 md:h-10 ml-2 md:ml-0 items-center rounded-md active:scale-95">
                  <p>Chỉnh sửa</p>
                </div>
                )}
          </div>

          <div className="mt-4">
            <label className="block text-xl font-medium mb-2">Tên khóa học</label>
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
            <label className="block text-xl font-medium mb-2">Loại khóa học</label>
            {!isEditing
              ? (
                <div className="w-full mt-1 h-10 p-2 border border-gray-300 bg-white">
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
                  className="w-full mt-1 p-2 border h-10 border-gray-300 bg-white focus:outline-none"
                >
                  <option value='0' disabled hidden>Select a category</option>
                  {courseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                )}
          </div>

          <div className={`mt-4 ${!isEditing ? 'pointer-events-none' : ''}`}>
            <label className="block mb-2 text-xl font-medium">Mô tả chi tiết</label>
            <ReactQuill
              theme='snow'
              // value={isEditing ? updatedCourse?.summary : summary}
              value={updatedCourse?.summary}
              onChange={(value: any) => {
                if (isEditing && updatedCourse?.categoryCourseId !== undefined) {
                  setUpdatedCourse({ ...updatedCourse, summary: value })
                }
              }}
              readOnly={!isEditing}
              formats={formats}
              className="w-full pb-0 bg-white"
              modules={modules} // Chỉ định modules khi đang ở chế độ chỉnh sửa
            />
            {/* <div className="ql-editor" data-gramm="false">
              <div
              dangerouslySetInnerHTML={{ __html: updatedCourse?.summary ?? '' }}
            />
            </div> */}
          </div>
      </div >
    </div >
  )
}

export default CourseOverview
