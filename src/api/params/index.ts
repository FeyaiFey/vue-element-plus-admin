import request from '@/axios'
import type {
  FeatureGroupNameQuery,
  FeatureGroupNameResponse,
  ItemCodeQuery,
  ItemCodeResponse,
  ItemNameQuery,
  ItemNameResponse,
  LotCodeQuery,
  LotCodeResponse,
  WarehouseNameQuery,
  WarehouseNameResponse,
  TestingProgramQuery,
  TestingProgramResponse,
  BurningProgramQuery,
  BurningProgramResponse,
  ItemWaferInfoQuery,
  ItemWaferInfoResponse,
  SalesResponse
} from './type'

export const getFeatureGroupNameApi = (query: FeatureGroupNameQuery) => {
  return request.get<FeatureGroupNameResponse>({
    url: '/params/feature_group_name',
    params: query
  })
}

export const getItemCodeApi = (query: ItemCodeQuery) => {
  return request.get<ItemCodeResponse>({
    url: '/params/item_code',
    params: query
  })
}

export const getItemNameApi = (query: ItemNameQuery) => {
  return request.get<ItemNameResponse>({
    url: '/params/item_name',
    params: query
  })
}

export const getLotCodeApi = (query: LotCodeQuery) => {
  return request.get<LotCodeResponse>({
    url: '/params/lot_code',
    params: query
  })
}

export const getWarehouseNameApi = (query: WarehouseNameQuery) => {
  return request.get<WarehouseNameResponse>({
    url: '/params/warehouse_name',
    params: query
  })
}

export const getTestingProgramApi = (query: TestingProgramQuery) => {
  return request.get<TestingProgramResponse>({
    url: '/params/testing_program',
    params: query
  })
}

export const getBurningProgramApi = (query: BurningProgramQuery) => {
  return request.get<BurningProgramResponse>({
    url: '/params/burning_program',
    params: query
  })
}

export const getWaferInfoApi = (query: ItemWaferInfoQuery) => {
  return request.get<ItemWaferInfoResponse>({
    url: '/params/requirement/wafer-info',
    params: query
  })
}

export const getSalesApi = () => {
  return request.get<SalesResponse>({
    url: '/params/requirement/sales'
  })
}
