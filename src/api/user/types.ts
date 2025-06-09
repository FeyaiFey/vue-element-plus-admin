/**
 * 用户相关类型定义
 */

/** 角色信息模型 */
export interface RoleInfo {
  /** 角色ID */
  Id: string
  /** 角色名称 */
  RoleName: string
  /** 角色代码 */
  RoleCode: string
  /** 角色描述 */
  Description?: string | null
}

/** 部门信息模型 */
export interface DepartmentInfo {
  /** 部门ID */
  Id: string
  /** 部门名称 */
  DepartmentName: string
}

/** 用户基础模型 */
export interface UserBase {
  /** 用户名 */
  UserName: string
  /** 邮箱 */
  Email: string
  /** 部门ID */
  DepartmentId: string
  /** 角色ID */
  RoleId?: string
  /** 头像URL */
  AvatarUrl?: string
  /** 状态:0-禁用;1-启用 */
  Status?: string
}

/** 创建用户模型 */
export interface UserCreate extends UserBase {
  /** 密码 */
  Password: string
}

/** 更新用户模型 */
export interface UserUpdate {
  /** 用户名 */
  UserName?: string
  /** 邮箱 */
  Email?: string
  /** 部门ID */
  DepartmentId?: string
  /** 角色ID */
  RoleId?: string
  /** 头像URL */
  AvatarUrl?: string
  /** 状态:0-禁用;1-启用 */
  Status?: string
}

/** 数据库中的用户模型 */
export interface UserInDB extends UserBase {
  /** 用户ID */
  Id: string
  /** 密码哈希 */
  PasswordHash: string
  /** 创建时间 */
  CreatedAt: string
  /** 更新时间 */
  UpdatedAt?: string | null
}

/** 用户响应模型 */
export interface User {
  /** 用户ID */
  Id: string
  /** 用户名 */
  UserName: string
  /** 邮箱 */
  Email: string
  /** 部门ID */
  DepartmentId: string
  /** 角色ID */
  RoleId: string
  /** 头像URL */
  AvatarUrl: string
  /** 状态:0-禁用;1-启用 */
  Status: string
  /** 创建时间 */
  CreatedAt: string
  /** 更新时间 */
  UpdatedAt?: string | null
  /** 关联部门信息 */
  department?: DepartmentInfo | null
  /** 关联角色信息 */
  role?: RoleInfo | null
}

/** 用户登录模型 */
export interface UserLogin {
  /** 邮箱 */
  Email: string
  /** 密码 */
  Password: string
}

/** 用户注册模型 */
export interface UserRegister extends UserCreate {
  /** 确认密码 */
  ConfirmPassword: string
}

/** 用户信息模型 */
export interface UserInfo {
  /** 用户ID */
  Id: string
  /** 用户名 */
  UserName: string
  /** 邮箱 */
  Email: string
  /** 角色ID */
  RoleId: string
  /** 角色名称 */
  RoleName: string
  /** 部门ID */
  DepartmentId: string
  /** 部门名称 */
  DepartmentName: string
  /** 头像URL */
  AvatarUrl: string
}

/** 用户登录响应模型 */
export interface UserLoginResponse {
  /** 用户信息 */
  userInfo: UserInfo
  /** 访问令牌 */
  token: string
}

/** 用户查询参数 */
export interface UserQuery {
  /** 用户名 */
  UserName?: string
  /** 邮箱 */
  Email?: string
  /** 部门ID */
  DepartmentId?: string
  /** 角色ID */
  RoleId?: string
  /** 状态 */
  Status?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  size?: number
}

/** 用户列表响应 */
export interface UserListResponse {
  /** 用户列表 */
  list: User[]
  /** 总数 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  size: number
}

/** 用户状态更新模型 */
export interface UserStatusUpdate {
  /** 用户ID */
  id: string
  /** 状态:0-禁用;1-启用 */
  status: string
}

/** 用户密码更新模型 */
export interface UserPasswordUpdate {
  /** 用户ID */
  id: string
  /** 旧密码 */
  oldPassword: string
  /** 新密码 */
  newPassword: string
  /** 确认新密码 */
  confirmPassword: string
}
