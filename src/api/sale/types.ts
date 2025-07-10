// 销售目标查询参数
export interface SaleTargetQuery {
  pageIndex?: number
  pageSize?: number
  year?: number
  month?: number
  departmentName?: string
  employeeName?: string
  createBy?: string
}

// 销售目标数据
export interface SaleTarget {
  id: number
  year: number
  month: number
  departmentName: string
  employeeName: string
  monthTarget: number
  createBy: string
  createTime: string
  updateTime: string
}

// 销售目标响应
export interface SaleTargetResponse {
  list: SaleTarget[]
  total: number
}

// 创建销售目标
export interface SaleTargetCreate {
  year: number
  month: number
  departmentName: string
  employeeName: string
  monthTarget: number
}

// 导入销售目标
export interface SaleTargetImport {
  year: number
  month: number
  departmentName: string
  employeeName: string
  monthTarget: number
}

// 导入销售目标响应
export interface SaleTargetImportResponse {
  successCount: number
  errorCount: number
  errors: string[]
}

// 上传进度
export interface UploadProgress {
  taskId: string
  status: 'processing' | 'completed' | 'error'
  progress: number
  current: number
  total: number
  message: string
  successCount: number
  errorCount: number
  errors: string[]
}
