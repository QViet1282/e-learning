import React, { useMemo, useState } from 'react'
import { StudyItem } from 'api/get/get.interface'
import 'react-quill/dist/quill.bubble.css'
import { StyledQuill } from './ReactQuillConfig'
import { Document, Page } from 'react-pdf'

interface DetailProps {
  studyItem: StudyItem
  load: boolean // Thay đổi biến load để xác định khi nào hiển thị PDF
}

const LessionDetail: React.FC<DetailProps> = ({ studyItem, load }): JSX.Element => {
  const [numPages, setNumPages] = useState<number | null>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages)
  }

  const renderLessonContent = (type: string, locationPath: string): JSX.Element => {
    switch (type) {
      case 'MP4':
        return <video src={locationPath} controls className='w-full' />
      case 'PDF':
        return (
          <div className="overflow-y-auto w-full h-96">
            <Document
              file={locationPath}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              {(numPages != null) && Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={1.5} />
              ))}
            </Document>
          </div>
        )
      default:
        return <span>Không có file đính kèm</span>
    }
  }

  const lessonContent = useMemo(() => {
    return load
      ? (
          studyItem.Lession != null
            ? renderLessonContent(studyItem.Lession.type, studyItem.Lession.locationPath)
            : <span>Không có nội dung bài học.</span>
        )
      : null
  }, [studyItem.Lession, load, numPages])

  const descriptionContent = useMemo(() => {
    return studyItem.description ?? ''
  }, [studyItem.description])

  return (
    <div className="border-t-2 border-gray-200">
      <div className="mt-2 mb-2 flex justify-start items-center w-full">
        {lessonContent}
      </div>

      <p className="text-xl"> Mô tả </p>

      <div className="text-base w-full h-auto">
        <StyledQuill
          theme="bubble"
          value={descriptionContent}
          readOnly
          className="w-full md:h-auto bg-white"
        />
      </div>
    </div>
  )
}

export default LessionDetail
