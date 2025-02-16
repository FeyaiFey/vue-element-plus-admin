import request from '@/axios'
import type { UpdateRoleParams } from './type'

export const getRoleListApi = () => {
  return request.get({ url: '/mock/role/table' })
}

export const updateRoleApi = (data: UpdateRoleParams) => {
  return request.put({ url: '/role/update', data })
}
