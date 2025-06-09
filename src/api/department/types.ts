/**
 * 部门相关类型定义
 */

/** 部门模型 */
export interface Department {
  /** 部门ID */
  Id: string
  /** 父部门ID */
  ParentId?: string | null
  /** 部门名称 */
  DepartmentName: string
  /** 状态 */
  Status: string
  /** 创建时间 */
  CreatedAt: string
  /** 更新时间 */
  UpdatedAt: string
}

/** 部门树模型 */
export interface DepartmentTree {
  /** 部门ID */
  Id: string
  /** 部门名称 */
  DepartmentName: string
  /** 子部门列表 */
  Children?: DepartmentTree[] | null
}

/** 部门创建模型 */
export interface DepartmentCreate {
  /** 部门名称 */
  name: string
  /** 父部门ID */
  parent_id?: string | null
}

/** 部门状态更新模型 */
export interface DepartmentStatusUpdate {
  /** 部门ID */
  id: string
  /** 状态 */
  status: string
}

/** 部门查询参数 */
export interface DepartmentQuery {
  /** 部门名称 */
  name?: string
  /** 状态 */
  status?: string
  /** 父部门ID */
  parent_id?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  size?: number
}

/** 部门列表响应 */
export interface DepartmentListResponse {
  /** 部门列表 */
  list: Department[]
  /** 总数 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  size: number
}

/** 部门更新模型 */
export interface DepartmentUpdate {
  /** 部门ID */
  id: string
  /** 部门名称 */
  name?: string
  /** 父部门ID */
  parent_id?: string | null
  /** 状态 */
  status?: string
}
