/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: COURSEPAGE
   ========================================================================== */

import React, { useEffect, useState } from 'react'
import { getAllCourse } from '../../api/post/post.api'

const CoursePage = () => {
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    getAllCourse().then((res) => {
      setCourses(res.data)
    })
  }, [])

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>{course.name}</div>
      )) }
    </div>
  )
}

export default CoursePage
