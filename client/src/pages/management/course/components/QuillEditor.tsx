/* eslint-disable @typescript-eslint/explicit-function-return-type */
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

import BlotFormatter from 'quill-blot-formatter'
Quill.register('modules/blotFormatter', BlotFormatter)

// const ImageFormat = Quill.import('formats/image')
// class CustomImageBlot extends ImageFormat {
//   static create (value: any) {
//     const node = super.create(value)
//     return node
//   }

//   static formats (node: any) {
//     console.log('Image attributes:', {
//       src: node.getAttribute('src'),
//       height: node.getAttribute('height'),
//       width: node.getAttribute('width'),
//       style: node.getAttribute('style'),
//       margin: node.getAttribute('margin'),
//       'data-align': node.getAttribute('data-align')
//     })
//     return {
//       src: node.getAttribute('src'),
//       height: node.getAttribute('height'),
//       width: node.getAttribute('width'),
//       style: node.getAttribute('style'),
//       margin: node.getAttribute('margin'),
//       'data-align': node.getAttribute('data-align')
//     }
//   }
// }
// Quill.register(CustomImageBlot, true)

interface QuillEditorProps {
  theme: string
  value: string // Giá trị nội dung của editor
  onChange: (content: string) => void // Hàm callback để cập nhật nội dung
  placeholder?: string
}

const QuillEditor: React.FC<QuillEditorProps> = ({ theme, onChange, value, placeholder }) => {
  const Parchment = Quill.import('parchment')
  const Block = Quill.import('blots/block')
  Block.tagName = 'H3'
  Quill.register(Block, true)

  console.log(value)

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
    blotFormatter: {}
  }), [])

  return (
    <div>
      <ReactQuill
        theme={theme}
        modules={modules}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
    blotFormatter: {}
  }), [])

  return (
      <div>
        <ReactQuill
          theme={theme}
          modules={modules}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      </div>
  )
}

export { QuillEditor, QuillEditorQuestion }

// [
//   ['bold', 'italic', 'underline', 'strike'],
//   ['blockquote', 'code-block'],
//   ['link', 'image', 'formula'],
//   [{ header: 1 }, { header: 2 }],
//   [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
//   [{ script: 'sub' }, { script: 'super' }],
//   [{ indent: '-1' }, { indent: '+1' }],
//   [{ direction: 'rtl' }],
//   [{ size: ['small', false, 'large', 'huge'] }],
//   [{ header: [1, 2, 3, 4, 5, 6, false] }],
//   [{ color: [] }, { background: [] }],
//   [{ font: [] }],
//   [{ align: [] }],
//   ['clean']
// ]
