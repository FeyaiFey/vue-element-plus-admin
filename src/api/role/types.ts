export interface Role {
  Id?: string
  RoleName?: string
  RoleCode?: string
  Description?: string
  Status?: string
  CreatedAt?: string
  UpdatedAt?: string
}

/** 权限模块：角色列表查询模型 */
export interface RoleListQuery {
  id?: string
}

export interface RoleListResponse {
  list: Role[]
}

export interface RoleTable {
  RoleCode?: string
  RoleName?: string
  Status?: string
  Description?: string
  CreatedAt?: string
}

export interface RoleTableQuery {
  RoleName?: string
  pageIndex?: number
  pageSize?: number
}

export interface RoleTableResponse {
  list: RoleTable[]
  total: number
}
