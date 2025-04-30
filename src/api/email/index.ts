import request from '@/axios'
import type {
  EmailSendRequest,
  EmailSendResponse,
  EmailTemplate,
  EmailTemplateCreate,
  EmailTemplateUpdate
} from './type'

/**
 * 发送邮件
 * @param data 邮件数据
 * @returns 发送结果
 */
export const sendEmailApi = (data: EmailSendRequest) => {
  return request.post<EmailSendResponse>({
    url: '/email/send',
    data
  })
}

export const emailAssyRequireOrderApi = (data: EmailSendRequest) => {
  return request.post<IResponse>({
    url: '/email/orders',
    data
  })
}

/**
 * 创建邮件模板
 * @param data 模板数据
 * @returns 创建的模板
 */
export const createEmailTemplateApi = (data: EmailTemplateCreate) => {
  return request.post<EmailTemplate>({
    url: '/email/templates',
    data
  })
}

/**
 * 获取邮件模板列表
 * @returns 模板列表
 */
export const listEmailTemplatesApi = () => {
  return request.get<EmailTemplate[]>({
    url: '/email/templates'
  })
}

/**
 * 获取单个邮件模板
 * @param templateId 模板ID
 * @returns 模板详情
 */
export const getEmailTemplateApi = (templateId: number) => {
  return request.get<EmailTemplate>({
    url: `/email/templates/${templateId}`
  })
}

/**
 * 更新邮件模板
 * @param templateId 模板ID
 * @param data 更新数据
 * @returns 更新后的模板
 */
export const updateEmailTemplateApi = (templateId: number, data: EmailTemplateUpdate) => {
  return request.put<EmailTemplate>({
    url: `/email/templates/${templateId}`,
    data
  })
}

/**
 * 删除邮件模板
 * @param templateId 模板ID
 * @returns 删除结果
 */
export const deleteEmailTemplateApi = (templateId: number) => {
  return request.delete<IResponse>({
    url: `/email/templates/${templateId}`
  })
}
