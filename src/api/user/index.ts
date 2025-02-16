import request from '@/axios'
import type { UserTableParams, UpdateUserInfoParams, updateUserPasswordParams } from './type'

export const getUserTableApi = (params: UserTableParams) => {
  return request.get({ url: '/user/list', params })
}

export const deleteUserApi = (id: number) => {
  return request.delete({ url: `/user/delete/${id}` })
}

export const batchDeleteUserApi = (ids: number[]) => {
  return request.delete({ url: '/user/batch', data: { ids } })
}

export const updateUserInfoApi = (data: UpdateUserInfoParams) => {
  return request.put({ url: '/user/update', data })
}

export const updateUserPasswordApi = (data: updateUserPasswordParams) => {
  return request.put({ url: '/user/password', data })
}
