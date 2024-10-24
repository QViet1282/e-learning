/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/no-unused-vars */
// QuillEditor.tsx
import React, { useMemo } from 'react'
import axios from 'axios'
import 'react-quill/dist/quill.snow.css'
import ReactQuill, { Quill } from 'react-quill'
import QuillResizeImage from 'quill-resize-image'
import ImageUploader from 'quill-image-uploader'
import 'quill-image-uploader/dist/quill.imageUploader.min.css'

interface QuillEditorProps {
  theme: string
  value: string // Giá trị nội dung của editor
  onChange: (content: string) => void // Hàm callback để cập nhật nội dung
  placeholder?: string
}

const QuillEditor: React.FC<QuillEditorProps> = ({ theme, onChange, value }) => {
  const Parchment = Quill.import('parchment')
  const Block = Quill.import('blots/block')
  Block.tagName = 'H3'
  Quill.register(Block, true)

  const modules = useMemo(() => ({
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      [{ indent: '-1' }, { indent: '+1' }],
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
    <div>
      <ReactQuill
        theme={theme}
        modules={modules}
        value={value}
        onChange={onChange} // Để cập nhật giá trị khi người dùng chỉnh sửa
      />
    </div>
  )
}

const QuillEditorQuestion: React.FC<QuillEditorProps> = ({ theme, onChange, value, placeholder }) => {
  const Parchment = Quill.import('parchment')
  const Block = Quill.import('blots/block')
  Block.tagName = 'H3'
  Quill.register(Block, true)

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block', 'image'],
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      [{ color: [] }, { background: [] }]
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
      <div>
        <ReactQuill
          theme={theme}
          modules={modules}
          value={value}
          placeholder={placeholder}
          onChange={onChange} // Để cập nhật giá trị khi người dùng chỉnh sửa
        />
      </div>
  )
}

export { QuillEditor, QuillEditorQuestion }
