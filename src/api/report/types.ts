export interface StockReportQuery {
  itemCode?: string
  itemName?: string
  lotCode?: string
  burningProgram?: string
  testingProgram?: string
  featureGroupName?: string
  warehouse?: string
}

export interface StockReport {
  rowId?: number
  itemCode?: string
  itemName?: string
  lotCode?: string
  qty?: number
  secondQty?: number
  burningProgram?: string
  testingProgram?: string
  binLevel?: string
  featureGroupName?: string
  warehouse?: string
}

export interface StockReportResponse {
  list: StockReport[]
  total: number
}

export interface StockSummary {
  rowId?: number
  itemCode?: string
  qtySum?: number
  secondQtySum?: number
  warehouse?: string
}

export interface StockSummaryResponse {
  list: StockSummary[]
}
