
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
