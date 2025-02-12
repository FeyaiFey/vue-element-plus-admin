import request from '@/axios'
import type { UserLoginType, UserType, DepartmentType, RegisterType, UserInfoType } from './types'

interface RoleParams {
  role: string
}

// 获取部门列表
export const getDepartDataApi = (): Promise<IResponse<DepartmentType[]>> => {
  return request.get({ url: '/mock/auth/department' })
}

// 登录接口
export const loginApi = (data: UserLoginType): Promise<IResponse<UserInfoType>> => {
  return request.post({ url: '/mock/auth/login', data })
}

// 注册接口
export const registerApi = (data: RegisterType): Promise<IResponse<string[]>> => {
  return request.post({ url: '/mock/auth/register', data })
}

// 获取角色列表
export const getRoleRouterApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/mock/auth/routes', params })
}

// 退出登录
export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/mock/user/loginout' })
}

export const getUserListApi = ({ params }: AxiosConfig) => {
  return request.get<{
    code: string
    data: {
      list: UserType[]
      total: number
    }
  }>({ url: '/mock/user/list', params })
}

// export const getAdminRoleApi = (
//   params: RoleParams
// ): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
//   return request.get({ url: '/mock/role/list', params })
// }

// export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
//   return request.get({ url: '/mock/role/list2', params })
// }
