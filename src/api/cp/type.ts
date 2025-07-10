export interface CpTestQuery {
  pageIndex?: number
  pageSize?: number
  docNo?: string
  itemCode?: string
  itemName?: string
  lotName?: string
  progressName?: string
  programName?: string
  docDateStart?: string
  docDateEnd?: string
  supplier?: string
  status?: string
}

export interface CpTestOrders {
  id?: number
  docNo?: string
  itemCode?: string
  itemName?: string
  lotName?: string
  businessQty?: number
  receiptQty?: number
  wipQty?: number
  progressName?: string
  programName?: string
  remark?: string
  docDate?: string
  firstArrivalDate?: string
  supplier?: string
  status?: string
}

export interface CpTestOrdersResponse {
  list: CpTestOrders[]
  total: number
}

export interface CpReceiptQuery {
  pageIndex?: number
  pageSize?: number
  purchaseNo?: string
  itemCode?: string
  lotCode?: string
  progressName?: string
  programName?: string
  arrivalDateStart?: string
  arrivalDateEnd?: string
  supplier?: string
}

export interface CpReceipt {
  id?: number
  arrivalDate?: string
  arrivalNo?: string
  purchaseNo?: string
  itemCode?: string
  lotCode?: string
  progressName?: string
  programName?: string
  receiptQty?: number
  price?: number
  amount?: number
  supplier?: string
}

export interface CpReceiptResponse {
  list: CpReceipt[]
  total: number
}
