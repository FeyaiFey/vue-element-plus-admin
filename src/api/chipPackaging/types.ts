export interface ChipPackagingQuery {
  pageIndex?: number
  pageSize?: number
  docNo?: string
  itemCode?: string
  packageType?: string
  lotNo?: string
  processingFlow?: string
  testingProgram?: string
  drawingNo?: string
  wire?: string
  packagingDateStart?: string
  packagingDateEnd?: string
  supplier?: string
  receiptClose?: string
  bomType?: string
  waferName?: string
  waferLotNo?: string
}

export interface ChipPackagingList {
  id?: number
  docNo?: string
  itemCode?: string
  packageType?: string
  lotNo?: string
  businessQty?: number
  receiptQty?: number
  wipQty?: number
  processingFlow?: string
  testingProgram?: string
  drawingNo?: string
  wire?: string
  remark?: string
  packagingDate?: string
  firstArrivalDate?: string
  supplier?: string
  receiptClose?: string
  bomType?: string
  waferName?: string
  waferLotNo?: string
  waferQty?: number
  waferId?: number
}

export interface ChipPackagingListResponse {
  list: ChipPackagingList[]
  total: number
}

export interface ChipPackagingWipQuery {
  pageIndex?: number
  pageSize?: number
  docNo?: string
  itemCode?: string
  isTr?: string
  leadDays?: number
  isStranded?: string
  isClosed?: string
  supplier?: string
}

export interface ChipPackagingWip {
  docNo?: string
  supplier?: string
  itemCode?: string
  processingFlow?: string
  stranded?: number
  currentProcess?: string
  expectedDeliveryDate?: string
  finishedAt?: string
  onlineTotal?: number
  warehouseInventory?: number
  holdInfo?: string
  nextDayExpected?: number
  threeDayExpected?: number
  sevenDayExpected?: number
  polishing?: number
  cutting?: number
  waitingForInstallation?: number
  installation?: number
  silverGlueCure?: number
  plasmaCleaning1?: number
  bonding?: number
  threePointInspection?: number
  plasmaCleaning2?: number
  sealing?: number
  postCure?: number
  reflowSoldering?: number
  electroplating?: number
  printing?: number
  postCutting?: number
  cuttingAndShaping?: number
  measurementAndPrinting?: number
  appearanceInspection?: number
  packing?: number
  waitingForWarehouseInventory?: number
}

export interface ChipPackagingWipResponse {
  list: ChipPackagingWip[]
  total: number
}

export interface ChipPackagingReceiptQuery {
  pageIndex?: number
  pageSize?: number
  purchaseNo?: string
  itemCode?: string
  packageType?: string
  lotCode?: string
  supplier?: string
  arrivalDateStart?: string
  arrivalDateEnd?: string
}

export interface ChipPackagingReceipt {
  id?: number
  arrivalDate?: string
  arrivalNo?: string
  purchaseNo?: string
  itemCode?: string
  packageType?: string
  lotCode?: string
  priceQty?: number
  price?: number
  amount?: number
  supplier?: string
}

export interface ChipPackagingReceiptResponse {
  list: ChipPackagingReceipt[]
  total: number
}

export interface ChipPackagingRequirementQuery {
  pageIndex?: number
  pageSize?: number
  id?: number
  itemCode?: string
  itemName?: string
  abtr?: string
  requirementType?: string
  emergency?: string
  sales?: string
  createBy?: string
  dateStart?: string
  dateEnd?: string
  isEmailNoticed?: string
}

export interface ChipPackagingRequirement {
  id?: number
  itemCode?: string
  itemName?: string
  abtr?: string
  businessQty?: number
  requirementType?: string
  emergency?: string
  sales?: string
  remark?: string
  chipA?: string
  chipAQty?: number
  chipB?: string
  chipBQty?: number
  status?: string
  packagingOrders?: string
  createBy?: string
  createdAt?: string
  updatedAt?: string
  remarkB?: string
  isEmailNoticed?: string
}

export interface ChipPackagingRequirementResponse {
  list: ChipPackagingRequirement[]
  total: number
}

export interface ChipPackagingRequirementCreate {
  itemCode: string
  itemName: string
  abtr: string
  businessQty: number
  requirementType: string
  emergency: string
  sales: string
  remark?: string
  chipA?: string
  chipAQty?: number
  chipB?: string
  chipBQty?: number
  isEmailNoticed?: string
}

export interface ChipPackagingRequirementCancel {
  id: number
  status: string
  remark?: string
}

export interface ChipPackagingRequirementAddOrders {
  id: number
  packagingOrders: string
  remarkB?: string
}

export interface ChipPackagingAnalysisPannel {
  thisMonthChipPackagingReceipt: number
  lastMonthChipPackagingReceipt: number
  chipPackagingWip: number
  thisSeasonAverageDeliveryDays: number
  thisSeasonAverageGoodRate: number
  thisMonthChipPackagingReceiptCompleteRate: number
  thisMonthChipPackagingReceiptTarget: number
}

export interface ChipPackagingAnalysisPannelResponse {
  list: ChipPackagingAnalysisPannel[]
}

export interface hisemiLoading {
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

export interface hisemiLoadingQuery {
  rangeType: string
}

export interface hisemiLoadingResponse {
  list: hisemiLoading[]
}

export interface chipPackagingYearTrend {
  qty: number
  packageType: string
  year: number
}

export interface chipPackagingYearTrendResponse {
  list: chipPackagingYearTrend[]
}

export interface chipPackagingSupplyAnalysis {
  supplier: string
  dataRowCount: number
  totalOrderQty: number
  packageTypeCount: number
}

export interface chipPackagingSupplyAnalysisResponse {
  list: chipPackagingSupplyAnalysis[]
}
