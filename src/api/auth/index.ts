import request from '@/axios'
import type { UserRegister, UserLogin, UserLoginResponse, UserBase } from '@/api/user/types'

/**
 * 用户注册
 * @param data 注册数据
 */
export const registerApi = (data: UserRegister) => {
  return request.post<UserBase>({
    url: '/auth/register',
    data
  })
}

/**
 * 用户登录
 * @param data 登录数据
 */
export const loginApi = (data: UserLogin) => {
  // 将数据转换为 FormData 格式
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })

  return request.post<UserLoginResponse>({
    url: '/auth/login',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 用户登出
 * 撤销当前用户的所有令牌
 */
export const logoutApi = (user_id?: string) => {
  return request.post({
    url: '/auth/logout',
    data: {
      user_id
    }
  })
}
