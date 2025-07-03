import request from '@/axios'
import {
  ChipPackagingQuery,
  ChipPackagingListResponse,
  ChipPackagingWipQuery,
  ChipPackagingWipResponse,
  ChipPackagingReceiptQuery,
  ChipPackagingReceiptResponse,
  ChipPackagingRequirementResponse,
  ChipPackagingRequirementQuery,
  ChipPackagingRequirementCreate,
  ChipPackagingRequirementCancel,
  ChipPackagingRequirementAddOrders
} from './types'

export const getChipPackagingListApi = (data: ChipPackagingQuery) => {
  return request.get<ChipPackagingListResponse>({
    url: '/chipPackaging/list',
    params: data
  })
}

export const exportChipPackagingListApi = (data: ChipPackagingQuery) => {
  return request.get<any>({
    url: '/chipPackaging/list/export',
    responseType: 'blob',
    params: data
  })
}

export const getChipPackagingWipListApi = (data: ChipPackagingWipQuery) => {
  return request.get<ChipPackagingWipResponse>({
    url: '/chipPackaging/wip/list',
    params: data
  })
}

export const getChipPackagingReceiptListApi = (data: ChipPackagingReceiptQuery) => {
  return request.get<ChipPackagingReceiptResponse>({
    url: '/chipPackaging/receipt/list',
    params: data
  })
}

export const exportChipPackagingReceiptListApi = (data: ChipPackagingReceiptQuery) => {
  return request.get<any>({
    url: '/chipPackaging/receipt/export',
    responseType: 'blob',
    params: data
  })
}

export const getChipPackagingRequirementListApi = (data: ChipPackagingRequirementQuery) => {
  return request.get<ChipPackagingRequirementResponse>({
    url: '/chipPackaging/requirement/list',
    params: data
  })
}

export const createChipPackagingRequirementApi = (data: ChipPackagingRequirementCreate) => {
  return request.post<any>({
    url: '/chipPackaging/requirement/create',
    data
  })
}

export const exportChipPackagingRequirementListApi = (data: ChipPackagingRequirementQuery) => {
  return request.get<any>({
    url: '/chipPackaging/requirement/export',
    responseType: 'blob',
    params: data
  })
}

export const cancelChipPackagingRequirementApi = (data: ChipPackagingRequirementCancel) => {
  return request.post<any>({
    url: '/chipPackaging/requirement/cancel',
    data
  })
}

export const addOrdersChipPackagingRequirementApi = (data: ChipPackagingRequirementAddOrders) => {
  return request.post<any>({
    url: '/chipPackaging/requirement/addOrders',
    data
  })
}
