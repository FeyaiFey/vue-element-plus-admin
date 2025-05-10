export interface FeatureGroupNameQuery {
  feature_group_name: string
}

export interface FeatureGroupName {
  label: string
  value: string
}

export interface FeatureGroupNameResponse {
  list: FeatureGroupName[]
}

export interface ItemCodeQuery {
  item_code: string
}

export interface ItemCode {
  label: string
  value: string
}

export interface ItemCodeResponse {
  list: ItemCode[]
}

export interface ItemNameQuery {
  item_name: string
}

export interface ItemName {
  label: string
  value: string
}

export interface ItemNameResponse {
  list: ItemName[]
}

export interface LotCodeQuery {
  lot_code: string
}

export interface LotCode {
  label: string
  value: string
}

export interface LotCodeResponse {
  list: LotCode[]
}

export interface WarehouseNameQuery {
  warehouse_name: string
}

export interface WarehouseName {
  label: string
  value: string
}

export interface WarehouseNameResponse {
  list: WarehouseName[]
}

export interface TestingProgramQuery {
  testing_program: string
}

export interface TestingProgram {
  label: string
  value: string
}

export interface TestingProgramResponse {
  list: TestingProgram[]
}

export interface BurningProgramQuery {
  burning_program: string
}

export interface BurningProgram {
  label: string
  value: string
}

export interface BurningProgramResponse {
  list: BurningProgram[]
}

export interface BurningProgramQuery {
  burning_program: string
}

export interface BurningProgram {
  label: string
  value: string
}

export interface BurningProgramResponse {
  list: BurningProgram[]
}

export interface ItemWaferInfoQuery {
  item_name: string
}

export interface ItemWaferInfoResponse {
  CHIP_NAME: string
  MAIN_CHIP: string
  MAIN_CHIP_GROSS_DIE: number
  DEPUTY_CHIP: string
  DEPUTY_CHIP_GROSS_DIE: number
}

export interface SalesResponse {
  label: string
  value: string
}

export interface SaleUnitResponse {
  label: string
  value: string
}
