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
