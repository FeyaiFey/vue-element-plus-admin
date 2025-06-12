import request from '@/axios'
import type { UserInfo, UserPasswordUpdateRequest, UserInfoUpdateRequest } from './types'

export const getCurrentUserApi = () => {
  return request.get<UserInfo>({
    url: '/users/current'
  })
}

// 更新用户头像
export const updateUserAvatarApi = (userId: string, data: { avatar_data: string }) => {
  return request.post<UserInfo>({
    url: `/users/${userId}/avatar`,
    data
  })
}

export const updateUserPasswordApi = (userId: string, data: UserPasswordUpdateRequest) => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  return request.put<UserInfo>({
    url: `/users/${userId}/password`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const updateUserInfoApi = (userId: string, data: UserInfoUpdateRequest) => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  return request.put<UserInfo>({
    url: `/users/${userId}/info`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
