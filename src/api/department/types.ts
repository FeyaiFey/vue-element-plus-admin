export interface DepartmentItem {
  id: string
  department_name: string
  children?: DepartmentItem[]
}

export interface DepartmentListResponse {
  list: DepartmentItem[]
}

export interface DepartmentTableItem {
  id: number
  pid: number | null
  department_name: string
  parent_department: string
  status: number
  created_at: string
}

export interface DepartmentTableListResponse {
  list: DepartmentTableItem[]
  total: number
}

// 部门创建/更新请求参数
export interface DepartmentSaveParams {
  id?: number
  department_name: string
  parent_id?: number | null
  status?: number
}

// 请求参数接口
export interface DepartmentTableParams {
  department_name?: string
  status?: number
  pageIndex?: number
  pageSize?: number
  order_by?: string
  use_cache?: boolean
}

export interface DepartmentUserParams {
  pageSize: number
  pageIndex: number
  id: string
  username?: string
  account?: string
}

export interface DepartmentUserItem {
  id: string
  username: string
  account: string
  email: string
  createTime: string
  role: string
  department: DepartmentItem
}

export interface DepartmentUserResponse {
  list: DepartmentUserItem[]
  total: number
}
