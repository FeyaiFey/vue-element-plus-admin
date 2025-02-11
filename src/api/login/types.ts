export interface UserLoginType {
  email: string
  password: string
}

export interface UserType {
  email: string
  password: string
  username: string
  department_name: string
  roles: string[]
  avatar_url: string
}

export interface UserInfoType {
  userinfo: UserType
  token: string
}

export interface DepartmentType {
  label: string
  value: number
  children?: DepartmentType[]
  parentId?: string | null
}

export interface RegisterType {
  username: string
  email: string
  password: string
  department_id: number
}
