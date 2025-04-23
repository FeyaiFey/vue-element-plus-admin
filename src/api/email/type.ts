export interface EmailAttachment {
  filename: string
  content: string
  content_type: string
}

/**
 * 邮件发送请求类型
 */
export interface EmailSendRequest {
  /**
   * 收件人列表
   */
  to: string[]

  /**
   * 抄送人列表
   */
  cc?: string[]

  /**
   * 密送人列表
   */
  bcc?: string[]

  /**
   * 邮件主题
   */
  subject?: string

  /**
   * 邮件内容
   */
  content?: string

  /**
   * 模板ID
   */
  template_id?: number

  /**
   * 模板变量
   */
  template_vars?: Record<string, any>

  /**
   * 是否使用模板主题
   */
  use_template_subject?: boolean

  /**
   * 附件列表
   */
  attachments?: Array<{
    /**
     * 文件名
     */
    filename: string

    /**
     * 文件内容（Base64编码）
     */
    content: string

    /**
     * 内容编码方式
     */
    encoding?: string

    /**
     * 内容类型/MIME类型
     */
    content_type: string
  }>
}

/**
 * 邮件发送响应类型
 */
export interface EmailSendResponse {
  /**
   * 发送是否成功
   */
  success: boolean

  /**
   * 消息ID
   */
  message_id?: string

  /**
   * 错误信息
   */
  error?: string
}

/**
 * 邮件模板类型
 */
export interface EmailTemplate {
  /**
   * 模板ID
   */
  id: number

  /**
   * 模板名称
   */
  name: string

  /**
   * 模板主题
   */
  subject: string

  /**
   * 模板内容
   */
  content: string

  /**
   * 模板描述
   */
  description?: string

  /**
   * 创建时间
   */
  created_at: string

  /**
   * 更新时间
   */
  updated_at: string
}

/**
 * 创建邮件模板请求类型
 */
export interface EmailTemplateCreate {
  /**
   * 模板名称
   */
  name: string

  /**
   * 模板主题
   */
  subject: string

  /**
   * 模板内容
   */
  content: string

  /**
   * 模板描述
   */
  description?: string
}

/**
 * 更新邮件模板请求类型
 */
export interface EmailTemplateUpdate {
  /**
   * 模板名称
   */
  name?: string

  /**
   * 模板主题
   */
  subject?: string

  /**
   * 模板内容
   */
  content?: string

  /**
   * 模板描述
   */
  description?: string
}
