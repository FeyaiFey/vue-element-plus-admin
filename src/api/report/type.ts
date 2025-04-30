export type GlobalReport = {
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

export interface AxiosResponse {
  data: any
  headers: any
}

export interface SopAnalyzeResponse {
  ID?: number
  ITEM_NAME?: string
  ABTR?: string
  SAFE_STOCK?: number
  LAST_MONTH_SALE?: number
  CP_QTY?: number
  BC_QTY?: number
  WIP_QTY_WITHOUT_STOCK?: number
  ASSY_STOCK?: number
  TOTAL_STOCK?: number
  INVENTORY_GAP?: number
  INVENTORY_GAP_TOTAL?: number
}

export interface ChipInfoTraceQuery {
  CHIP_LOT_CODE?: string
  WAFER_LOT_CODE?: string
  SUPPLIER?: string
  CHIP_NAME?: string
  WAFER_NAME?: string
  TESTING_PROGRAM_NAME?: string
  pageIndex?: number
  pageSize?: number
}

export interface ChipInfoTrace {
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
  PURCHASE_DATE?: string
  FIRST_ARRIVAL_DATE?: string
  SUPPLIER_FULL_NAME?: string
  MAIN_CHIP?: string
  CHIP_CODE?: string
  LOT_CODE_NAME?: string
  WAFER_QTY?: number
  S_QTY?: number
  WAFER_ID?: string
  PROGRESS_NAME?: string
  TESTING_PROGRAM_NAME?: string
  SUPPLIER?: string
}

export interface ChipInfoTraceResponse {
  list: ChipInfoTrace[]
  total: number
}
