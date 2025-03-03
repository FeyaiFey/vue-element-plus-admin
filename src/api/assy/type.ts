export interface AssyOrderQuery {
  doc_no?: string
  item_code?: string[]
  item_name?: string[]
  supplier?: string[]
  package_type?: string[]
  is_closed?: number
  order_date_start?: Date
  order_date_end?: Date
  pageIndex?: number
  pageSize?: number
}

export interface AssyOrder {
  DOC_NO: string
  ITEM_CODE: string
  Z_PROCESSING_PURPOSE_NAME: string
  Z_ASSEMBLY_CODE: string
  LOT_CODE: string
  BUSINESS_QTY: number
  RECEIPTED_PRICE_QTY: number
  WIP_QTY: number
  PRICE: number
  Z_PACKAGE_TYPE_NAME: string
  REMARK: string
  Z_LOADING_METHOD_NAME: string
  Z_WIRE_NAME: string
  Z_FEATURE_GROUP_NAME: string
  CLOSE: number
  PURCHASE_DATE: Date
  SUPPLIER_FULL_NAME: string
}

export interface AssyOrderResponse {
  list: AssyWip[]
  total: number
}

export interface AssyWipQuery {
  doc_no?: string
  item_code?: string
  supplier?: string
  current_process?: string
  is_finished?: number
  is_stranded?: number
  days?: number
  pageIndex?: number
  pageSize?: number
}

export interface AssyWip {
  DOC_NO: string
  SUPPLIER_FULL_NAME: string
  ITEM_CODE: string
  Z_PROCESSING_PURPOSE_NAME: string
  STRANDED: number
  CURRENT_PROCESS: string
  EXPECTED_DELIVERY_DATE: Date
  FINISHED_AT: Date
  ONLINE_TOTAL: number
  WAREHOUSE_INVENTORY: number
  HOLD_INFO: string
  NEXT_DAY_EXPECTED: number
  THREE_DAY_EXPECTED: number
  SEVEN_DAY_EXPECTED: number
  POLISHING: number
  CUTTING: number
  WAITING_FOR_INSTALLATION: number
  INSTALLATION: number
  SILVER_GLUE_CURE: number
  PLASMA_CLEANING_1: number
  BONDING: number
  THREE_POINT_INSPECTION: number
  PLASMA_CLEANING_2: number
  SEALING: number
  POST_CURE: number
  REFLOW_SOLDERING: number
  ELECTROPLATING: number
  PRINTING: number
  POST_CUTTING: number
  CUTTING_AND_SHAPING: number
  MEASUREMENT_AND_PRINTING: number
  APPEARANCE_INSPECTION: number
  PACKING: number
  WAITING_FOR_WAREHOUSE_INVENTORY: number
}

export interface AssyWipResponse {
  list: AssyWip[]
  total: number
}

export interface AssyWipItemsQuery {
  item_code: string
}

export interface AssyWipItems {
  label: string
  value: string
}

export interface AssyWipItemsResponse {
  list: AssyWipItems[]
}
