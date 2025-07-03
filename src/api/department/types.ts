/** 部门树模型 */
export interface DepartmentTree {
  Id: string
  DepartmentName: string
  Children?: DepartmentTree[] | null
}

export interface DepartmentItem {
  id: string
  departmentName: string
  status?: number
  createAt?: string
  children?: DepartmentItem[]
}

export interface DepartmentListResponse {
  list: DepartmentItem[]
}

export interface DepartmentTableQuery {
  departmentName?: string
  pageIndex: number
  pageSize: number
}

export interface DepartmentTableResponse {
  list: DepartmentItem[]
  total: number
}

/**
 * 保存部门(新增/编辑)
 */
export interface DepartmentSaveRequest {
  departmentName: string
  parentId?: string
  status?: string
}

export interface DepartmentSaveResponse {
  id: string
  departmentName: string
  parentId: string
  status: string
}

/**
 * 删除部门
 */
export interface DepartmentDeleteRequest {
  ids: string[]
}
