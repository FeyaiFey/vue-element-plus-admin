import request from '@/axios'
import type { UserType, DepartmentType, RegisterType, UserInfoType } from './types'

interface DepartmentParams {
  email: string
}

// 获取部门列表
export const getDepartDataApi = (): Promise<IResponse<DepartmentType[]>> => {
  return request.get({ url: '/mock/user/departments' })
}

// 登录接口
export const loginApi = (data: UserType): Promise<IResponse<UserInfoType>> => {
  return request.post({ url: '/mock/user/login', data })
}

// 注册接口
export const registerApi = (data: RegisterType): Promise<IResponse<string[]>> => {
  return request.post({ url: '/mock/user/register', data })
}

// 获取角色列表
export const getPermissionApi = (params: DepartmentParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list', params })
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
