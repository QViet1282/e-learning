import React, { useState, ChangeEvent } from 'react'
import axios, { AxiosProgressEvent } from 'axios'
// import { Cloudinary } from '@cloudinary/url-gen'
// import { scale } from '@cloudinary/url-gen/actions/resize'
// import { quality, format } from '@cloudinary/url-gen/actions/delivery'

// Khai báo kiểu cho các state và hàm
const UploadAndDisplayVideo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null) // Kiểu File hoặc null
  const [uploadedUrl, setUploadedUrl] = useState<string>('') // Kiểu string
  const [upUrl, setUpUrl] = useState<string>('')
  const [progress, setProgress] = useState<number>(0) // Kiểu number

  // Hàm xử lý upload
  const handleUpload = async (): Promise<void> => {
    if (file == null) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'elearning') // Thay bằng upload preset của bạn

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dbtgez7ua/video/upload', // Thay YOUR_CLOUD_NAME bằng cloud name của bạn
        formData,
        {
          onUploadProgress: (event: AxiosProgressEvent) => {
            setProgress(Math.round((event.loaded * 100) / (event.total ?? 1))) // Bổ sung kiểm tra event.total
          }
        }
      )

      const publicId: string = response.data.public_id
      setUploadedUrl(publicId) // Lưu public ID của video
      setUpUrl(response.data.url)
    } catch (error) {
      console.error('Error uploading file: ', error)
    }
  }

  // Hàm lấy URL video tối ưu
  const getOptimizedVideoUrl = (): string => {
    if (uploadedUrl == null || typeof uploadedUrl !== 'string' || uploadedUrl.trim() === '') {
      return '' // Kiểm tra rõ ràng giá trị rỗng
    }

    // const cld = new Cloudinary({
    //   cloud: {
    //     cloudName: 'dbtgez7ua' // Thay YOUR_CLOUD_NAME bằng cloud name của bạn
    //   }
    // })

    // const video = cld.video(uploadedUrl)
    // video
    //   .resize(scale().width(1000)) // Tùy chỉnh kích thước
    //   .delivery(quality('auto')) // Tối ưu chất lượng
    //   .delivery(format('auto')) // Định dạng tự động

    // return video.toURL() // Trả về URL của video đã tối ưu
    const httpsUrl = upUrl.replace('http://', 'https://')
    return httpsUrl
  }

  const handleButtonClick = (): void => {
    void handleUpload() // Bỏ qua giá trị trả về của Promise
  }
  const isUploadedUrlValid = (url: string | null): boolean => {
    return url !== null && url !== ''
  }
  return (
    <div>
      <h1>Upload và Hiển thị Video</h1>

      {/* Input chọn file video */}
      <input
        type="file"
        accept="video/*"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (e.target.files != null) setFile(e.target.files[0])
        }}
      />

      {/* Nút upload */}
      <button onClick={handleButtonClick}>Upload Video</button>

      {/* Hiển thị tiến độ upload */}
      {progress > 0 && <p>Upload Progress: {progress}%</p>}

      {/* Hiển thị video sau khi upload */}
      {isUploadedUrlValid(uploadedUrl) && (
        <video controls controlsList='nodownloadButton' width="1000" preload="auto" src={getOptimizedVideoUrl()}>
          {/* <source src={getOptimizedVideoUrl()} type="video/mp4" />
          Your browser does not support the video tag. */}
        </video>
        // <iframe
        //   width="1000"
        //   height="500"
        //   src={getOptimizedVideoUrl()}
        //   title="Video"
        //   frameBorder="0"
        //   allowFullScreen
        //   contextMenu="return false"
        // ></iframe>
      )}
    </div>
  )
}

export default UploadAndDisplayVideo

// import React, { useState, ChangeEvent, useEffect, useRef } from 'react'
// import axios, { AxiosProgressEvent } from 'axios'
// import './UploadAndDisplayVideo.css'
// const UploadAndDisplayVideo: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null) // Kiểu File hoặc null
//   const [uploadedUrl, setUploadedUrl] = useState<string>('') // Kiểu string
//   const [upUrl, setUpUrl] = useState<string>('') // URL đã upload
//   const [progress, setProgress] = useState<number>(0) // Kiểu number
//   const videoRef = useRef<HTMLVideoElement>(null)
//   // Hàm xử lý upload
//   const handleUpload = async (): Promise<void> => {
//     if (file == null) return

//     const formData = new FormData()
//     formData.append('file', file)
//     formData.append('upload_preset', 'elearning') // Thay bằng upload preset của bạn

//     try {
//       const response = await axios.post(
//         'https://api.cloudinary.com/v1_1/dbtgez7ua/video/upload', // Thay YOUR_CLOUD_NAME bằng cloud name của bạn
//         formData,
//         {
//           onUploadProgress: (event: AxiosProgressEvent) => {
//             setProgress(Math.round((event.loaded * 100) / (event.total ?? 1))) // Bổ sung kiểm tra event.total
//           }
//         }
//       )

//       const publicId: string = response.data.public_id
//       setUploadedUrl(publicId) // Lưu public ID của video
//       setUpUrl(response.data.secure_url) // Lưu URL đã upload
//     } catch (error) {
//       console.error('Error uploading file: ', error)
//     }
//   }

//   // Hàm lấy URL video tối ưu
//   const getOptimizedVideoUrl = (): string => {
//     if (uploadedUrl == null || typeof uploadedUrl !== 'string' || uploadedUrl.trim() === '') {
//       return '' // Kiểm tra rõ ràng giá trị rỗng
//     }

//     return upUrl.replace('http://', 'https://') // Đảm bảo URL sử dụng HTTPS
//   }

//   const handleButtonClick = (): void => {
//     void handleUpload() // Bỏ qua giá trị trả về của Promise
//   }

//   const isUploadedUrlValid = (url: string | null): boolean => {
//     return url !== null && url !== ''
//   }

//   useEffect(() => {
//     if (videoRef.current != null) {
//       const controls = videoRef.current.querySelector('video')
//       if (controls != null) {
//         controls.addEventListener('loadedmetadata', () => {
//           const downloadButton = controls.querySelector('button[title="Download"]')
//           if (downloadButton != null) {
//             downloadButton.type.display = 'none' // Ẩn nút tải xuống
//           }
//         })
//       }
//     }
//   }, [uploadedUrl])

//   return (
//     <div>
//       <h1>Upload và Hiển thị Video</h1>

//       {/* Input chọn file video */}
//       <input
//         type="file"
//         accept="video/*"
//         onChange={(e: ChangeEvent<HTMLInputElement>) => {
//           if (e.target.files != null) setFile(e.target.files[0])
//         }}
//       />

//       {/* Nút upload */}
//       <button onClick={handleButtonClick}>Upload Video</button>

//       {/* Hiển thị tiến độ upload */}
//       {progress > 0 && <p>Upload Progress: {progress}%</p>}

//       {/* Hiển thị video sau khi upload */}
//       {isUploadedUrlValid(uploadedUrl) && (
//         <video ref={videoRef} controls width="1000" onContextMenu={(e) => e.preventDefault()}>
//         <source src={getOptimizedVideoUrl()} type="video/mp4" />
//         Your browser does not support the video tag.
//       </video>
//       )}
//     </div>
//   )
// }

// export default UploadAndDisplayVideo
