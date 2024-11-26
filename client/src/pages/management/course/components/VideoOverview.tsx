/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import { CloudUpload } from '@mui/icons-material'
import axios from 'axios'
import { editCourse } from 'api/put/put.api'
import { toast } from 'react-toastify'

interface VideoOverviewProps {
  videoLocationPath: string
  setUpdatedCourse: (course: Partial<Course>) => void
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  courseId: number | undefined
  fetchCourse: () => Promise<void>
}

interface Course {
  categoryCourseId?: number
  name?: string
  summary?: string
  locationPath?: string
  videoLocationPath?: string
}

const VideoOverview: React.FC<VideoOverviewProps> = ({
  videoLocationPath,
  setUpdatedCourse,
  courseId,
  fetchCourse
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file != null) {
      setVideoFile(file)
    }
  }

  const handleCancelUpload = () => {
    setVideoFile(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  const uploadVideo = async () => {
    if (videoFile == null) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', videoFile)
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ?? '')

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? ''}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
            setUploadProgress(percentCompleted)
          }
        }
      )

      // Cập nhật videoLocationPath trong state của khóa học
      //   setUpdatedCourse({ videoLocationPath: response.data.secure_url })
      await editCourse(courseId, { videoLocationPath: response.data.secure_url }).then(() => {
        toast.success('Cập nhật video đại diện khóa học thành công!')
      }).catch(() => {
        toast.error('Cập nhật video đại diện khóa học thất bại. Vui lòng thử lại!')
      })
      await fetchCourse()
      setIsUploading(false)
    } catch (error) {
      console.error('Lỗi upload video:', error)
      handleCancelUpload()
    }
  }

  useEffect(() => {
    if (videoFile != null) void uploadVideo()
  }, [videoFile])

  return (
    <div>
  <label className="flex items-center text-xl font-medium justify-center">
    Video giới thiệu / học thử
    <div className="ml-2">
      <label className="cursor-pointer">
        {/* {isEditing && ( */}
            <CloudUpload fontSize="large" className='active:scale-95'/>
        {/* )} */}
        <input type="file" accept="video/*" onChange={handleVideoChange} hidden />
      </label>
    </div>
  </label>

  <div className="border-4 border-gray-300 mt-2">
    <div className="md:w-96 md:h-52 flex justify-center items-center"> {/* Đặt chiều cao cố định */}
      {isUploading ? (
        <div className="flex flex-col justify-center items-center w-full h-full">
          <p className="text-gray-700 mb-2">Đang tải lên: {uploadProgress}%</p>
          <button
            onClick={handleCancelUpload}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400 active:scale-95"
          >
            Hủy
          </button>
        </div>
      ) : (videoLocationPath !== '') ? (
        <video
          src={videoLocationPath}
          controls
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-gray-500 italic p-4">Học viên quan tâm đến khóa học của bạn có nhiều khả năng ghi danh hơn nếu video giới thiệu của bạn được thực hiện tốt.</div> // Nội dung thay thế
      )}
    </div>
  </div>
</div>

  )
}

export default VideoOverview
