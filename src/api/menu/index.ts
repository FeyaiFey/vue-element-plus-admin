import request from '@/axios'
import { UpdateRoleMenuRequest, RoleMenuOperationResponse } from './types'

export const getMenuListApi = () => {
  return request.get({ url: '/menus/list' })
}

export const getRoleMenuListApi = (id: string) => {
  return request.get({ url: `/menus/${id}/list` })
}

export const updateRoleMenuApi = (data: UpdateRoleMenuRequest) => {
  return request.put<RoleMenuOperationResponse>({
    url: '/menus/menu-permissions',
    data: data
  })
}
