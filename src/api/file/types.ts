// 基础文件夹接口
export interface FolderBase {
  name: string // 文件夹名称
  parent_id?: number // 父文件夹ID
  is_public: boolean // 是否公开
}

// 创建文件夹请求
export type FolderCreate = FolderBase

// 更新文件夹请求
export interface FolderUpdate {
  name?: string // 文件夹名称
  parent_id?: number // 父文件夹ID
  is_public?: boolean // 是否公开
}

// 文件夹响应
export interface FolderResponse extends FolderBase {
  id: number
  user_id?: number // 创建用户ID
  created_at: string
  updated_at: string
}

// 基础文件接口
export interface FileBase {
  name: string // 文件名
  folder_id?: number // 所属文件夹ID
  is_public: boolean // 是否公开
  tags?: string // 标签，以逗号分隔
}

// 文件上传请求
export interface FileUpload {
  folder_id?: number // 所属文件夹ID
  is_public: boolean // 是否公开
  tags?: string // 标签，以逗号分隔
}

// 更新文件请求
export interface FileUpdate {
  name?: string // 文件名
  folder_id?: number // 所属文件夹ID
  is_public?: boolean // 是否公开
  tags?: string // 标签，以逗号分隔
}

// 文件响应
export interface FileResponse extends FileBase {
  id: number
  original_name: string // 原始文件名
  extension: string // 文件扩展名
  mime_type: string // MIME类型
  size: number // 文件大小(字节)
  path: string // 文件存储路径
  user_id?: number // 上传用户ID
  is_folder: boolean // 是否是文件夹
  created_at: string
  updated_at: string
}

// 文件树节点
export interface FileTreeNode {
  id: number
  name: string
  is_folder: boolean
  parent_id?: number
  children: FileTreeNode[]
}

// 批量上传响应
export interface BatchUploadResponse {
  success: FileResponse[]
  failed: Record<string, any>[]
}

// 文件搜索请求
export interface FileSearchRequest {
  query: string // 搜索关键词
  folder_id?: number // 在指定文件夹中搜索
  file_type?: string // 文件类型过滤
  date_from?: string // 开始日期
  date_to?: string // 结束日期
}
