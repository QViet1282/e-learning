/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/*
   ========================================================================== */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLearningProgress } from '../../api/post/post.api'
import { Pagination } from '@mui/material' // Import Pagination
import { useTranslation } from 'react-i18next'

interface CourseProgress {
  courseId: number
  courseName: string
  locationPath: string
  progress: {
    lessions: {
      completed: number
      total: number
    }
    exams: {
      completed: number
      total: number
    }
  }
}

const LearningProgress: React.FC = () => {
  const { t } = useTranslation()
  const [progress, setProgress] = useState<CourseProgress[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 2 // Number of results per page

  useEffect(() => {
    const fetchLearningProgress = async () => {
      try {
        const response = await getLearningProgress(page, limit)
        setProgress(response.data.progress)
        setTotal(response.data.total)
      } catch (err) {
        console.error(err)
      }
    }

    fetchLearningProgress()
  }, [page])

  const totalPages = Math.ceil(total / limit)

  return (
          <div className="bg-white shadow p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{t('learningProgress.learningProgress')}</h3>
            <div className="space-y-4">
              {progress.map((course) => {
                const totalProgress = Math.round(
                  ((course.progress.lessions.completed + course.progress.exams.completed) /
                    (course.progress.lessions.total + course.progress.exams.total)) *
                    100
                )

                return (
                  <div key={course.courseId} className="border p-4 rounded-lg flex gap-4">
                    <img
                      src={course.locationPath}
                      alt={course.courseName}
                      className="h-20 w-20 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold">{course.courseName}</h4>
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
                          {t('learningProgress.lessons')}: {course.progress.lessions.completed} / {course.progress.lessions.total}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t('learningProgress.exams')}: {course.progress.exams.completed} / {course.progress.exams.total}
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute h-full bg-blue-500"
                            style={{ width: `${totalProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-700 mt-1">{totalProgress}% {t('learningProgress.completed')}</div>
                      </div>
                      <div className="mt-2">
                        <Link
                          to={`/analysis-summary/${course.courseId}`}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          {t('learningProgress.viewDetails')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
              {/* Add placeholder if less than limit */}
              {progress.length < limit && (
                <div className="border p-4 rounded-lg flex gap-4 opacity-0 min-h-48">
                  <div className="h-20 w-20 rounded bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              )}
            </div>
            {/* Updated pagination */}
            <div className="flex justify-center mt-4">
               <Pagination
                 count={totalPages}
                 page={page}
                 onChange={(event, value) => setPage(value)}
                 variant="outlined"
                 shape="rounded"
                 siblingCount={0}
                 boundaryCount={1}
               />
            </div>
          </div>
  )
}

export default LearningProgress
