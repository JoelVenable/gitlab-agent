export type TokenStoreObject = {
  encryptedToken: string
  expiry: string
}

export interface TokenStorePort {
  save(token: TokenStoreObject): Promise<void>
  fetch(): Promise<TokenStoreObject | null>
  delete(): Promise<void>
}
