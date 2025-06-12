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
