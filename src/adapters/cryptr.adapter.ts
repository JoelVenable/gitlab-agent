import { default as Cryptr } from 'cryptr'
import {
  EncryptionPasswordMissingException,
  EncryptorPort,
} from '../ports/encryptor.port'

export class CryptrAdapter implements EncryptorPort {
  #cryptr: Cryptr | null = null

  get #instance() {
    if (this.#cryptr === null) throw new EncryptionPasswordMissingException()
    return this.#cryptr
  }

  setPassword(password: string): void {
    this.#cryptr = new Cryptr(password)
  }

  async encrypt(data: string) {
    return this.#instance.encrypt(data)
  }

  async decrypt(encryptedData: string) {
    return this.#instance.decrypt(encryptedData)
  }
}
