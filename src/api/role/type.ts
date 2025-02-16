export interface RoleItem {
  id: number
  role_name: string
}

export interface UpdateRoleParams {
  id: number[]
  role_id: string[]
  status: number
}
