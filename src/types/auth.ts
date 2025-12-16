export interface TokenPair {
  token: string
  refreshToken: string
  accessJti: string
  refreshJti: string
  accessExpiresAt: number | null
  refreshExpiresAt: number | null
}
