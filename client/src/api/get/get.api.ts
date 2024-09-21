/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* GET API REQUESTS
   ========================================================================== */

import { requestWithJwt } from '../request'

import { AxiosResponse } from 'axios'

export const getAllCourse = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/getAllCourse', { withCredentials: true })
}

export const getCategoryLessionByCourse = async (courseId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/courses/getCategoryLessionByCourse/${courseId}`, { withCredentials: true })
}

export const getLessionByCategory = async (lessionCategoryId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/courses/getLessionByCategory/${lessionCategoryId}`, { withCredentials: true })
}
