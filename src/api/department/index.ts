import request from '@/axios'
import type {
  DepartmentListResponse,
  DepartmentTableListResponse,
  DepartmentTableParams,
  DepartmentSaveParams,
  DepartmentUserParams,
  DepartmentUserResponse
} from './types'

export const getDepartmentApi = (): Promise<IResponse<DepartmentListResponse>> => {
  return request.get({ url: '/mock/department/list' })
}

export const getUserByIdApi = (params: DepartmentUserParams) => {
  return request.get<DepartmentUserResponse>({ url: '/mock/department/users', params })
}

export const deleteUserByIdApi = (ids: string[] | number[]) => {
  return request.post({ url: '/mock/department/user/delete', data: { ids } })
}

export const saveUserApi = (data: any) => {
  return request.post({ url: '/mock/department/user/save', data })
}

export const saveDepartmentApi = (data: DepartmentSaveParams): Promise<IResponse> => {
  return request.post({ url: '/mock/department/save', data })
}

export const deleteDepartmentApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `/mock/department/${id}` })
}

export const batchDeleteDepartmentApi = (ids: number[]): Promise<IResponse> => {
  return request.post({ url: '/mock/department/batch/delete', data: { ids } })
}

export const getDepartmentTableApi = (
  params: DepartmentTableParams
): Promise<IResponse<DepartmentTableListResponse>> => {
  return request.get({ url: '/mock/department/table/list', params })
}
