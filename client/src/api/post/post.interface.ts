
export type CourseItem = Record<string, any>

export interface DataListCourse {
  data: CourseItem[]
  page: number
  size: number
  totalRecords: number
}
export interface ListCourseParams {
  page?: number
  search?: string
  startDate?: Date
  endDate?: Date
  category?: string
}

// exam
export type ExamItem = Record<string, any>

export interface DataListExam {
  durationInMinute: number
  numberOfAttempt: number
  attempted: number
  id: string | undefined
  score: string | undefined
  description: string | undefined
  name: string | undefined
  data: ExamItem[]
  page: number
  size: number
  totalRecords: number
}
