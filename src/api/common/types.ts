export interface employeesQuery {
  employeeName?: string
  departmentName?: string
}

export interface employees {
  label?: string
  value?: string
}

export interface employeesResponse {
  list: employees[]
}

export interface chipBomQuery {
  itemName?: string
}

export interface waferInfo {
  chipName?: string
  waferA?: string
  waferAQty?: number
  waferB?: string
  waferBQty?: number
}

export interface waferInfoResponse {
  list: waferInfo[]
}
