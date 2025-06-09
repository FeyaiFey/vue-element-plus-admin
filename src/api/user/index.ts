import request from '@/axios'
import type { UserInfo } from './types'

export const getCurrentUserApi = () => {
  return request.get<UserInfo>({
    url: '/users/current'
  })
}

// 上传用户头像
export const uploadUserAvatarApi = (data: { avatar: string }) => {
  return request.post({
    url: '/users/avatar',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
