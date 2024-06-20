export type EncryptorPort = {
  setPassword(password: string): void
  encrypt(data: string): Promise<string>
  decrypt(encryptedData: string): Promise<string>
}

export class EncryptionPasswordMissingException extends Error {
  constructor() {
    super('Encryption password is missing')
  }
}

export class EncryptionPasswordInvalidException extends Error {
  constructor() {
    super('Encryption password is invalid')
  }
}
