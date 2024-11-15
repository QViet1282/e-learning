/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* GET API REQUESTS
   ========================================================================== */

import { requestWithJwt } from '../request'

import { AxiosResponse } from 'axios'
import { Category, CategoryCourse, Course, GetAllCourseParams, Question, Role, StudyItem } from './get.interface'

export const getAllCourse = async (params: GetAllCourseParams = {}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/getAllCourseInfo', {
    params,
    withCredentials: true
  })
}

export const getCategoryLessionByCourse = async (courseId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<Category>(`/courses/getCategoryLessionByCourse/${courseId}`, { withCredentials: true })
}

export const getStudyItemByCategoryLessionId = async (lessionCategoryId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<StudyItem>(`/courses/getStudyItemByCategoryLessionId/${lessionCategoryId}`, { withCredentials: true })
}

export const getAllQuestionByExamId = async (examId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<Question>(`/questions/getAllQuestionByExamId/${examId}`, { withCredentials: true })
}

export const getAllCategoryCourse = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<CategoryCourse>('/categories-course/getAllCategoryCourse', { withCredentials: true })
}

export const getCourseById = async (courseId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<Course>(`/courses/getCourseById/${courseId}`, { withCredentials: true })
}

export const getEnrollmentUserByCourseId = async ({ courseId, page, limit, search }: { courseId?: number | undefined, page?: number, limit?: number, search?: string }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/users/getEnrollmentUserByCourseId/${courseId}?page=${page}&limit=${limit}&search=${search}`, { withCredentials: true })
}

export const getExamsByCourseId = async ({ courseId, page, limit, search }: { courseId?: number | undefined, page?: number, limit?: number, search?: string }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/study-items/user-answer-history/${courseId}?page=${page}&limit=${limit}&search=${search}`, { withCredentials: true })
}

export const getAllNotification = async ({ page, limit, search }: { page?: number, limit?: number, search?: string }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/notifications/getAllNotification?page=${page}&limit=${limit}&search=${search}`, { withCredentials: true })
}

export const getAllDeletedNotification = async ({ page, limit, search }: { page?: number, limit?: number, search?: string }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/notifications/getAllDeletedNotification?page=${page}&limit=${limit}&search=${search}`, { withCredentials: true })
}

export const getUsers = async ({ page, limit, search, roleId }: { page?: number, limit?: number, search?: string, roleId: number | null }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/users/getUsers?page=${page}&limit=${limit}&search=${search}&role=${roleId ?? ''}`, { withCredentials: true })
}

export const getRoles = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<Role[]>('/roles/getRoles', { withCredentials: true })
}

// Lấy danh sách các khóa học được đánh giá cao nhất
export const getTopRatedCourses = async ({ limit = 10 }: { limit?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/top-rated-courses?limit=${limit}`, { withCredentials: true })
}

// Lấy danh sách các khóa học có số lượng đăng ký cao nhất
export const getTopEnrollmentCourses = async ({ month, year, limit = 10 }: { month?: number, year?: number, limit?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/top-enrollment-courses?month=${month}&year=${year}&limit=${limit}`, { withCredentials: true })
}

// Lấy danh sách các khóa học có doanh thu cao nhất
export const getTopEarningCourses = async ({ month, year, limit = 10 }: { month?: number, year?: number, limit?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/top-earning-courses?month=${month}&year=${year}&limit=${limit}`, { withCredentials: true })
}

export const getTopEarningTeachers = async ({ month, year, limit = 10 }: { month?: number, year?: number, limit?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/top-earning-teachers?month=${month}&year=${year}&limit=${limit}`, { withCredentials: true })
}

// Lấy danh sách các khóa học có doanh thu cao nhất
// export const getMonthlyRegistrationsByYear = async ({ year }: { year?: number }): Promise<AxiosResponse<any>> => {
//   return await requestWithJwt.get<any>(`/statistics/monthly-registrations?year=${year}`, { withCredentials: true })
// }

// export const getMonthlyRevenueByYear = async ({ year }: { year?: number }): Promise<AxiosResponse<any>> => {
//   return await requestWithJwt.get<any>(`/statistics/monthly-revenue?year=${year}`, { withCredentials: true })
// }

// Thống kê doanh thu và đăng kí toàn hệ thống
export const getAllRegistrationsAndRevenue = async ({ month, year, type }: { month: number, year: number, teacherId?: number, type: 'month' | 'day' }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/allRegistrationsAndRevenue?type=${type}&year=${year}&month=${month}`, { withCredentials: true })
}

export const getUserCourseGrowthStatistics = async ({ month, year, type }: { month: number, year: number, teacherId?: number, type: 'month' | 'day' }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/user-course-growth-statistics?type=${type}&year=${year}&month=${month}`, { withCredentials: true })
}

export const getStatistics = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/statistics/overview', { withCredentials: true })
}

// Thống kê doanh thu đăng ký của 1 khóa học
export const getStatisticsEnrollmentAndRevenueByCourse = async ({ year, courseId, type, month }: { year: number, courseId: number, type: 'month' | 'day', month?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/StatisticsEnrollmentAndRevenueByCourse?year=${year}&courseId=${courseId}&type=${type}&month=${month}`, { withCredentials: true })
}

export const getCourseStatistics = async ({ courseId }: { courseId?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/courseStatistics?courseId=${courseId}`, { withCredentials: true })
}

export const getRatingByCourse = async ({ courseId }: { courseId?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/rating/${courseId}`, { withCredentials: true })
}

// Lấy dữ liệu thống kê doanh thu đăng kí của giáo viên
export const getStatisticsEnrollmentAndRevenueByTeacher = async ({ month, year, teacherId, type }: { month: number, year: number, teacherId?: number, type: 'month' | 'day' }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/StatisticsEnrollmentAndRevenueByTeacher?teacherId=${teacherId}&type=${type}&year=${year}&month=${month}`, { withCredentials: true })
}

// Lấy các thống kê tổng quan của giáo viên
export const getOverviewStatisticsByTeacher = async ({ teacherId }: { teacherId?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/statistics/teacherStatistics?teacherId=${teacherId ?? ''}`, { withCredentials: true })
}
// Lấy các khóa học của giáo viên
export const getAllCourseByTeacher = async ({ teacherId }: { teacherId?: number }): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/courses/getAllCourseByTeacher?teacherId=${teacherId ?? ''}`, { withCredentials: true })
}
