export interface StudyItemOrderItem {
  studyItemId: number
  oldOrder: number
  newOrder: number
  lessionCategoryId: number
  updatedAt: Date
}

export interface categoryLessionOrderItem {
  lessionCategoryId: number
  oldOrder: number
  newOrder: number
  courseId: number
  updatedAt: Date
}

export interface questionOrderItem {
  questionId: number
  oldOrder: number
  newOrder: number
  examId: number
  updatedAt: Date
}

export interface editLession {
  name: string
  description: string
  uploadedBy: number | undefined
  type: string | undefined
  locationPath: string | undefined
  durationInSecond: number | null
}

export interface editExam {
  name: string
  description: string
  numberOfAttempt: number | undefined
  durationInMinute: number | undefined
  pointToPass: number | undefined
}

export interface editQuestionItem {
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
  answer: string
  explanation: string
}

export interface editCourseItem {
  categoryCourseId?: number
  name?: string
  summary?: string
  startDate?: Date
  endDate?: Date
  description?: string
  locationPath?: string
  videoLocationPath?: string
  prepare?: string
  price?: number
  status?: number
}
