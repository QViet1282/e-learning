
export interface StudyItem {
  id: number | undefined
  lessionCategoryId: number
  name: string
  description: string
  order: number
  itemType: 'exam' | 'lession'
  status: number
  Exam: Exam | null
  Lession: Lession | null
  updatedAt: Date
}

export interface Exam {
  studyItemId: number | undefined
  durationInMinute: number
  pointToPass: number
  createrId: number
  numberOfAttempt: number
}

export interface Lession {
  studyItemId: number | undefined
  locationPath: string
  uploadedBy: number | null
  type: string
}

export interface Question {
  id: number | undefined
  instruction?: string
  content?: string
  type?: string
  order?: number
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
  answer?: string
  explanation?: string
  isQuestionStopped?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Category {
  id: number | undefined
  courseId?: number
  name: string
  order: number
  updatedAt: Date
}

export interface CategoryCourse {
  id: number | undefined
  name: string
  description: string
}

export interface Course {
  id: number | undefined
  categoryCourseId: number
  name: string
  summary?: string
  assignedBy?: number
  durationInMinute?: number
  startDate?: Date
  endDate?: Date
  description?: string
  locationPath?: string
  videoLocationPath?: string
  prepare?: string
  price?: number
  status?: number
  createdAt: Date
  updatedAt: Date
}

export interface GetAllCourseParams {
  page?: number // Số trang
  limit?: number // Giới hạn số bản ghi
  categoryCourseId?: number // ID của danh mục khóa học
  status?: string // Trạng thái
  priceMin?: number // Giá tối thiểu
  priceMax?: number // Giá tối đa
  durationMin?: number // Thời gian tối thiểu
  durationMax?: number // Thời gian tối đa
  name?: string // Tên khóa học
}