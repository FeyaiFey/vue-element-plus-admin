export interface UserLoginType {
  email: string
  password: string
}

export interface UserType {
  email: string
  password: string
  nickname: string
  department: string
  avatarUrl: string
}

export interface UserInfoType {
  userinfo: UserType
  token: string
}

export interface DepartmentType {
  label: string
  value: string
}

export interface RegisterType {
  nickname: string
  email: string
  password: string
  department_id: number
}
