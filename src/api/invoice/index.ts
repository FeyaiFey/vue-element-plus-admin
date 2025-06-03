import request from '@/axios'
import type {
  InvoiceCreate,
  InvoiceUpdate,
  InvoiceResponse,
  InvoiceExtractResponse,
  InvoiceBatchConfirmRequest,
  InvoiceBatchConfirmResponse,
  InvoiceSearchRequest,
  InvoiceStatistics,
  InvoiceStatusUpdate,
  InvoiceStatusBatchUpdate
} from './type'

// 从PDF文件提取发票数据
export const extractInvoiceDataApi = (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  return request.post<InvoiceExtractResponse>({
    url: '/invoice/extract/',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 确认并保存发票数据
export const confirmAndSaveInvoicesApi = (data: InvoiceBatchConfirmRequest, files: File[]) => {
  const formData = new FormData()

  // 添加发票数据
  formData.append('invoice_data', JSON.stringify(data))

  // 添加文件
  files.forEach((file) => {
    formData.append('files', file)
  })

  return request.post<InvoiceBatchConfirmResponse>({
    url: '/invoice/confirm/',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取发票列表
export const getInvoicesApi = (params?: {
  skip?: number
  limit?: number
  order_by?: string
  order_desc?: boolean
  status_filter?: number
}) => {
  return request.get<InvoiceResponse[]>({
    url: '/invoice/',
    params
  })
}

// 获取正常状态的发票
export const getActiveInvoicesApi = (params?: { skip?: number; limit?: number }) => {
  return request.get<InvoiceResponse[]>({
    url: '/invoice/active/',
    params
  })
}

// 获取作废状态的发票
export const getVoidInvoicesApi = (params?: { skip?: number; limit?: number }) => {
  return request.get<InvoiceResponse[]>({
    url: '/invoice/void/',
    params
  })
}

// 更新发票状态
export const updateInvoiceStatusApi = (invoiceId: number, data: InvoiceStatusUpdate) => {
  return request.put<InvoiceResponse>({
    url: `/invoice/${invoiceId}/status`,
    data
  })
}

// 作废发票
export const voidInvoiceApi = (invoiceId: number) => {
  return request.put<InvoiceResponse>({
    url: `/invoice/${invoiceId}`,
    data: { status: 'void' }
  })
}

// 激活发票
export const activateInvoiceApi = (invoiceId: number) => {
  return request.put<InvoiceResponse>({
    url: `/invoice/${invoiceId}`,
    data: { status: 'active' }
  })
}

// 批量更新发票状态
export const batchUpdateInvoiceStatusApi = (data: InvoiceStatusBatchUpdate) => {
  return request.put<{
    success_count: number
    error_count: number
    success_invoices: InvoiceResponse[]
    error_details: Record<string, any>[]
  }>({
    url: '/invoice/batch/status',
    data
  })
}

// 获取发票详情
export const getInvoiceApi = (invoiceId: number) => {
  return request.get<InvoiceResponse>({
    url: `/invoice/${invoiceId}`
  })
}

// 更新发票信息
export const updateInvoiceApi = (invoiceId: number, data: InvoiceUpdate) => {
  return request.put<InvoiceResponse>({
    url: `/invoice/${invoiceId}`,
    data
  })
}

// 删除发票
export const deleteInvoiceApi = (invoiceId: number) => {
  return request.delete({
    url: `/invoice/${invoiceId}`
  })
}

// 搜索发票
export const searchInvoicesApi = (
  searchParams: InvoiceSearchRequest,
  params?: {
    skip?: number
    limit?: number
  }
) => {
  return request.post<{
    invoices: InvoiceResponse[]
    total: number
    skip: number
    limit: number
  }>({
    url: '/invoice/search/',
    data: searchParams,
    params
  })
}

// 获取发票统计信息
export const getInvoiceStatisticsApi = () => {
  return request.get<InvoiceStatistics>({
    url: '/invoice/statistics/summary'
  })
}

// 获取最近的发票
export const getRecentInvoicesApi = (params?: { days?: number; limit?: number }) => {
  return request.get<InvoiceResponse[]>({
    url: '/invoice/recent/list',
    params
  })
}

// 手动创建发票
export const createInvoiceApi = (data: InvoiceCreate) => {
  return request.post<InvoiceResponse>({
    url: '/invoice/create/',
    data
  })
}
