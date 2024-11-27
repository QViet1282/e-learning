/* eslint-disable quote-props */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ChangeEvent, useEffect, useState } from 'react'
import { IconButton } from '@mui/material'
import 'react-quill/dist/quill.snow.css'
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios'
import { Close, Remove } from '@mui/icons-material'

import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import { Cloudinary } from '@cloudinary/url-gen'
import { StudyItem } from 'api/get/get.interface'
import { editLession } from 'api/put/put.interface'
import { editStudyItemAndLession } from 'api/put/put.api'
import { Document, Page } from 'react-pdf'
import { QuillEditor } from './QuillEditor'
import { toast } from 'react-toastify'

interface EditExamFormProps {
  userId: number
  setIsEditingLession: (value: boolean) => void
  lessionCategoryId: number
  fetchStudyItems: () => Promise<void>
  studyItem: StudyItem
}

const EditLessionForm: React.FC<EditExamFormProps> = ({
  setIsEditingLession,
  userId,
  lessionCategoryId,
  fetchStudyItems,
  studyItem
}): JSX.Element => {
  const [lesson, setLesson] = useState<StudyItem>(studyItem)
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string>(studyItem?.Lession?.locationPath ?? '')
  const [progress, setProgress] = useState<number>(0)
  const [cancelToken, setCancelToken] = useState<CancelTokenSource | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)

  useEffect(() => {
    if (studyItem.Lession != null) {
      setLesson(studyItem)
      setUploadedUrl(studyItem.Lession?.locationPath ?? '')
    }
  }, [studyItem])

  const handleUpload = async (file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')

    const source = axios.CancelToken.source()
    setCancelToken(source)

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/upload`,
        formData,
        {
          cancelToken: source.token,
          onUploadProgress: (event: AxiosProgressEvent) => {
            setProgress(Math.round((event.loaded * 100) / (event.total ?? 1)))
          }
        }
      )

      setUploadedUrl(response.data.secure_url)
      setLesson((prevLesson) => ({
        ...prevLesson,
        Lession: {
          ...prevLesson.Lession,
          locationPath: response.data.secure_url,
          type: file.type.includes('video') ? 'MP4' : 'PDF', // Phân loại theo loại tệp
          studyItemId: prevLesson.Lession?.studyItemId ?? 0,
          uploadedBy: userId,
          durationInSecond: response.data.duration
        }
      }))
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Upload canceled:', error.message)
      } else {
        console.error('Error uploading file:', error)
      }
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files != null) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      void handleUpload(selectedFile) // Bắt đầu upload ngay khi chọn file
    }
  }

  const handleCancelUpload = (): void => {
    if (cancelToken != null) {
      cancelToken.cancel('Upload canceled by user.')
      setCancelToken(null)
      setProgress(0)
      setFile(null)
    }
  }

  const isUploadedUrlValid = (url: string) => {
    return url.length > 0
  }

  const handleUpdateLesson = async (): Promise<void> => {
    if (lesson.name.trim() === '') {
      toast.error('Vui lòng nhập tên bài học hợp lệ!')
      return
    }

    const payload: editLession = {
      name: lesson.name,
      description: lesson.description,
      uploadedBy: userId,
      type: lesson.Lession?.type !== '' ? lesson.Lession?.type : undefined,
      locationPath: lesson.Lession?.locationPath,
      durationInSecond: lesson.Lession?.durationInSecond ?? null
    }
    await editStudyItemAndLession(studyItem.id, payload).then(async () => {
      toast.success('Lưu thành công')
      await fetchStudyItems()
      setIsEditingLession(false)
    }).catch(() => {
      toast.error('Lỗi trong quá trình tạo. Xin hãy thử lại!')
    })
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages)
  }

  return (
    <div className="flex flex-col flex-1 h-auto p-2 mb-4 md:ml-20 relative border-4 gap-2 bg-white">
      <div className="w-full flex justify-between items-center p-2">
        <p className='font-bold text-xl'>Chỉnh sửa bài học</p>
        <IconButton onClick={() => {
          setIsEditingLession(false)
          setLesson(studyItem) // Đặt lại lesson về giá trị ban đầu
        }}>
          <Close />
        </IconButton>
      </div>

      <div className='flex flex-1 items-center flex-wrap justify-between md:pr-2'>
        <p className='ml-2'>Tên bài học </p>
        <input
          type="text"
          value={lesson.name}
          onChange={(e) => setLesson({ ...lesson, name: e.target.value })}
          className='w-10/12 h-8 items-center px-2 border-solid border-gray-300 focus:outline-none'
          style={{ borderWidth: '1px' }}
        />
      </div>

      <div className="flex flex-1 h-auto flex-col justify-between md:pr-2">
        <p className=' mb-2 ml-2 w-20'>Mô tả</p>
        <QuillEditor
          theme='snow'
          value={lesson.description}
          onChange={(value) => setLesson({ ...lesson, description: value })}
        // modules={modules}
        // className='w-full pb-0 md:h-auto'
        />
      </div>

      <p className='mx-2'>Nội dung chính</p>
      <div className="p-2 border-2 rounded">
        {!isUploadedUrlValid(uploadedUrl) && (
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
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )}

        {(uploadedUrl.length > 0) && (
          <div className='flex flex-1 flex-wrap gap-2'>
            {lesson.Lession?.type === 'MP4'
              ? (<video src={uploadedUrl} controls className='w-full aspect-[16/9] bg-black' />)
              : (lesson.Lession?.type === 'PDF' && (
                <div className="overflow-y-auto w-full h-96 border-2">
                  <Document
                    file={uploadedUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                  >
                    {(numPages != null) && Array.from(new Array(numPages), (el, index) => (
                      <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={1.5} />
                    ))}
                  </Document>
                </div>
                ))}
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
                Thay đổi PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )}

        {file != null && progress < 100 && (
          <div className='text-center'>
            <p className="text-gray-700">Đang tải lên: {progress}%</p>
            <button
              onClick={handleCancelUpload}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400"
            >
              Hủy
            </button>
          </div>
        )}
      </div>
      <div className='w-full space-x-2 justify-end flex'>
        <div className='p-2 cursor-pointer flex justify-center text-white text-lg hover:bg-teal-400 bg-teal-500 rounded-md active:scale-95' onClick={handleUpdateLesson}>
          Lưu bài học
        </div>
      </div>

    </div>
  )
}

export default EditLessionForm
