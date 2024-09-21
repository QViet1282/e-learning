/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* POST API REQUESTS
   ========================================================================== */

import { requestWithJwt, requestWithoutJwt } from '../request'

import { AxiosResponse } from 'axios'

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
