import request from '@/axios'
import type {
  SaleTargetQuery,
  SaleTargetResponse,
  SaleTargetCreate,
  SaleTargetImportResponse,
  SaleAnalysisPannelResponse,
  SaleAnalysisGaugeResponse,
  SaleAnalysisChipClassPieResponse,
  SaleDataDetailQuery,
  SaleDataDetailResponse,
  SaleDataSummaryQuery,
  SaleDataSummaryResponse,
  SaleStockUpSummaryQuery,
  SaleStockUpSummaryResponse,
  SaleStockUpDetailResponse,
  SaleStockUpDetailQuery,
  SaleAnalysisBarChartDrillQuery,
  SaleAnalysisBarChartDrillResponse,
  SaleInvoiceVsReceiptQuery,
  SaleInvoiceVsReceiptResponse,
  SaleInvoiceVsReceiptMonthlyChartQuery,
  SaleInvoiceVsReceiptMonthlyChartResponse
} from './types'

// 获取销售目标列表
export const getSaleTargetListApi = (params: SaleTargetQuery) => {
  return request.get<SaleTargetResponse>({
    url: '/sale/target/list',
    params
  })
}

// 删除销售目标
export const deleteSaleTargetApi = (id: number) => {
  return request.delete({
    url: `/sale/target/delete/${id}`
  })
}

// 批量删除销售目标
export const deleteSaleTargetBatchApi = (ids: number[]) => {
  return request.delete({
    url: '/sale/target/batch',
    data: ids
  })
}

// 创建销售目标
export const createSaleTargetApi = (data: SaleTargetCreate) => {
  return request.post({
    url: '/sale/target',
    data
  })
}

// 同步导入销售目标
export const importSaleTargetsApi = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<SaleTargetImportResponse>({
    url: '/sale/target/import',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载销售目标模板
export const downloadSaleTargetTemplateApi = () => {
  return request.get({
    url: '/sale/target/template',
    responseType: 'blob'
  })
}

// 启动异步导入任务
export const startImportTaskApi = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<{ taskId: string }>({
    url: '/sale/target/import/async',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 查询导入任务状态
export const getImportTaskStatusApi = (taskId: string) => {
  return request.get<any>({
    url: `/sale/target/import/status/${taskId}`
  })
}

// 查询销售数据详情
export const getSaleDataDetailApi = (params: SaleDataDetailQuery) => {
  return request.get<SaleDataDetailResponse>({
    url: '/sale/data/detail',
    params
  })
}

export const exportSaleDataApi = (params: SaleDataDetailQuery) => {
  return request.get({
    url: '/sale/data/export',
    responseType: 'blob',
    params
  })
}

export const getSaleDataSummaryApi = (params: SaleDataSummaryQuery) => {
  return request.get<SaleDataSummaryResponse>({
    url: '/sale/data/summary',
    params
  })
}

export const exportSaleDataSummaryApi = (params: SaleDataSummaryQuery) => {
  return request.get({
    url: '/sale/data/summary/export',
    responseType: 'blob',
    params
  })
}

// 销售分析Bi看板
export const getSaleAnalysisPannelApi = () => {
  return request.get<SaleAnalysisPannelResponse>({
    url: '/sale/analysis/pannel'
  })
}

export const getSaleAnalysisGaugeApi = () => {
  return request.get<SaleAnalysisGaugeResponse>({
    url: '/sale/analysis/gauge'
  })
}

export const getSaleAnalysisChipClassPieApi = () => {
  return request.get<SaleAnalysisChipClassPieResponse>({
    url: '/sale/analysis/chipClassPie'
  })
}

export const getSaleAnalysisBarChartDrillApi = (params: SaleAnalysisBarChartDrillQuery) => {
  return request.get<SaleAnalysisBarChartDrillResponse>({
    url: '/sale/analysis/barChartDrill',
    params
  })
}

export const getSaleStockUpSummaryApi = (params: SaleStockUpSummaryQuery) => {
  return request.get<SaleStockUpSummaryResponse>({
    url: '/sale/stockUp/summary',
    params
  })
}

export const getSaleStockUpSummaryNoGroupApi = (params: SaleStockUpSummaryQuery) => {
  return request.get<SaleStockUpSummaryResponse>({
    url: '/sale/stockUp/summary/noGroup',
    params
  })
}

export const exportSaleStockUpSummaryApi = (params: SaleStockUpSummaryQuery) => {
  return request.get({
    url: '/sale/stockUp/summary/export',
    responseType: 'blob',
    params
  })
}

export const getSaleStockUpDetailApi = (params: SaleStockUpDetailQuery) => {
  return request.get<SaleStockUpDetailResponse>({
    url: '/sale/stockUp/detail',
    params
  })
}

export const exportSaleStockUpDetailApi = (params: SaleStockUpDetailQuery) => {
  return request.get({
    url: '/sale/stockUp/detail/export',
    responseType: 'blob',
    params
  })
}

export const getSaleInvoiceVsReceiptApi = (params: SaleInvoiceVsReceiptQuery) => {
  return request.get<SaleInvoiceVsReceiptResponse>({
    url: '/sale/invoiceVsReceipt',
    params
  })
}

export const getSaleInvoiceVsReceiptMonthlyChartApi = (
  params: SaleInvoiceVsReceiptMonthlyChartQuery
) => {
  return request.get<SaleInvoiceVsReceiptMonthlyChartResponse>({
    url: '/sale/invoiceVsReceipt/monthlyChart',
    params
  })
}
