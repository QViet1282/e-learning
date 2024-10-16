import React from 'react'
import { StudyItem } from 'api/get/get.interface'

interface DetailProps {
  studyItem: StudyItem
  load: boolean
}

const LessionDetail: React.FC<DetailProps> = ({ studyItem }): JSX.Element => {
  const renderLessonContent = (type: string, locationPath: string): JSX.Element => {
    switch (type) {
      case 'MP4':
        return <video src={locationPath} controls className='w-full' />
      case 'PDF':
      default:
        return <span>Không có file đính kèm</span>
    }
  }
  return (
      <div className="border-t-2 border-gray-200">
        <div className="mt-2 mb-2 flex justify-start items-center">
          {/* Render nội dung bài học */}
          {studyItem.Lession != null ? renderLessonContent(studyItem.Lession.type, studyItem.Lession.locationPath) : <span>Không có nội dung bài học.</span>}
        </div>

        <p className="text-xl"> Mô tả </p>

        <div className="text-base mb-4 w-full h-auto">
          <div className='w-full' dangerouslySetInnerHTML={{ __html: studyItem.description }} />
        </div>
      </div>

  )
}

export default LessionDetail
