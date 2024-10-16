import { requestWithJwt } from '../request'

import { AxiosResponse } from 'axios'

export const deleteStudyItem = async (studyItemId: number | undefined): Promise<AxiosResponse<any>> => {
  if (studyItemId === undefined) {
    throw new Error('studyItemId cannot be undefined')
  }
  return await requestWithJwt.delete<any>(`/study-items/deleteStudyItem/${studyItemId}`, { withCredentials: true })
}

export const deleteCategoryLession = async (categoryLessionId: number | undefined): Promise<AxiosResponse<any>> => {
  if (categoryLessionId === undefined) {
    throw new Error('categoryLessionId cannot be undefined')
  }
  return await requestWithJwt.delete<any>(`/category-lessions/deleteCategoryLession/${categoryLessionId}`, { withCredentials: true })
}

export const deleteQuestion = async (questionId: number | undefined): Promise<AxiosResponse<any>> => {
  if (questionId === undefined) {
    throw new Error('questionId cannot be undefined')
  }
  return await requestWithJwt.delete<any>(`/questions/deleteQuestion/${questionId}`, { withCredentials: true })
}
