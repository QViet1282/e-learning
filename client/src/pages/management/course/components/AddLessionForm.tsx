/* eslint-disable quote-props */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ChangeEvent, useMemo, useState } from 'react'
import { IconButton } from '@mui/material'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios'
import { Close, Remove } from '@mui/icons-material'
import QuillResizeImage from 'quill-resize-image'
import { newStudyItemAndLession } from 'api/post/post.interface'
import { createStudyItemAndLession } from 'api/post/post.api'
import ImageUploader from 'quill-image-uploader'

import 'quill-image-uploader/dist/quill.imageUploader.min.css'

interface AddExamFormProps {
  userId: number
  setIsAddingLession: (value: boolean) => void
  lessionCategoryId: number
  fetchStudyItems: () => Promise<void>
}

const AddLessionForm: React.FC<AddExamFormProps> = ({ setIsAddingLession, userId, lessionCategoryId, fetchStudyItems }): JSX.Element => {
  const [newLesson, setNewLesson] = useState<newStudyItemAndLession>({
    lessionCategoryId,
    name: '',
    description: '',
    itemType: 'lession',
    uploadedBy: userId,
    type: null,
    locationPath: null
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [progress, setProgress] = useState<number>(0)
  const [cancelToken, setCancelToken] = useState<CancelTokenSource | null>(null)

  const handleUpload = async (file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')

    const source = axios.CancelToken.source()
    setCancelToken(source)

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/video/upload`,
        formData,
        {
          cancelToken: source.token,
          onUploadProgress: (event: AxiosProgressEvent) => {
            setProgress(Math.round((event.loaded * 100) / (event.total ?? 1)))
          }
        }
      )

      // Hợp nhất cả hai lần cập nhật vào một lệnh duy nhất
      setUploadedUrl(response.data.secure_url)
      setNewLesson((prevLesson) => ({
        ...prevLesson,
        locationPath: response.data.secure_url,
        type: 'MP4'
      }))
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Upload canceled:', error.message)
      } else {
        console.error('Error uploading file:', error)
      }
    }
  }

  // Hàm xử lý khi chọn file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files != null) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      void handleUpload(selectedFile) // Bắt đầu upload ngay khi chọn file
    }
  }

  // Hàm hủy upload
  const handleCancelUpload = (): void => {
    if (cancelToken != null) {
      cancelToken.cancel('Upload canceled by user.')
      setCancelToken(null)
      setProgress(0)
      setFile(null)
    }
  }

  const isUploadedUrlValid = (url: string | null): boolean => {
    return url !== null && url !== ''
  }

  const handleAddLesson = async (): Promise<void> => {
    try {
      const response = await createStudyItemAndLession(newLesson)
      await fetchStudyItems()
      console.log('Ket qua them newCategory', response.status)
    } catch (error) {
      console.error('Error create new category:', error)
    }
    console.log('New lesson:', newLesson)
    setNewLesson({
      lessionCategoryId,
      name: '',
      description: '',
      itemType: 'lession',
      uploadedBy: userId,
      type: null,
      locationPath: null
    })
    setIsAddingLession(false)
  }

  const modules = useMemo(() => ({
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

  return (
    <div className="flex flex-col flex-1 h-auto p-2 mb-4 md:ml-20 relative border-4 gap-2 bg-white">
      <div className="w-full flex justify-between items-center p-2">
        <p className='font-bold text-xl'>Thêm bài học</p>
        <IconButton onClick={() => {
          setIsAddingLession(false)
          setNewLesson({
            lessionCategoryId,
            name: '',
            description: '',
            itemType: 'lession',
            uploadedBy: userId,
            type: null,
            locationPath: null
          })
        }}>
          <Close />
        </IconButton>
      </div>
      <div className='flex flex-1 items-center flex-wrap justify-between md:pr-2'>
        <p className='ml-2'>Tên bài học </p>
        <input
          type="text"
          value={newLesson.name}
          onChange={(e) => setNewLesson({ ...newLesson, name: e.target.value })}
          className='w-10/12 h-8 items-center px-2 border-solid border-gray-300 focus:outline-none'
          style={{ borderWidth: '1px' }}
        />
      </div>
      <div className="flex flex-1 h-auto flex-col justify-between md:pr-2">
        <p className=' mb-2 ml-2 w-20'>Mô tả</p>
        <ReactQuill
          theme='snow'
          value={newLesson.description}
          onChange={(value) => setNewLesson({ ...newLesson, description: value })}
          modules={modules}
          style={{}}
          className='w-full pb-0 md:h-auto'
        />
      </div>
      <p className='mx-2'>Nội dung chính</p>
      <div className="p-2 border-2 rounded">
        {/* Input chọn file video */}
        {(file == null) && (
          <div className='flex flex-wrap gap-2'>
            <div className='w-28 border-2 bg-teal-500 rounded-md p-2 items-center text-center hover:bg-teal-400'>
              <label className="cursor-pointer text-white">
                Thêm video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div className='w-28 border-2 bg-teal-500 rounded-md p-2 items-center text-center hover:bg-teal-400'>
              <label className="cursor-pointer text-white">
                Thêm PDF
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )}

        {/* Hiển thị video sau khi upload */}
        {isUploadedUrlValid(uploadedUrl) && (
          <div className='flex flex-1 flex-wrap gap-2'>
            <video src={uploadedUrl} controls className='w-full aspect-[16/9] bg-black' />
            <div className='border-2 bg-teal-500 rounded-md text-center p-2 hover:bg-teal-400'>
              <label className="cursor-pointer text-white">
                Thay đổi video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div className='border-2 bg-teal-500 rounded-md text-center p-2 hover:bg-teal-400'>
              <label className="cursor-pointer text-white">
                Chuyển sang PDF
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )
        }

        {/* Hiển thị tên file và tiến độ upload */}
        {(file != null && progress < 100) && (
          <div className="flex flex-wrap items-center justify-between">
            <p className="text-lg font-semibold">{file.name}</p>
            <div className="flex items-center gap-2">
              {progress > 0 && <p>Upload Progress: {progress}%</p>}
              <Close
                className="cursor-pointer text-red-500"
                onClick={handleCancelUpload}
              />
            </div>
          </div>
        )}
      </div >
      <div className='p-2 cursor-pointer flex justify-center text-white text-lg hover:bg-teal-400 bg-teal-500' onClick={handleAddLesson}>
        Lưu bài học
      </div>
    </div>
  )
}

export default AddLessionForm
