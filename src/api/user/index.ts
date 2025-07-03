import request from '@/axios'
import type {
  UserInfo,
  UserPasswordUpdateRequest,
  UserInfoUpdateRequest,
  UserListQuery,
  UserListResponse,
  UserDeleteRequest,
  UserSaveRequest
} from './types'

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
  return request.put<UserInfo>({
    url: `/users/${userId}/password`,
    data: data
  })
}

export const updateUserInfoApi = (userId: string, data: UserInfoUpdateRequest) => {
  return request.put<UserInfo>({
    url: `/users/${userId}/info`,
    data: data
  })
}

// 权限：用户部分
export const getUserByIdApi = (data: UserListQuery) => {
  return request.get<UserListResponse>({
    url: `/users/table`,
    params: data
  })
}

/** 权限模块：删除用户请求模型 */
export const deleteUserByIdApi = (data: UserDeleteRequest) => {
  return request.delete<any>({
    url: `/users/delete`,
    data
  })
}

/** 权限模块：创建/编辑用户请求模型 */
export const saveUserApi = (data: UserSaveRequest) => {
  return request.post<UserInfo>({
    url: `/users/save`,
    data
  })
}
