import { TokenStorePort, TokenStoreObject } from '../ports/token-store.port'
import * as fs from 'fs/promises'
import * as path from 'path'
import { LoggerPort } from '../ports/logger.port'

type FSError = NodeJS.ErrnoException

export type FileSystemAdapterArgs = {
  fileLocation: string
  logger: LoggerPort
}

export class FileSystemAdapter implements TokenStorePort {
  #fileLocation: string
  #logger: LoggerPort

  constructor(args: FileSystemAdapterArgs) {
    this.#fileLocation = args.fileLocation
    this.#logger = args.logger
  }

  async save(token: TokenStoreObject): Promise<void> {
    const parentDir = path.dirname(this.#fileLocation)
    await fs.mkdir(parentDir, { recursive: true })
    await fs.writeFile(this.#fileLocation, JSON.stringify(token, undefined, 2))
  }

  async fetch(): Promise<TokenStoreObject | null> {
    try {
      const fileContent = await fs.readFile(this.#fileLocation, 'utf-8')
      const parsed = JSON.parse(fileContent)
      if ('encryptedToken' in parsed && 'expiry' in parsed) {
        return parsed
      }
      this.#logger.error('Invalid token file')
      return null
    } catch (err) {
      if (isFSError(err)) {
        if (err.code === 'ENOENT') {
          return null
        }
        this.#logger.error(`Error reading file: ${err.message}`)
      }
      return null
    }
  }

  async delete(): Promise<void> {
    await fs.unlink(this.#fileLocation)
  }
}

function isFSError(err: unknown): err is FSError {
  if (err instanceof Error) {
    if ('code' in err) {
      return true
    }
  }
  return false
}
