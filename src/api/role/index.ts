import request from '@/axios'
import type { Role, RoleCreate, RoleUpdate, RoleListResponse } from './types'

/**
 * 创建角色
 * @param data 角色创建数据
 */
export const createRoleApi = (data: RoleCreate) => {
  return request.post<Role>({
    url: '/roles',
    data
  })
}

/**
 * 获取角色列表（分页）
 * @param params 查询参数
 */
export const getRoleListApi = (params?: { skip?: number; limit?: number; status?: string }) => {
  return request.get<RoleListResponse>({
    url: '/roles',
    params
  })
}

/**
 * 根据ID获取角色详情
 * @param roleId 角色ID
 */
export const getRoleDetailApi = (roleId: string) => {
  return request.get<Role>({
    url: `/roles/${roleId}`
  })
}

/**
 * 获取角色的菜单路由
 * @param roleId 角色ID
 */
export const getRoleMenusApi = (roleId: string) => {
  return request.get<AppCustomRouteRecordRaw[]>({
    url: `/roles/${roleId}/menus`
  })
}

/**
 * 更新角色
 * @param roleId 角色ID
 * @param data 更新数据
 */
export const updateRoleApi = (roleId: string, data: RoleUpdate) => {
  return request.put<Role>({
    url: `/roles/${roleId}`,
    data
  })
}

/**
 * 删除角色
 * @param roleId 角色ID
 */
export const deleteRoleApi = (roleId: string) => {
  return request.delete<null>({
    url: `/roles/${roleId}`
  })
}

/**
 * 更改角色状态
 * @param roleId 角色ID
 * @param status 状态：0-禁用，1-启用
 */
export const changeRoleStatusApi = (roleId: string, status: string) => {
  return request.put<Role>({
    url: `/roles/${roleId}/status`,
    params: {
      status
    }
  })
}

/**
 * 获取角色总数
 * @param status 状态筛选（可选）
 */
export const getRoleCountApi = (status?: string) => {
  return request.get<{ total: number }>({
    url: '/roles/count/total',
    params: status ? { status } : undefined
  })
}

/**
 * 获取所有启用的角色（用于选择器）
 */
export const getActiveRolesApi = () => {
  return request.get<Role[]>({
    url: '/roles',
    params: {
      status: '1',
      limit: 1000 // 获取所有启用的角色
    }
  })
}
