export interface WaferPurchaseQuery {
  pageIndex?: number
  pageSize?: number
  docNo?: string
  remark?: string
  itemCode?: string
  itemName?: string
  shortcut?: string
  supplier?: string
  receiptClose?: string
  startDate?: string
  endDate?: string
}

export interface WaferPurchaseList {
  docNo: string
  remark: string
  itemCode: string
  itemName: string
  shortcut: string
  businessQty: number
  receiptQty: number
  wipQty: number
  price: number
  amount: number
  receiptClose: string
  purchaseDate: string
  supplier: string
}

export interface WaferPurchaseResponse {
  list: WaferPurchaseList[]
  total: number
}

export interface WaferPurchaseWipQuery {
  pageIndex?: number
  pageSize?: number
  docNo?: string
  itemName?: string
  status?: string
  leadTime?: number
  supplier?: string
  isFinished?: string
}

export interface WaferPurchaseWip {
  docNo?: string
  itemName?: string
  lot?: string
  qty?: number
  status?: string
  stage?: string
  layerCount?: number
  remainLayerCount?: number
  currentPosition?: number
  forecastDate?: string
  supplier?: string
  finishedAt?: string
  stranded?: number
}

export interface WaferPurchaseWipResponse {
  list: WaferPurchaseWip[]
  total: number
}
