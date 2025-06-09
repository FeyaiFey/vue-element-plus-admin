/**
 * 角色相关类型定义
 */

/** 角色基础模型 */
export interface RoleBase {
  /** 角色名称 */
  RoleName: string
  /** 角色代码 */
  RoleCode: string
  /** 角色描述 */
  Description?: string | null
  /** 状态:0-禁用;1-启用 */
  Status: string
}

/** 创建角色模型 */
export interface RoleCreate extends RoleBase {
  // 继承RoleBase的所有字段
}

/** 更新角色模型 */
export interface RoleUpdate {
  /** 角色名称 */
  RoleName?: string
  /** 角色代码 */
  RoleCode?: string
  /** 角色描述 */
  Description?: string | null
  /** 状态:0-禁用;1-启用 */
  Status?: string
}

/** 数据库中的角色模型 */
export interface RoleInDB extends RoleBase {
  /** 角色ID */
  Id: string
  /** 创建时间 */
  CreatedAt: string
  /** 更新时间 */
  UpdatedAt?: string | null
}

/** 角色响应模型 */
export interface Role extends RoleInDB {
  // 继承RoleInDB的所有字段
}

/** 角色查询参数 */
export interface RoleQuery {
  /** 角色名称 */
  RoleName?: string
  /** 角色代码 */
  RoleCode?: string
  /** 状态 */
  Status?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  size?: number
}

/** 角色列表响应 */
export interface RoleListResponse {
  /** 角色列表 */
  list: Role[]
  /** 总数 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  size: number
}

/** 角色状态更新模型 */
export interface RoleStatusUpdate {
  /** 角色ID */
  id: string
  /** 状态:0-禁用;1-启用 */
  status: string
}

/** 角色选择项 */
export interface RoleOption {
  /** 角色ID */
  value: string
  /** 角色名称 */
  label: string
  /** 角色代码 */
  code?: string
  /** 是否禁用 */
  disabled?: boolean
}
