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
