/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* POST API REQUESTS
   ========================================================================== */

import { requestWithJwt, requestWithoutJwt } from '../request'

import { AxiosResponse } from 'axios'
import { DataListCourse, ListCourseParams } from './post.interface'

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

export const getAllCourse = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/getAllCourse', { withCredentials: true })
}

export const createCategoryLession = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/courses/createCategoryLession', payload, { withCredentials: true })
}

export const updateCategoryLessions = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/courses/updateCategoryLessions', { categoryLessions: payload }, { withCredentials: true })
}

// trang home page
export const getListProCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/paidCourse', { params })
}

export const getListFreeCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/freeCourse', { params })
}

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
