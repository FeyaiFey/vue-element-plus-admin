import request from '@/axios'
import { CpTestQuery, CpTestOrdersResponse, CpReceiptQuery, CpReceiptResponse } from './type'

export const getCpTestListApi = (data: CpTestQuery) => {
  return request.get<CpTestOrdersResponse>({
    url: '/cp/list',
    params: data
  })
}

export const exportCpTestListApi = (data: CpTestQuery) => {
  return request.get<any>({
    url: '/cp/list/export',
    responseType: 'blob',
    params: data
  })
}

export const getCpReceiptListApi = (data: CpReceiptQuery) => {
  return request.get<CpReceiptResponse>({
    url: '/cp/receipt/list',
    params: data
  })
}

export const exportCpReceiptListApi = (data: CpReceiptQuery) => {
  return request.get<any>({
    url: '/cp/receipt/list/export',
    responseType: 'blob',
    params: data
  })
}
