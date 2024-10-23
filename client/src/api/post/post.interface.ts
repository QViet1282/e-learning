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

export interface newCourse {
  categoryCourseId: number | undefined
  name: string
  // assignedBy: number | undefined
}

export interface newCategory {
  id: number | undefined
  courseId?: number
  name: string
  order: number
}

export interface newStudyItemAndLession {
  lessionCategoryId: number | undefined
  name: string
  description: string
  itemType: 'lession'
  uploadedBy: number | undefined
  type: 'MP4' | 'PDF' | null
  locationPath: string | null
}

export interface newStudyItemAndExam {
  lessionCategoryId: number | undefined
  name: string
  description: string
  itemType: 'exam'
  createrId: number | undefined
  numberOfAttempt: number | undefined
  durationInMinute: number | undefined
  pointToPass: number | undefined
}

export interface newQuestion {
  examId: number
  instruction: string
  content: string
  a?: string
  b?: string
  c?: string
  d?: string
  e?: string
  f?: string
  g?: string
  h?: string
  i?: string
  j?: string
  k?: string
  l?: string
  m?: string
  n?: string
  o?: string
  p?: string
  answer: string
  explanation: string
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
