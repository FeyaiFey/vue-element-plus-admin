// 发票创建接口
export interface InvoiceCreate {
  file_name: string // 文件名
  invoice_type?: string // 发票类型
  invoice_number: string // 发票号码
  issue_date?: string // 开票日期
  issuer?: string // 开票人
  buyer_name?: string // 购买方名称
  buyer_tax_number?: string // 购买方税号
  seller_name?: string // 销售方名称
  seller_tax_number?: string // 销售方税号
  total_amount?: number // 总金额
  total_tax?: number // 总税额
  total_amount_in_words?: string // 总金额大写
  total_amount_in_numbers?: number // 总金额数字
  status: number // 发票状态：0-作废，1-正常
}

// 发票更新接口
export interface InvoiceUpdate {
  file_name?: string // 文件名
  invoice_type?: string // 发票类型
  invoice_number?: string // 发票号码
  issue_date?: string // 开票日期
  issuer?: string // 开票人
  buyer_name?: string // 购买方名称
  buyer_tax_number?: string // 购买方税号
  seller_name?: string // 销售方名称
  seller_tax_number?: string // 销售方税号
  total_amount?: number // 总金额
  total_tax?: number // 总税额
  total_amount_in_words?: string // 总金额大写
  total_amount_in_numbers?: number // 总金额数字
  status?: number // 发票状态：0-作废，1-正常
}

// 发票响应接口
export interface InvoiceResponse extends InvoiceCreate {
  invoice_id: number // 发票ID
  created_at: string // 创建时间
  updated_at: string // 更新时间
  status_text: string // 状态文本描述
}

// 发票状态更新
export interface InvoiceStatusUpdate {
  status: string
  reason?: string
}

// 发票状态批量更新
export interface InvoiceStatusBatchUpdate {
  invoice_ids: number[]
  status: string
  reason?: string
}

// PDF提取的发票数据
export interface InvoiceExtractData {
  发票类型: string
  发票号码: string
  开票日期: string
  开票人: string
  购买方名称: string
  购买方税号: string
  销售方名称: string
  销售方税号: string
  合计金额: string
  合计税额: string
  价税合计大写: string
  价税合计小写: string
  文件名: string
}

// PDF提取结果响应
export interface InvoiceExtractResponse {
  success: boolean
  data: InvoiceExtractData[]
  errors: string[]
}

// 前端确认的发票数据
export interface InvoiceConfirmData {
  file_name: string
  invoice_type?: string
  invoice_number: string
  issue_date?: string
  issuer?: string
  buyer_name?: string
  buyer_tax_number?: string
  seller_name?: string
  seller_tax_number?: string
  total_amount?: string
  total_tax?: string
  total_amount_in_words?: string
  total_amount_in_numbers?: string
  status: number // 发票状态：0-作废，1-正常
}

// 批量确认发票数据请求
export interface InvoiceBatchConfirmRequest {
  invoices: InvoiceConfirmData[]
  folder_id?: number
}

// 批量确认发票数据响应
export interface InvoiceBatchConfirmResponse {
  success_count: number
  error_count: number
  success_invoices: InvoiceResponse[]
  error_details: Record<string, any>[]
}

// 发票搜索请求
export interface InvoiceSearchRequest {
  invoice_number?: string
  buyer_name?: string
  seller_name?: string
  issue_date_start?: string
  issue_date_end?: string
  amount_min?: number
  amount_max?: number
  status?: number // 发票状态：0-作废，1-正常，不传则查询所有
}

// 发票统计信息
export interface InvoiceStatistics {
  total_count: number
  active_count: number // 正常状态数量
  void_count: number // 作废状态数量
  total_amount: number
  total_tax: number
  average_amount: number
  this_month_count: number
  this_month_amount: number
}

// 发票状态变更历史响应
export interface InvoiceStatusHistoryResponse {
  invoice_id: number // 发票ID
  invoice_number: string // 发票号码
  old_status: number // 原状态
  new_status: number // 新状态
  reason?: string // 变更原因
  updated_by: number // 操作用户ID
  updated_at: string // 变更时间
}
