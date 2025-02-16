import request from '@/axios'
import type { updateUserInfoParams, updateUserPasswordParams } from './type'

export const getUserInfoApi = () => {
  return request.get({ url: '/mock/auth/userinfo' })
}

export const updateUserInfoApi = (data: updateUserInfoParams) => {
  return request.put({ url: '/mock/user/update', data })
}

export const updateUserPasswordApi = (data: updateUserPasswordParams) => {
  return request.put({ url: '/mock/user/password', data })
}
