export interface SaleTableQuery {
  year?: number
  month?: number
  admin_unit_name?: string
  employee_name?: string
  pageIndex?: number
  pageSize?: number
}

export interface SaleTable {
  Id: string
  Year: number
  Month: number
  AdminUnitName: string
  EmployeeName: string
  MonthlyTarget: number
  CreatedBy: string
  CreatedAt: string
  UpdatedAt: string
}

export interface SaleTableResponse {
  list: SaleTable[]
  total: number
}

export interface SaleTargetCreate {
  year?: number
  month?: number
  admin_unit_name?: string
  employee_name?: string
  monthly_target?: number
}

export interface SaleTargetUpdate {
  id?: string
  year?: number
  month?: number
  admin_unit_name?: string
  employee_name?: string
  monthly_target?: number
}

export interface SaleTargetSummaryQuery {
  year?: number
  month?: number
}

export interface SaleTargetSummary {
  YEAR: number
  MONTH: number
  ADMIN_UNIT_NAME: string
  EMPLOYEE_NAME: string
  FORECAST_QTY: number
  PRICE_QTY: number
  PERCENTAGE: number
}

export interface SaleTargetSummaryResponse {
  list: SaleTargetSummary[]
}

export interface SaleTargetDetailQuery {
  year?: number
  month?: number
  employee_name?: string
}

export interface SaleTargetDetail {
  YEAR: number
  MONTH: number
  ADMIN_UNIT_NAME: string
  EMPLOYEE_NAME: string
  SHORTCUT: string
  ITEM_NAME: string
  FORECAST_QTY: number
  PRICE_QTY: number
  PERCENTAGE: number
}

export interface SaleTargetDetailResponse {
  list: SaleTargetDetail[]
}

export interface SaleAmountAnalyzeQuery {
  year?: number
  month?: number
  shortcut?: string
  admin_unit_name?: string
  employee_name?: string
  item_name?: string
  group_by_year: boolean
  group_by_month: boolean
  group_by_shortcut: boolean
  group_by_admin_unit_name: boolean
  group_by_employee_name: boolean
  group_by_item_name: boolean
}

/**
 * 销售数据分析项
 */
export interface SaleAmountAnalyze {
  YEAR?: number
  MONTH?: number
  SHORTCUT?: string
  ITEM_NAME?: string
  EMPLOYEE_NAME?: string
  ADMIN_UNIT_NAME?: string
  PRICE_QTY?: number
  AMOUNT?: number
  FORECAST_AMOUNT?: number
  PERCENTAGE?: number
  [key: string]: any
}

export interface SaleAmountAnalyzeResponse {
  list: SaleAmountAnalyze[]
}

export interface SaleAnalysisPannel {
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
  list: SaleAnalysisPannel[]
}

export interface SaleForecastResponse {
  YearForecast: number
  MonthForecast: number
}

/**
 * 销售数据查询参数
 */
export interface SaleAmountQuery {
  year?: number
  month?: number
  admin_unit_name?: string
  employee_name?: string
  group_by_year: boolean
  group_by_month: boolean
  group_by_admin_unit_name: boolean
  group_by_employee_name: boolean
}

export interface SaleAmount {
  YEAR?: any
  MONTH?: any
  ADMIN_UNIT_NAME?: string
  EMPLOYEE_NAME?: string
  PRICE_QTY?: number
  FORECAST_AMOUNT?: number
  PRICE_AMOUNT?: number
  PERCENTAGE?: number
}

export interface SaleAmountResponse {
  list: SaleAmount[]
}

export interface SaleAmountBarChartQuery {
  year?: string
  month?: string
}

export interface SaleAmountBarChartEChartsDataItem {
  name: string
  value: number
  group_id: string
  child_group_id?: string
}

export interface SaleAmountBarChartEChartsLevelData {
  level_id: string
  items: SaleAmountBarChartEChartsDataItem[]
}

export interface SaleAmountBarChartEChartsResponse {
  list: SaleAmountBarChartEChartsLevelData[]
}
