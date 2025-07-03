import request from '@/axios'
import type {
  DepartmentTree,
  DepartmentListResponse,
  DepartmentTableResponse,
  DepartmentTableQuery,
  DepartmentSaveRequest,
  DepartmentSaveResponse,
  DepartmentDeleteRequest
} from './types'

/**
 * 获取部门树结构，用于注册用户时选择部门
 */
export const getDepartmentTreeApi = () => {
  return request.get<DepartmentTree[]>({
    url: '/departments/tree'
  })
}

/**
 * 获取部门列表
 */
export const getDepartmentListApi = () => {
  return request.get<DepartmentListResponse>({
    url: '/departments/list'
  })
}

export const getDepartmentTableApi = (query: DepartmentTableQuery) => {
  return request.get<DepartmentTableResponse>({
    url: '/departments/table',
    params: query
  })
}

/**
 * 保存部门(新增/编辑)
 */
export const saveDepartmentApi = (data: DepartmentSaveRequest) => {
  return request.post<DepartmentSaveResponse>({
    url: '/departments/save',
    data
  })
}

/**
 * 删除部门
 */
export const deleteDepartmentByIdApi = (data: DepartmentDeleteRequest) => {
  return request.delete<any>({
    url: `/departments/delete`,
    data
  })
}
