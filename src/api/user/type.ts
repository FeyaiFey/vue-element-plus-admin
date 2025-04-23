export interface updateUserInfoParams {
  username: string
  email: string
  department_id: number
}

export interface updateUserPasswordParams {
  old_password: string
  new_password: string
}

export interface UserTableItem {
  id: number
  username: string
  email: string
  department_id: number
  department_name: string
  role_id: number[]
  role_name: string[]
  description: string
  status: number
  last_login: string
  created_at: string
}

export interface UserTableParams {
  pageIndex: number
  pageSize: number
  department_id?: number
  use_cache?: boolean
}

export interface UpdateUserInfoParams {
  username?: string
  email?: string
  department_id?: number
  role_id?: number[]
  status?: number
  password?: string
}

export interface updateEmailPasswordParams {
  new_password: string
}

export interface UserEmailInfo {
  ID: number
  EMAIL: string
  PASSWORD?: string
  IMAP_SERVER: string
  SMTP_PORT: number
}
