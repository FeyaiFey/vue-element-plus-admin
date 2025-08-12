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

export interface SopData {
  row?: number
  itemName?: string
  abtr?: string
  safeStock?: number
  lastMonthSaleQty?: number
  cpQty?: number
  bcQty?: number
  wipQtyWithoutStock?: number
  packagingQty?: number
  totalStock?: number
  inventoryGap?: number
  inventoryGapTotal?: number
}

export interface SopDataResponse {
  list: SopData[]
}

export interface GlobalReport {
  ROW: number
  RN: number
  MAIN_CHIP_COUNT: number
  MAIN_CHIP: string
  CHIP_NAME: string
  TOTAL_FINISHED_GOODS: number
  TOP_FINISHED_GOODS: number
  BACK_FINISHED_GOODS: number
  TOTAL_SEMI_MANUFACTURED: number
  TOP_SEMI_MANUFACTURED: number
  BACK_SEMI_MANUFACTURED: number
  PACKAGE_WIP_QTY: number
  PACKAGE_TOP_WIP_QTY: number
  PACKAGE_BACK_WIP_QTY: number
  SG_QTY: number
  SG_FINISHED_GOODS: number
  SG_SEMI_MANUFACTURED: number
  SECONDARY_OUTSOURCING_WIP_QTY: number
  PURCHASE_WIP_QTY: number
  TOTAL_RAW_MATERIALS: number
  CP_WIP_QTY: number
  NO_TESTED_WAFER: number
  TESTED_WAFER: number
  DEPUTY_CHIP: string
  OUTSOURCING_WIP_QTY: number
  TOTAL_B_RAW_MATERIALS: number
}

export interface GlobalReportResponse {
  list: GlobalReport[]
}

// 旧版本库存查询
export interface StockQuery {
  feature_group_name?: string
  item_code?: string
  item_name?: string
  lot_code?: string
  warehouse_name?: string
  pageIndex?: number
  pageSize?: number
}

export interface Stock {
  FEATURE_GROUP_NAME: string
  ITEM_CODE: string
  ITEM_NAME: string
  LOT_CODE: string
  WAREHOUSE_NAME: string
  INVENTORY_QTY: number
  SECOND_QTY: number
  Z_BIN_LEVEL_NAME: string
  Z_TESTING_PROGRAM_NAME: string
  Z_BURNING_PROGRAM_NAME: string
}

export interface StockResponse {
  list: Stock[]
  total: number
}

export interface WaferIdQtyDetailQuery {
  item_code: string
  lot_code: string
}

export interface WaferIdQtyDetail {
  ITEM_CODE: string
  LOT_CODE: string
  WF_ID: number
  INVENTORY_QTY: number
  SECOND_QTY: number
  Z_BIN_LEVEL_NAME: string
  Z_TESTING_PROGRAM_NAME: string
  WAREHOUSE_NAME: string
}

export interface WaferIdQtyDetailResponse {
  list: WaferIdQtyDetail[]
}
