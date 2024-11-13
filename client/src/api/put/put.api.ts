// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { requestWithJwt, requestWithoutJwt } from '../request'

import { AxiosResponse } from 'axios'
import { categoryLessionOrderItem, editCourseItem, editExam, editLession, editQuestionItem, questionOrderItem, StudyItemOrderItem } from './put.interface'

export const updateStudyItemOrder = async (payload: StudyItemOrderItem): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/courses/updateStudyItemOrder', payload, { withCredentials: true })
}

export const updateCategoryLessionOrder = async (payload: categoryLessionOrderItem): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/courses/updateCategoryLessionOrder', payload, { withCredentials: true })
}

export const updateQuestionOrder = async (payload: questionOrderItem): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/questions/updateQuestionOrder', payload, { withCredentials: true })
}

// Hàm chỉnh sửa StudyItem và Lession
export const editStudyItemAndLession = async (studyItemId: number | undefined, payload: editLession): Promise<AxiosResponse<any>> => {
  if (studyItemId === undefined) {
    throw new Error('studyItemId cannot be undefined')
  }
  return await requestWithJwt.put<any>(`/study-items/editStudyItemAndLession/${studyItemId}`, payload, { withCredentials: true })
}

// Hàm chỉnh sửa StudyItem và Exam
export const editStudyItemAndExam = async (studyItemId: number | undefined, payload: editExam): Promise<AxiosResponse<any>> => {
  if (studyItemId === undefined) {
    throw new Error('studyItemId cannot be undefined')
  }
  return await requestWithJwt.put<any>(`/study-items/editStudyItemAndExam/${studyItemId}`, payload, { withCredentials: true })
}

export const editCategoryLession = async (categoryLessionId: number | undefined, payload: { name?: string, status?: number }): Promise<AxiosResponse<any>> => {
  if (categoryLessionId === undefined) {
    throw new Error('categoryLessionId cannot be undefined')
  }
  return await requestWithJwt.put<any>(`/category-lessions/editCategoryLession/${categoryLessionId}`, payload, { withCredentials: true })
}

export const editQuestion = async (questionId: number | undefined, payload: editQuestionItem): Promise<AxiosResponse<any>> => {
  if (questionId === undefined) {
    throw new Error('questionId cannot be undefined')
  }
  return await requestWithJwt.put<any>(`/questions/editQuestion/${questionId}`, payload, { withCredentials: true })
}

export const editCourse = async (courseId: number | undefined, payload: editCourseItem): Promise<AxiosResponse<any>> => {
  if (courseId === undefined) {
    throw new Error('courseId cannot be undefined')
  }
  return await requestWithJwt.put<any>(`/courses/editCourse/${courseId}`, payload, { withCredentials: true })
}

export const updateCourseStatus = async (courseId: number | undefined, payload: { status: number | undefined, startDate: Date, endDate: Date | null }): Promise<AxiosResponse<any>> => {
  if (courseId === undefined) {
    throw new Error('courseId cannot be undefined')
  }
  return await requestWithJwt.put<any>(`/courses/updateCourseStatus/${courseId}`, payload, { withCredentials: true })
}

export const deleteNotification = async (id: number | undefined): Promise<AxiosResponse<any>> => {
  if (id === undefined) {
    throw new Error('notificationId cannot be undefined')
  }
  return await requestWithJwt.put<any>(`/notifications/edit/${id}`, { isDeleted: true }, { withCredentials: true })
}
