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
import { getUserOverview } from '../../api/post/post.api'
import CourseImg from '../../assets/images/evaluate/online-video.png'
import CourseCompletedImg from '../../assets/images/evaluate/success.png'
import ExamImg from '../../assets/images/evaluate/exam-time.png'
import LessionImg from '../../assets/images/evaluate/tutorial.png'
import { useTranslation } from 'react-i18next'

interface UserOverviewProps {
  user: {
    id: number
    name: string
    email: string
    avatar: string
  }
  stats: {
    totalCourses: number
    completedCourses: number
    totallessions: number
    totalExams: number
  }
}

const UserOverview: React.FC = () => {
  const { t } = useTranslation()
  const [overview, setOverview] = useState<UserOverviewProps | null>(null)

  useEffect(() => {
    const fetchUserOverview = async () => {
      try {
        const response = await getUserOverview()
        setOverview(response.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchUserOverview()
  }, [])

  if (overview == null) return <div>{t('userOverview.loading')}</div>

  return (
       <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg rounded-lg p-6">
         <div className="flex items-center">
           <img
             src={overview.user.avatar}
             alt={overview.user.name}
             className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
           />
           <div className="ml-6">
             <h2 className="text-2xl font-bold">{overview.user.name}</h2>
             <p className="text-gray-100">{overview.user.email}</p>
           </div>
         </div>
         <div className="grid grid-cols-2 gap-6 mt-6 text-center">
           <div className="bg-white text-blue-500 shadow-md rounded-lg p-4 flex items-center">
             <img src={CourseImg} alt="Courses" className="h-8 w-8 mr-4" />
             <div>
               <p className="text-xl font-bold">{overview.stats.totalCourses}</p>
               <p className="text-sm font-medium">{t('userOverview.totalCourses')}</p>
             </div>
           </div>
           <div className="bg-white text-green-500 shadow-md rounded-lg p-4 flex items-center">
             <img src={CourseCompletedImg} alt="Courses" className="h-8 w-8 mr-4" />
             <div>
               <p className="text-xl font-bold">{overview.stats.completedCourses}</p>
               <p className="text-sm font-medium">{t('userOverview.completedCourses')}</p>
             </div>
           </div>
           <div className="bg-white text-yellow-500 shadow-md rounded-lg p-4 flex items-center">
             <img src={LessionImg} alt="Courses" className="h-8 w-8 mr-4" />
             <div>
               <p className="text-xl font-bold">{overview.stats.totallessions}</p>
               <p className="text-sm font-medium">{t('userOverview.totalLessons')}</p>
             </div>
           </div>
           <div className="bg-white text-red-500 shadow-md rounded-lg p-4 flex items-center">
             <img src={ExamImg} alt="Courses" className="h-8 w-8 mr-4" />
             <div>
               <p className="text-xl font-bold">{overview.stats.totalExams}</p>
               <p className="text-sm font-medium">{t('userOverview.totalExams')}</p>
             </div>
           </div>
         </div>
       </div>
  )
}

export default UserOverview
