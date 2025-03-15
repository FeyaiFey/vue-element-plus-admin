export interface StockQuery {
  feature_group_name?: string[]
  item_code?: string[]
  item_name?: string[]
  warehouse_name?: string[]
  testing_program?: string[]
  burning_program?: string[]
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

export interface StockSummaryQuery {
  feature_group_name?: string
  item_name?: string
  warehouse_name?: string
}

export interface StockSummary {
  FEATURE_GROUP_NAME: string
  ITEM_NAME: string
  WAREHOUSE_NAME: string
  INVENTORY_QTY: number
  AVERAGE_STOCK_AGE: number
}

export interface StockSummaryResponse {
  list: StockSummary[]
}
