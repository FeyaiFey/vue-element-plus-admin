import request from '@/axios'
import type { EmailConfigBase, EmailPasswordUpdateRequest } from './types'

export const getUserEmailInfoApi = (userId: string) => {
  return request.get<EmailConfigBase>({
    url: `/email/${userId}/config`
  })
}

export const updateUserEmailPasswordApi = (userId: string, data: EmailPasswordUpdateRequest) => {
  return request.put<EmailConfigBase>({
    url: `/email/${userId}/password`,
    data
  })
}
