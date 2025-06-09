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
  return request.post<UserLoginResponse>({
    url: '/auth/login',
    data
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
