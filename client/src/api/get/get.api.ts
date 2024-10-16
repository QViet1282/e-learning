/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* GET API REQUESTS
   ========================================================================== */

import { requestWithJwt } from '../request'

import { AxiosResponse } from 'axios'
import { Category, CategoryCourse, Course, Question, StudyItem } from './get.interface'

export const getAllCourse = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/getAllCourseInfo', { withCredentials: true })
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
