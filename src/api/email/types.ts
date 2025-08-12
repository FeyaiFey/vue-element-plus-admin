export interface EmailConfigBase {
  UserId?: string
  ImapServer?: string
  ImapPort?: number
  ImapUseSsl?: number
  SmtpServer?: string
  SmtpPort?: number
  SmtpUseSsl?: number
  SpecialPassword?: string
}

export interface EmailPasswordUpdateRequest {
  SpecialPassword: string
}

export interface EmailAttachment {
  filename: string
  content: string
  content_type: string
}

export interface EmailSendRequest {
  packagingRequirementsIds?: number[]
  to?: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
  content?: string
  attachments?: EmailAttachment[]
}
