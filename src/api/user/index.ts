import request from '@/axios'
import type {
  UserTableParams,
  UpdateUserInfoParams,
  updateUserPasswordParams,
  updateEmailPasswordParams,
  UserEmailInfo
} from './type'

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

export const updateEmailPasswordApi = (data: updateEmailPasswordParams) => {
  return request.put({ url: '/user/email-password', data })
}

export const getUserEmailInfoApi = () => {
  return request.get<UserEmailInfo>({ url: '/user/email-info' })
}

// 上传用户头像
export const uploadUserAvatarApi = (data: { avatar: string }) => {
  return request.post({
    url: '/user/avatar',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
