export interface PurchaseOrderQuery {
  receipt_close?: number
  doc_no?: string
  item_code?: string
  item_name?: string
  supplier?: string
  purchase_date_start?: Date
  purchase_date_end?: Date
  pageIndex?: number
  pageSize?: number
}

export interface PurchaseOrder {
  SUPPLIER_FULL_NAME: string
  DOC_NO: string
  PURCHASE_DATE: Date
  REMARK: string
  ITEM_CODE: string
  ITEM_NAME: string
  SHORTCUT: string
  BUSINESS_QTY: number
  SECOND_QTY: number
  RECEIPTED_BUSINESS_QTY: number
  WIP_QTY: number
  PRICE: number
  AMOUNT: number
  RECEIPT_CLOSE: number
}

export interface PurchaseOrderResponse {
  list: PurchaseOrder[]
  total: number
}

export interface PurchaseWipQuery {
  purchase_order?: string
  item_name?: string
  supplier?: string
  status?: string
  is_finished?: number
  is_stranded?: number
  days?: number
  pageIndex?: number
  pageSize?: number
}

export interface PurchaseWip {
  purchaseOrder: string
  itemName: string
  lot: string
  qty: number
  status: string
  stage: string
  layerCount: number
  remainLayerCount: number
  currentPosition: number
  forecastDate: string
  supplier: string
  finished_at: Date
  stranded: number
  leadTime: number
}

export interface PurchaseWipResponse {
  list: PurchaseWip[]
  total: number
}

export interface PurchaseWipSupplierResponse {
  label: string
  value: number
}

export interface PurchaseSupplierResponse {
  label: string
  value: number
}
