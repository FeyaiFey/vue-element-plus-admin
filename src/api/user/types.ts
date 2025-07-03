/** 个人模块：用户密码更新模型 */
export interface UserPasswordUpdate {
  id: string
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/** 个人模块：用户密码更新请求模型 */
export interface UserPasswordUpdateRequest {
  OldPassword: string
  NewPassword: string
  ConfirmPassword: string
}

/** 个人模块：用户信息更新请求模型 */
export interface UserInfoUpdateRequest {
  UserName: string
  Email: string
}

/** 用户基础模型 */
export interface UserBase {
  UserName: string
  Email: string
  DepartmentId: string
  RoleId?: string
  AvatarUrl?: string
  Status?: string
}

/** 创建用户模型 */
export interface UserCreate extends UserBase {
  Password: string
}

/** 用户登录模型 */
export interface UserLogin {
  Email: string
  Password: string
}

/** 用户登录响应模型 */
export interface UserLoginResponse {
  userInfo: UserInfo
  token: string
}

/** 用户注册模型 */
export interface UserRegister extends UserCreate {
  ConfirmPassword: string
}

/** 用户信息模型 */
export interface UserInfo {
  Id: string
  UserName: string
  Email: string
  RoleId: string
  RoleName: string
  DepartmentId: string
  DepartmentName: string
  AvatarUrl: string
}

/** 权限模块：用户列表查询模型 */
export interface UserListQuery {
  id?: string
  pageIndex: number
  pageSize: number
}

export interface UserListResponse {
  list: UserInfo[]
  total: number
}

/** 权限模块：删除用户请求模型 */
export interface UserDeleteRequest {
  ids: string[]
}

/** 权限模块：创建/编辑用户请求模型 */
export interface UserSaveRequest {
  id?: string
  username?: string
  email?: string
  departmentId?: string
  roleId?: string
  status?: string
}
