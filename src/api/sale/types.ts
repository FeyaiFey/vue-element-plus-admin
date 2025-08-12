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

export interface SaleDataDetailQuery {
  pageIndex?: number
  pageSize?: number
  beginDate?: string
  endDate?: string
  departmentName?: string
  employeeName?: string
  itemCode?: string
  shortcut?: string
  packagingType?: string
}

export interface SaleDataDetail {
  row?: number
  date?: string
  departmentName?: string
  employeeName?: string
  itemCode?: string
  shortcut?: string
  packagingType?: string
  qty?: number
  amount?: number
}

export interface SaleDataDetailResponse {
  list: SaleDataDetail[]
  total: number
}

export interface SaleDataSummaryQuery {
  beginDate?: string
  endDate?: string
  departmentName?: string
  employeeName?: string
}

export interface SaleDataSummary {
  departmentName?: string
  employeeName?: string
  qtySum?: number
  targetSum?: number
  amountSum?: number
  completeRate?: number
}

export interface SaleDataSummaryResponse {
  list: SaleDataSummary[]
  beginDate: string
  endDate: string
}

export interface SaleAnalysisPannel {
  today_sale_amount: number
  yesterday_sale_amount: number
  this_year_sale_qty: number
  this_year_sale_amount: number
  this_month_sale_qty: number
  this_month_sale_amount: number
  last_year_sale_qty: number
  last_year_sale_amount: number
  last_month_sale_qty: number
  last_month_sale_amount: number
  last_last_month_sale_qty: number
  last_last_month_sale_amount: number
  month_on_month_qty: number
  month_on_month_amount: number
  year_on_year_qty: number
  year_on_year_amount: number
}

export interface SaleAnalysisPannelResponse {
  list: SaleAnalysisPannel
}

export interface SaleAnalysisGauge {
  this_month_sale_target: number
  this_year_sale_target: number
}

export interface SaleAnalysisGaugeType {
  this_month_sale_amount: number
  this_month_sale_target: number
  last_year_sale_amount: number
  this_year_sale_target: number
}

export interface SaleAnalysisGaugeResponse {
  list: SaleAnalysisGauge
}

export interface SaleAnalysisChipClassPie {
  className: string
  amount: number
}

export interface SaleAnalysisChipClassPieResponse {
  list: SaleAnalysisChipClassPie[]
}

// 销售分析柱状图下钻查询参数
export interface SaleAnalysisBarChartDrillQuery {
  year?: number
  month?: number
}

// 销售分析柱状图下钻数据项
export interface SaleAnalysisBarChartDrillData {
  name: string
  saleQtyValue?: number
  saleAmountValue?: number
  completeRateValue?: number
  groupId: string
  childrenGroupId?: string
}

// 销售分析柱状图下钻元数据
export interface SaleAnalysisBarChartDrillMetadata {
  groupId: string
  childrenGroupId?: string
  title?: string
  xAxisName?: string
  yAxisName?: string
  xAxisUnit?: string
  yAxisUnit?: string
}

// 销售分析柱状图下钻响应
export interface SaleAnalysisBarChartDrillResponse {
  data: SaleAnalysisBarChartDrillData[][]
  metadata: SaleAnalysisBarChartDrillMetadata[]
}

export interface SaleStockUpSummaryQuery {
  year?: number
  month?: number
}

export interface SaleStockUpSummary {
  year?: number | string
  month?: number | string
  departmentName?: string
  employeeName?: string
  forecastQty?: number
  actualQty?: number
  completeRate?: number
}

export interface SaleStockUpSummaryResponse {
  list: SaleStockUpSummary[]
}

export interface SaleStockUpDetailQuery {
  year?: number
  month?: number
  employeeName?: string
}

export interface SaleStockUpDetail {
  employeeName?: string
  itemName?: string
  forecastQty?: number
  actualQty?: number
  completeRate?: number
}

export interface SaleStockUpDetailResponse {
  list: SaleStockUpDetail[]
}

export interface SaleInvoiceVsReceiptQuery {
  year: number
  month?: number
}

export interface SaleInvoiceVsReceipt {
  departmentName?: string
  employeeName?: string
  amountInvoice?: number
  amountCollection?: number
  completeRate?: number
}

export interface SaleInvoiceVsReceiptResponse {
  list: SaleInvoiceVsReceipt[]
}

// 月度开票 VS 回款图表相关类型定义

export interface SaleInvoiceVsReceiptMonthlyChartQuery {
  year: number // 年份
}

export interface SaleInvoiceVsReceiptMonthlyChart {
  month: number // 月份
  amountInvoice?: number // 开票金额
  amountCollection?: number // 回款金额
}

export interface SaleInvoiceVsReceiptMonthlyChartResponse {
  list: SaleInvoiceVsReceiptMonthlyChart[] // 开票VS回款月度图表
}
