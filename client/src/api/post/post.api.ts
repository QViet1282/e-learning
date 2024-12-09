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
export const registerCheck = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/register/check', { data: payload }, { withCredentials: true })
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

// Quan li khoa hoc

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
  return await requestWithoutJwt.get<DataListCourse>('/courses/', { params })
}

export const getCategoryCourseData = async (): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.get<any>('/courses/course-category')
}

export const getListNewCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithoutJwt.get<DataListCourse>('/courses/getNewCourse', { params })
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
  return await requestWithoutJwt.get<any>(`/courses/${id}`)
}

export const getCategoryLessionsByCourse = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.get<any>(`/learn/getCategoryLessionsByCourse/${id}`)
}

export const getLessionByCategory = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.get<any>(`/learn/getLessionByCategory/${id}`)
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

export const checkCancellationInfor = async (orderCode: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/payment/check-cancel/${orderCode}`)
}

export const getPurchaseHistory = async (userId: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/payment/purchase-history/${userId}`)
}

// -----------------------------------------------trang comment----------------------------
// Lấy tất cả bình luận theo courseId với phân trang private
export const getCommentsByCourseId = async (
  courseId: string,
  limit: number = 5,
  offset: number = 0,
  rating?: number
): Promise<AxiosResponse<any>> => {
  let url = `/enrollments/comments/${courseId}?limit=${limit}&offset=${offset}`
  if (rating !== undefined) {
    url += `&rating=${rating}`
  }
  return await requestWithJwt.get<any>(url)
}

// lấy tất cả bình luận theo courseId với phân trang public
export const getCommentsByCourseIdPublic = async (
  courseId: string,
  limit: number = 5,
  offset: number = 0,
  rating?: number
): Promise<AxiosResponse<any>> => {
  let url = `/enrollments/comments/public/${courseId}?limit=${limit}&offset=${offset}`
  if (rating !== undefined) {
    url += `&rating=${rating}`
  }
  console.log('url', url)
  return await requestWithoutJwt.get<any>(url)
}

// Thêm bình luận mới
export const addComment = async (courseId: string, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>(`/enrollments/${courseId}/comment`, { data: payload })
}

// Sửa bình luận cho một enrollment cụ thể
export const updateComment = async (courseId: string, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/enrollments/${courseId}/comment`, { data: payload })
}

// Xóa bình luận cho một enrollment cụ thể
export const deleteComment = async (courseId: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>(`/enrollments/${courseId}/comment`)
}

// -----------------------------------------------trang notifi----------------------------
export const getNotifications = async (limit: number, offset: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/notifications/getNotiByUserId', {
    params: {
      limit,
      offset
    }
  })
}
export const createNotification = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/notifications/createNotification', { data: payload })
}
export const readNotification = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/notifications/readNotification', { data: payload })
}
export const readAllNotification = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/notifications/readAllNotification')
}
export const markUnread = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/notifications/markAsUnread', { data: payload })
}
export const markAllUnread = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/notifications/markAllAsUnread')
}
export const removeNotification = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>('/notifications/removeNotification', { data: payload })
}
export const removeAllNotification = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>('/notifications/removeAllNotification')
}

// -----------------------------------------------trang profile----------------------------
export const updateAvatar = async (id: string, avatarUrl: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/users/${id}/avatar`, { avatarUrl })
}

// -----------------------------------------------trang giảng viên----------------------------
export const updateRoleToTeacher = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/users/${id}/role/teacher`)
}

export const requestPayout = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/payout-requests/requestPayout', { data: payload }, {
    validateStatus: (status) => {
      return (status >= 200 && status < 300) || status === 409
    }
  })
}

// -----------------------------------------------trang evaluate----------------------------
export const getUserOverview = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/dashboard-report/userOverview')
}
export const getLearningProgress = async (page: number, limit: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/dashboard-report/learningProgress?page=${page}&limit=${limit}`)
}
export const getUserExamScores = async (courseId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/dashboard-report/userExamScores?courseId=${courseId}`)
}
export const getUserExamResults = async (courseId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/dashboard-report/userExamResults?courseId=${courseId}`)
}
export const getUserLessonResults = async (courseId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/dashboard-report/userLessonResults?courseId=${courseId}`)
}
export const getUserDailyProgress = async (date: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/dashboard-report/userDailyProgress?date=${date}`)
}
export const getUserMonthlyProgress = async (month: number, year: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/dashboard-report/userMonthlyProgress?month=${month}&year=${year}`)
}

export const validateCarta = async (userId: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/cart/cart/validate', { userId })
}

export const validateCourseApi = async (
  courseId: string,
  userId: string | null
): Promise<AxiosResponse> => {
  return await requestWithoutJwt.get(`/courses/${courseId}/validate`, {
    params: { userId } // Gửi userId qua query params nếu có
  })
}
