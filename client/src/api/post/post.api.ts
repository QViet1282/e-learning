/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* POST API REQUESTS
   ========================================================================== */

import { requestWithJwt, requestWithoutJwt } from '../request'

import { AxiosResponse } from 'axios'
import { newCategory, DataListCourse, ListCourseParams, newQuestion, newStudyItemAndExam, newStudyItemAndLession, newCourse, DataListExam } from './post.interface'

// auth
export const login = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/login', { data: payload }, { withCredentials: true })
}

export const register = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/register', { data: payload }, { withCredentials: true })
}

export const refresh = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/auth/refresh', {}, { withCredentials: true })
}

export const logout = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/auth/logout', {}, { withCredentials: true })
}

export const sendOTP = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/sendOTP', { data: payload }, { withCredentials: true })
}

export const verifyOTP = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/verifyOTP', { data: payload }, { withCredentials: true })
}

export const resetPassword = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/resetPassword', { data: payload }, { withCredentials: true })
}

export const getAllCourse = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/getAllCourse', { withCredentials: true })
}

export const createCourse = async (payload: newCourse): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/courses/createNewCourse', payload, { withCredentials: true })
}

export const createCategoryLession = async (payload: newCategory): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/courses/createCategoryLession', payload, { withCredentials: true })
}

export const createStudyItemAndLession = async (payload: newStudyItemAndLession): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/study-items/createStudyItemAndLession', payload, { withCredentials: true })
}

export const createStudyItemAndExam = async (payload: newStudyItemAndExam): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/study-items/createStudyItemAndExam', payload, { withCredentials: true })
}

export const createQuestion = async (payload: newQuestion): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/questions/createQuestion', payload, { withCredentials: true })
}

export const createAndReplicateNotification = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/notifications/createAndReplicateNotification', { data: payload })
}

// trang home page

export const getListCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/', { params })
}

export const getCategoryCourseData = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/course-category')
}

export const getListNewCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/getNewCourse', { params })
}

export const getEnrollmentByCourseId = async ({
  courseId
}: {
  courseId?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/getEnrollmentByCourseId/${courseId}`)
}

// trang course detail
export const getCourseDetail = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/courses/${id}`)
}

export const getCategoryLessionsByCourse = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/getCategoryLessionsByCourse/${id}`)
}

export const getLessionByCategory = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/getLessionByCategory/${id}`)
}

export const addEnrollments = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/learn/addEnrollment', { data: payload })
}

export const getEnrollmentByUserId = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/learn/getEnrollmentByUserId')
}

// trang learning // phải sửa lại
export const getLessionById = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/${id}`)
}
// trang learning // phải sửa lại
export const getProgressByEnrollmentId = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/getProgressByEnrollmentId/${id}`)
}

// trang learning // phải sửa lại
export const addProgress = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/learn/addProgress', { data: payload })
}

// trang learning // phải sửa lại
export const markCourseAsDone = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/learn/markAsComplete', { data: payload })
}

// trang learning
export const createNotification = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/notifications/createNotification', { data: payload })
}

// -----------------------------------------------trang profile----------------------------
export const findUserById = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/users/${id}`)
}
export const updateUser = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/users/${id}`, { data: payload })
}

// -----------------------------------------------trang exam----------------------------

// trang home - index.tsx
export const getListExams = async (): Promise<AxiosResponse<DataListExam>> => {
  return await requestWithJwt.get<DataListExam>('/exams')
}
// lấy chi tiết bài thi
export const getDetailExamsOne = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/exams/getDetailExamsOne/${id}`)
}

export const getDetailExams = async ({
  id, attempt, status
}: {
  id?: string
  attempt?: string | null
  status?: string | null
}): Promise<AxiosResponse<any>> => {
  if (attempt != null || attempt !== undefined) {
    return await requestWithJwt.get<any>(`/exams/${id}/${attempt}?status=${status}`)
  } else {
    return await requestWithJwt.get<any>(`/exams/${id}?status=${status}`)
  }
}

export const getShortHistoryExams = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/exams/${id}/getShortHistory`)
}

export const getDashboardData = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/dashboard')
}

export const saveQuestionsForExam = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/dashboard/create', { data: payload })
}

export const markExam = async (
  id: string,
  payload: any
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>(`/exams/${id}`, { data: payload })
}

export const saveTempAnswer = async (
  id: string,
  payload: any
): Promise<AxiosResponse<any>> => {
  console.log('payload', payload)
  return await requestWithJwt.post<any>(`/exams/${id}/saveTemporaryAnswer`, { data: payload })
}

// -----------------------------------------------trang my course----------------------------
export const getListMyCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/myCourses', { params })
}

export const getListMyCoursesDone = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/myCoursesDone', { params })
}

export const getListMyCoursesActive = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/myCoursesActive', { params })
}

export const getCart = async (userId: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/cart/cart/${userId}`)
}

export const removeCourseFromCartApi = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>('/cart/cart/remove', { data: payload })
}

export const addToCartApi = async (payload: any): Promise<AxiosResponse<any>> => {
  console.log('Sending payload:', payload)
  return await requestWithJwt.post<any>('/cart/cart/add', { data: payload })
}

export const processPaymentApi = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/payment/process', { data: payload })
}
