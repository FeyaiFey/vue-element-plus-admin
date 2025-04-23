export interface AssyOrderQuery {
  doc_no?: string // 封装订单号
  item_code?: string // 品号
  lot_code?: string // 批号
  supplier?: string // 供应商
  package_type?: string // 封装类型
  assembly_code?: string // 打线图号
  is_closed?: number // 是否关闭
  order_date_start?: Date // 工单日期开始
  order_date_end?: Date // 工单日期结束
  pageIndex?: number // 页码,默认1,最小1
  pageSize?: number // 每页数量,默认50,1-100
}

export interface AssyOrder {
  ID?: number
  DOC_NO?: string
  ITEM_CODE?: string
  Z_PACKAGE_TYPE_NAME?: string
  LOT_CODE?: string
  BUSINESS_QTY?: number
  RECEIPTED_PRICE_QTY?: number
  WIP_QTY?: number
  Z_PROCESSING_PURPOSE_NAME?: string
  Z_TESTING_PROGRAM_NAME?: string
  Z_ASSEMBLY_CODE?: string
  Z_WIRE_NAME?: string
  REMARK?: string
  PURCHASE_DATE?: Date
  FIRST_ARRIVAL_DATE?: Date
  SUPPLIER_FULL_NAME?: string
  RECEIPT_CLOSE?: number
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
  is_tr?: number | string | undefined
  is_stranded?: number | string | undefined
  days?: number | undefined
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
  EXPECTED_DELIVERY_DATE: string
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

export interface AssyBomQuery {
  doc_no: string
}

export interface AssyBom {
  MAIN_CHIP: string
  ITEM_CODE: string
  ITEM_NAME: string
  LOT_CODE_NAME: string
  BUSINESS_QTY: number
  SECOND_QTY: number
  WAFER_ID: string
}

export interface AssyBomResponse {
  list: AssyBom[]
}

export interface AssyOrderItemsQuery {
  item_code: string
}

export interface AssyOrderItems {
  label: string
  value: string
}

export interface AssyOrderItemsResponse {
  list: AssyOrderItems[]
}

export interface AssyOrderPackageTypeQuery {
  package_type: string
}

export interface AssyOrderPackageType {
  label: string
  value: string
}

export interface AssyOrderPackageTypeResponse {
  list: AssyOrderPackageType[]
}

export interface AssyOrderSupplierQuery {
  supplier: string
}

export interface AssyOrderSupplier {
  label: string
  value: string
}

export interface AssyOrderSupplierResponse {
  list: AssyOrderSupplier[]
}

export interface AxiosResponse {
  data: any
  headers: any
}

export interface AssyAnalyzeTotalResponse {
  receipt: number
  wip: number
  leadTime: number
  yields: number
  exceed: number
  this_month_receipt: number
}

export interface AssyAnalyzeLoadingQuery {
  range_type: string
}

export interface AssyAnalyzeLoadingResponse {
  Date: string
  SOP8_12R: number
  SOP8: number
  DFN8: number
  SOP16_12R: number
  SOP16: number
  SOP14_12R: number
  SOP14: number
  TSSOP20: number
  SOT26: number
  SOT25_20R: number
  SOT25_14R: number
  SSOP24: number
  ESSOP10: number
  QFN20: number
  LQFP32: number
}

export interface AssyYearTrendResponse {
  qty: number
  packageType: string
  year: number
}

export interface AssySupplyAnalyzeResponse {
  Supplier: string
  DataRowCount: number
  TotalOrderQty: number
  PackageTypeCount: number
}

// 封装单提交参数类型
export interface AssySubmitOrderItem {
  itemName: string
  itemCode: string
  abtr: string
  businessQty: number // 以"只"为单位的数量
  requirementType: string // 需求类型
  emergency: string // 紧急程度
  sales: string // 销售员
  remark: string
  mainChip?: string
  deputyChip?: string
  mainChipUsage?: number
  deputyChipUsage?: number
}

// 批量提交封装单请求参数
export interface AssySubmitOrdersRequest {
  orders: AssySubmitOrderItem[]
}

export interface CpTestOrdersQuery {
  item_code?: string
  item_name?: string
  lot_name?: string
  status?: number
  doc_date_start?: string
  doc_date_end?: string
  supplier?: string
  progress_name?: string
  testing_program_name?: string
  pageIndex?: number
  pageSize?: number
}

export interface CpTestOrders {
  ID: number
  DOC_NO: string
  ITEM_CODE: string
  ITEM_NAME: string
  LOT_NAME: string
  BUSINESS_QTY: number
  RECEIPT_QTY: number
  WIP_QTY: number
  PROGRESS_NAME: string
  TESTING_PROGRAM_NAME: string
  REMARK: string
  DOC_DATE: string
  FIRST_ARRIVAL_DATE: string
  SUPPLIER: string
  STATUS: string
}

export interface CpTestOrdersResponse {
  list: CpTestOrders[]
  total: number
}
