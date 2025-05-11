export interface SaleTableQuery {
  year?: number
  month?: number
  yearmonth?: string
  pageIndex?: number
  pageSize?: number
}

export interface SaleTable {
  Id: string
  Year: number
  Month: number
  YearMonth: string
  MonthlyTarget: number
  AnnualTarget: number
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
  yearmonth?: string
  monthly_target?: number
  annual_target?: number
}

export interface SaleTargetUpdate {
  id?: string
  year?: number
  month?: number
  yearmonth?: string
  monthly_target?: number
  annual_target?: number
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

export interface SaleAmountAnalyze {
  YEAR?: number
  MONTH?: number
  ADMIN_UNIT_NAME?: string
  EMPLOYEE_NAME?: string
  SHORTCUT?: string
  ITEM_NAME?: string
  PRICE_QTY?: number
  AMOUNT?: number
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
