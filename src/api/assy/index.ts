import request from '@/axios'
import type {
  AssyOrderQuery,
  AssyOrderResponse,
  AssyWipQuery,
  AssyWipItemsQuery,
  AssyWipResponse,
  AssyWipItemsResponse
} from './type'

export const getAssyListApi = (query: AssyOrderQuery) => {
  return request.get<AssyOrderResponse>({
    url: '/assy/table',
    params: query
  })
}

export const getAssyWipApi = (query: AssyWipQuery) => {
  return request.get<AssyWipResponse>({
    url: '/assy/wip',
    params: query
  })
}

export const getAssyWipItemsApi = (query: AssyWipItemsQuery) => {
  return request.get<AssyWipItemsResponse>({
    url: '/assy/wip/items',
    params: query
  })
}
