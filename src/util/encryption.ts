import { default as Cryptr } from 'cryptr'

export type EncryptionArgs = {
  password: string
  text: string
}

export type DecryptionArgs = {
  password: string
  encryptedData: string
}

//Encrypting text
export function encrypt(args: EncryptionArgs) {
  const cryptr = new Cryptr(args.password)
  return cryptr.encrypt(args.text)
}

// Decrypting text
export function decrypt(args: DecryptionArgs) {
  const cryptr = new Cryptr(args.password)
  return cryptr.decrypt(args.encryptedData)
}
