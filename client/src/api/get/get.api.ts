/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* GET API REQUESTS
   ========================================================================== */

import { requestWithJwt } from '../request'

import { AxiosResponse } from 'axios'
import { Category, CategoryCourse, Course, GetAllCourseParams, Question, StudyItem } from './get.interface'

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
