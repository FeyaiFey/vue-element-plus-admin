export interface StockItem {
  ITEM_BUSINESS_ID: string
  SHORTCUT: string
  FEATURE_GROUP_NAME: string
  ITEM_LOT_ID: string
  ITEM_CODE: string
  ITEM_NAME: string
  LOT_CODE: string
  BIN_LEVEL: string
  Z_TESTING_PROGRAM_NAME: string
  Z_BURNING_PROGRAM_CODE: string
  INVENTORY_QTY: number
  SECOND_QTY: number
  WAREHOUSE_NAME: string
  STOCK_AGE: number
}

export interface StockQueryParams {
  itemCodes?: string
  itemNames?: string
  warehouses?: string
  featureGroups?: string
  lotCodes?: string
  shortcuts?: string
  showZeroStock?: boolean
}

export interface SelectOption {
  label: string
  value: string | number
}

export interface OptionsResponse {
  data: SelectOption[]
}

export interface StockResponse {
  code: number
  message: string
  data: StockItem[]
}
