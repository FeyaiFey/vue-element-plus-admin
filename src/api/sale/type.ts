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
