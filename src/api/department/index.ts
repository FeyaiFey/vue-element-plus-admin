import request from '@/axios'
import type {
  Department,
  DepartmentTree,
  DepartmentCreate,
  DepartmentQuery,
  DepartmentListResponse,
  DepartmentUpdate
} from './types'

/**
 * 获取部门树结构
 */
export const getDepartmentTreeApi = () => {
  return request.get<DepartmentTree[]>({
    url: '/departments/tree'
  })
}

/**
 * 创建部门
 */
export const createDepartmentApi = (data: DepartmentCreate) => {
  return request.post<Department>({
    url: '/departments',
    data
  })
}

/**
 * 更新部门状态
 * @param departmentId 部门ID
 * @param status 状态：0-禁用，1-启用
 */
export const updateDepartmentStatusApi = (departmentId: string, status: string) => {
  return request.put<Department>({
    url: `/departments/${departmentId}/status`,
    params: {
      status_update: status
    }
  })
}

/**
 * 删除部门
 * @param departmentId 部门ID
 */
export const deleteDepartmentApi = (departmentId: string) => {
  return request.delete<null>({
    url: `/departments/${departmentId}`
  })
}

/**
 * 获取部门列表（分页查询）
 * @param params 查询参数
 */
export const getDepartmentListApi = (params?: DepartmentQuery) => {
  return request.get<DepartmentListResponse>({
    url: '/departments',
    params
  })
}

/**
 * 根据ID获取部门详情
 * @param departmentId 部门ID
 */
export const getDepartmentDetailApi = (departmentId: string) => {
  return request.get<Department>({
    url: `/departments/${departmentId}`
  })
}

/**
 * 更新部门信息
 * @param data 更新数据
 */
export const updateDepartmentApi = (data: DepartmentUpdate) => {
  return request.put<Department>({
    url: `/departments/${data.id}`,
    data
  })
}
