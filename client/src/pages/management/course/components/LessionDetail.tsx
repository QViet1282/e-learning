/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useMemo, useState, useRef, WheelEventHandler } from 'react'
import { StudyItem } from 'api/get/get.interface'
import 'react-quill/dist/quill.bubble.css'
import { StyledQuill } from './ReactQuillConfig'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'

interface DetailProps {
  studyItem: StudyItem
  load: boolean // Thay đổi biến load để xác định khi nào hiển thị PDF
}

const LessionDetail: React.FC<DetailProps> = ({ studyItem, load }): JSX.Element => {
  const [numPages, setNumPages] = useState<number>(1)
  const { t } = useTranslation()
  const [scale, setScale] = useState<number>(1.5)
  const documentContainerRef = useRef<HTMLDivElement>(null)
  const isSmallScreen = useMediaQuery({ maxWidth: 767 })

  // Hàm xử lý sự kiện 'dblclick' để phóng to
  const handleDoubleClick = () => {
    setScale(prevScale => Math.min(prevScale + 0.5, 2)) // Tăng scale lên mỗi lần double-click
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages)
  }

  const handleWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey) { // Kiểm tra nếu người dùng đang giữ phím Ctrl
      const newScale = scale + (event.deltaY < 0 ? 0.1 : -0.1)
      setScale(prevScale => Math.max(0.5, Math.min(2, newScale)))
    } else {
      window.scrollBy(0, event.deltaY)
    }
  }

  const renderLessonContent = (type: string, locationPath: string): JSX.Element => {
    switch (type) {
      case 'MP4':
        return <video src={locationPath} controls className='w-full' />
      case 'PDF':
        return (
          <div
            className="overflow-y-auto w-full h-96 pdf-container"
            onWheel={handleWheel}
            ref={documentContainerRef}
            onDoubleClick={handleDoubleClick} // Xử lý sự kiện double-click
          >
            <Document
              file={(locationPath ?? '')}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={console.error}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <React.Fragment key={`page_${index + 1}`}>
                  <Page
                    pageNumber={index + 1}
                    scale={isSmallScreen ? 0.7 : 1.5}
                    className="pdf-page"
                    renderMode="canvas"
                  />
                  {index < numPages - 1 && <div className="border-t border-gray-200 my-2" />}
                </React.Fragment>
              ))}
            </Document>
          </div>
        )
      default:
        return <span>{t('curriculum.noAttachment')}</span>
    }
  }

  const lessonContent = useMemo(() => {
    return load
      ? (
          studyItem.Lession != null
            ? renderLessonContent(studyItem.Lession.type, studyItem.Lession.locationPath)
            : <span>{t('curriculum.noContent')}</span>
        )
      : null
  }, [studyItem.Lession, load, numPages, scale])

  const descriptionContent = useMemo(() => {
    return studyItem.description ?? ''
  }, [studyItem.description])

  return (
    <div className="border-t-2 border-gray-200">
      <div className="mt-2 mb-2 flex justify-start items-center w-full">
        {lessonContent}
      </div>

      <p className="text-xl">{t('curriculum.description')}</p>

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
