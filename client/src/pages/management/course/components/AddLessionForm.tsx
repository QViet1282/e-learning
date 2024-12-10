/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { ChangeEvent, useState } from 'react'
import { IconButton } from '@mui/material'
// import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios'
import { Close, Save } from '@mui/icons-material'
import { newStudyItemAndLession } from 'api/post/post.interface'
import { createStudyItemAndLession } from 'api/post/post.api'
import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import { Document, Page } from 'react-pdf'
import { QuillEditor } from './QuillEditor'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

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
    locationPath: null,
    durationInSecond: 0
  })
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [cancelToken, setCancelToken] = useState<CancelTokenSource | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)

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
      setNewLesson((prevLesson) => ({
        ...prevLesson,
        locationPath: response.data.secure_url,
        type: file.type.includes('video') ? 'MP4' : 'PDF',
        durationInSecond: Math.round(response.data.duration)
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

  const handleAddLesson = async (): Promise<void> => {
    if (newLesson.name.trim() === '') {
      toast.error(t('curriculum.errorCreateLesson'))
      return
    }

    try {
      await createStudyItemAndLession(newLesson).then(async () => {
        toast.success(t('curriculum.successCreateLesson'))
        await fetchStudyItems()
        // Reset thông tin bài học mới
        setNewLesson({
          lessionCategoryId,
          name: '',
          description: '',
          itemType: 'lession',
          uploadedBy: userId,
          type: null,
          locationPath: null,
          durationInSecond: 0
        })
        setIsAddingLession(false)
      }).catch(() => {
        toast.error(t('curriculum.errorCreateLessonRetry'))
      })
    } catch (error) {
      console.error('Error create new category:', error)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages)
  }

  return (
    <div className="flex flex-col flex-1 h-auto p-2 mb-4 md:ml-20 relative border-4 gap-2 bg-white">
      <div className="w-full flex justify-between items-center p-2">
        <p className='font-bold text-xl'>{t('curriculum.addLesson')}</p>
        <IconButton onClick={() => {
          setIsAddingLession(false)
          setNewLesson({
            lessionCategoryId,
            name: '',
            description: '',
            itemType: 'lession',
            uploadedBy: userId,
            type: null,
            locationPath: null,
            durationInSecond: 0
          })
        }}>
          <Close />
        </IconButton>
      </div>

      <div className='flex flex-1 items-center flex-wrap justify-between md:pr-2'>
        <p className='ml-2'>{t('curriculum.lessonName')} </p>
        <input
          type="text"
          value={newLesson.name}
          onChange={(e) => setNewLesson({ ...newLesson, name: e.target.value })}
          className='w-10/12 h-8 items-center px-2 border-solid border-gray-300 focus:outline-none'
          style={{ borderWidth: '1px' }}
        />
      </div>

      <div className="flex flex-1 h-auto flex-col justify-between md:pr-2">
        <p className=' mb-2 ml-2 w-20'>{t('curriculum.lessonDescription')}</p>
        <QuillEditor
          theme='snow'
          value={newLesson.description}
          onChange={(value) => setNewLesson({ ...newLesson, description: value })}
        // modules={modules}
        // className='w-full pb-0 md:h-auto'
        />
      </div>

      <p className='mx-2'>{t('curriculum.mainContent')}</p>
      <div className="p-2 border-2 rounded">
        {(file == null) && (
          <div className='flex flex-wrap gap-2'>
            <div className='w-28 border-2 bg-teal-500 rounded-md p-2 items-center text-center hover:bg-teal-400'>
              <label className="cursor-pointer text-white">
              {t('curriculum.addVideo')}
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
              {t('curriculum.addPdf')}
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
            {newLesson.type === 'MP4'
              ? (<video src={uploadedUrl} controls className='w-full aspect-[16/9] bg-black' />)
              : (newLesson.type === 'PDF' && (
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
              {t('curriculum.changeVideo')}
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
              {t('curriculum.changePdf')}
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
            <p className="text-gray-700">{t('curriculum.uploadPregress')} {progress}%</p>
            <button
              onClick={handleCancelUpload}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400"
            >
              {t('curriculum.button.cancel')}
            </button>
          </div>
        )}
      </div>
      <div className='w-full space-x-2 justify-end flex'>
        <div className='p-2 cursor-pointer flex justify-center items-center gap-1 text-white text-lg hover:bg-teal-400 bg-teal-500 rounded-md active:scale-95' onClick={handleAddLesson}>
        {t('curriculum.button.save')}
        <Save fontSize='small'/>
        </div>
      </div>
    </div>
  )
}

export default AddLessionForm
