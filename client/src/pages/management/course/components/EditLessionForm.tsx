/* eslint-disable quote-props */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { IconButton } from '@mui/material'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios'
import { Close, Remove } from '@mui/icons-material'
import QuillResizeImage from 'quill-resize-image'
import { newStudyItemAndLession } from 'api/post/post.interface'
import { createStudyItemAndLession } from 'api/post/post.api'
import ImageUploader from 'quill-image-uploader'

import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import { GridCloseIcon } from '@mui/x-data-grid'
import { Cloudinary } from '@cloudinary/url-gen'
import { StudyItem } from 'api/get/get.interface'
import { editLession } from 'api/put/put.interface'
import { editStudyItemAndLession } from 'api/put/put.api'

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
                `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/video/upload`,
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
          type: 'MP4',
          studyItemId: prevLesson.Lession?.studyItemId ?? 0,
          uploadedBy: userId
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
      void handleUpload(selectedFile)
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

  const isUploadedUrlValid = (url: string | null): boolean => {
    return url !== null && url !== ''
  }

  const handleEditLesson = async (): Promise<void> => {
    try {
      const payload: editLession = {
        name: lesson.name,
        description: lesson.description,
        uploadedBy: userId,
        type: lesson.Lession?.type !== '' ? lesson.Lession?.type : undefined,
        locationPath: lesson.Lession?.locationPath
      }
      const response = await editStudyItemAndLession(studyItem.id, payload)
      await fetchStudyItems()
    } catch (error) {
      console.error('Error create new category:', error)
    }
    setIsEditingLession(false)
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
    ]
  }), [])

  return (
        <div className="flex flex-col flex-1 h-auto p-2 mb-4 relative border-4 gap-2 bg-white">
            <div className="w-full flex justify-between items-center p-2">
                <p className='font-bold text-xl'>Chỉnh sửa bài học</p>
                <IconButton onClick={() => setIsEditingLession(false)}>
                    <Close />
                </IconButton>
            </div>

            <div className='flex flex-1 items-center flex-wrap justify-between md:pr-2'>
                <p className='ml-2'>Tên bài học </p>
                <input
                    type="text"
                    value={lesson?.name ?? ''}
                    onChange={(e) => setLesson({ ...lesson, name: e.target.value })}
                    className='w-10/12 h-8 items-center pt-1 px-2 border-solid border-gray-300 focus:outline-none'
                    style={{ borderWidth: '1px' }}
                />
            </div>

            <div className="flex flex-1 h-auto flex-col justify-between md:pr-2">
                <p className=' mb-2 ml-2 w-20'>Mô tả</p>
                <ReactQuill
                    theme='snow'
                    value={lesson?.description ?? ''}
                    onChange={(value) => setLesson({ ...lesson, description: value })}
                    modules={modules}
                    className='w-full pb-0 md:h-auto'
                />
            </div>

            <p className='mx-2'>Nội dung chính</p>
            <div className="p-2 border-2 rounded">
                {/* Input chọn file video */}
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
            <div className='p-2 cursor-pointer flex justify-center text-white text-lg hover:bg-teal-400 bg-teal-500' onClick={handleEditLesson}>
                Lưu bài học
            </div>
        </div>
  )
}

export default EditLessionForm
