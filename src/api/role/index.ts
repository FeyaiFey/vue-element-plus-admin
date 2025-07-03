import request from '@/axios'
import type { RoleListQuery, RoleListResponse, RoleTableQuery, RoleTableResponse } from './types'

export const getRoleMenusApi = (roleId: string) => {
  return request.get<AppCustomRouteRecordRaw[]>({
    url: `/roles/${roleId}/menus`
  })
}

export const getRoleListApi = (query: RoleListQuery) => {
  return request.get<RoleListResponse>({
    url: `/roles/list`,
    params: query
  })
}

export const getRoleTableApi = (query: RoleTableQuery) => {
  return request.get<RoleTableResponse>({
    url: `/roles/table`,
    params: query
  })
}
