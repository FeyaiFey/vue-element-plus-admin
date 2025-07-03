export interface MenuList {
  RoleId: string
  RoleName: string
  Id: string
  MenuId: number
  ParentId: number | null
  Name: string
  Title: string | null
  Enabled: boolean
  children: MenuList[]
}

export interface MenuPermissionItem {
  menuId: number
  enabled: boolean
}

export interface UpdateRoleMenuRequest {
  roleId: string
  menuPermissions: MenuPermissionItem[]
}

export interface RoleMenuOperationResponse {
  success: boolean
  message: string
  totalProcessed: number
  added: number
  updated: number
  removed: number
}
