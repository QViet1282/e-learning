/* eslint-disable react/no-unknown-property */
import React, { useState, ChangeEvent } from 'react'
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios'
import { Cloudinary } from '@cloudinary/url-gen'
// import { scale } from '@cloudinary/url-gen/actions/resize'
// import { quality, format } from '@cloudinary/url-gen/actions/delivery'
import { Close } from '@mui/icons-material' // Sử dụng icon từ Material UI
import { newStudyItemAndLession } from 'api/post/post.interface'

interface ChildComponentProps {
  setNewLesson: React.Dispatch<React.SetStateAction<newStudyItemAndLession>>
  newLesson: newStudyItemAndLession
}

const UploadAndDisplayVideo: React.FC<ChildComponentProps> = ({ setNewLesson, newLesson }) => {
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const publicId: string = response.data.public_id
      // setUploadedUrl(response.data.secure_url)
      setUploadedUrl(response.data.secure_url)
      setNewLesson({ ...newLesson, locationPath: response.data.playback_url })
      setNewLesson({ ...newLesson, type: 'MP4' })
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Upload canceled:', error.message)
      } else {
        console.error('Error uploading file:', error)
      }
    }
  }

  // Hàm lấy URL video tối ưu
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getOptimizedVideoUrl = (uploadedUrl: string | null | undefined): string => {
    if (uploadedUrl == null || typeof uploadedUrl !== 'string' || uploadedUrl.trim() === '') return ''

    const cld = new Cloudinary({
      cloud: { cloudName: 'dbtgez7ua' }
    })

    const video = cld.video(uploadedUrl)
    // video
    //   .resize(scale().width(1000))

    return video.toURL()
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

  return (
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
  )
}

export default UploadAndDisplayVideo
