import { Gitlab } from '@gitbeaker/rest'
import { fromCalendarDate, getCalendarDate, addDaysFromNow } from './util/date'
import { EncryptorPort } from './ports/encryptor.port'
import { TokenStorePort } from './ports/token-store.port'
import { LoggerPort } from './ports/logger.port'
import { UserInterfacePort } from './ports/user-interface.port'
import { GitlabAgentPort } from './ports/gitlab-agent.port'
import { checkRange } from './util/range'

export type GitlabAPI = InstanceType<typeof Gitlab<false>>

export type GitlabAgentConfig = {
  newTokenExpiryDays: number
  minRotateExpiryDays: number
}

export type GitlabAgentProps = {
  config: GitlabAgentConfig
  encryptor: EncryptorPort
  store: TokenStorePort
  ui: UserInterfacePort
  logger: LoggerPort
}

class ApiWrapper {
  #api: GitlabAPI | null = null
  #token: string | null = null

  setToken(token: string) {
    this.#token = token
    this.#api = new Gitlab({
      token,
    })
  }

  get api() {
    if (!this.#api) {
      throw new Error('No token set')
    }
    return this.#api
  }

  get plaintextToken() {
    return this.#token
  }
}

export class GitlabAgent implements GitlabAgentPort {
  #config: GitlabAgentConfig
  #encryptor: EncryptorPort
  #store: TokenStorePort
  #ui: UserInterfacePort

  #wrapper = new ApiWrapper()

  get api(): GitlabAPI {
    return this.#wrapper.api
  }

  constructor({ config, encryptor, store, ui }: GitlabAgentProps) {
    this.#validate(config)
    this.#config = config
    this.#encryptor = encryptor
    this.#store = store
    this.#ui = ui
  }

  #validate(config: GitlabAgentConfig) {
    const exp = checkRange({
      min: 7,
      max: 365,
      value: config.newTokenExpiryDays,
      name: 'newTokenExpiryDays',
    })
    const rot = checkRange({
      min: 1,
      max: 90,
      value: config.minRotateExpiryDays,
      name: 'minRotateExpiryDays',
    })
    if (exp < rot) {
      throw new Error(
        'New tokens must expire after the rotation interval. Please adjust the values in your configuration.'
      )
    }
  }

  async #promptForPassword() {
    const password = await this.#ui.requestPassword()
    this.#encryptor.setPassword(password)
  }

  async requestToken(): Promise<void> {
    const token = await this.#ui.requestInitialToken()
    await this.#promptForPassword()
    this.#wrapper.setToken(token)
    await this.rotateToken()
  }

  async authenticate(): Promise<void> {
    const encrypted = await this.#store.fetch()
    if (!encrypted) return this.requestToken()
    const expiryState = getExpiryState(
      encrypted.expiry,
      this.#config.minRotateExpiryDays
    )
    if (expiryState === 'expired') return this.requestToken()
    try {
      await this.#promptForPassword()
      const token = await this.#encryptor.decrypt(encrypted.encryptedToken)
      this.#wrapper.setToken(token)
      if (expiryState === 'needs-rotation') {
        await this.rotateToken()
      }
    } catch {
      return this.authenticate()
    }
  }

  async rotateToken() {
    const newExpiry = getNewExpiry(this.#config.newTokenExpiryDays)
    const res = await this.api.PersonalAccessTokens.rotate('self', {
      expiresAt: newExpiry,
    })
    this.#wrapper.setToken(res.token)
    const encryptedToken = await this.#encryptor.encrypt(res.token)
    await this.#store.save({
      encryptedToken,
      expiry: newExpiry,
    })
  }

  async getExpiry() {
    try {
      const res = await this.api.PersonalAccessTokens.show({ tokenId: 'self' })
      return res.expires_at!
    } catch (err) {
      return null
    }
  }

  get plaintextToken() {
    return this.#wrapper.plaintextToken
  }
}

type ExpiryState = 'expired' | 'needs-rotation' | 'ok'

function getExpiryState(expiry: string, minRotateDays: number): ExpiryState {
  const expDate = fromCalendarDate(expiry)
  const minRotateDate = addDaysFromNow(minRotateDays)
  const now = new Date()

  if (expDate < now) {
    return 'expired'
  }
  if (expDate < minRotateDate) {
    return 'needs-rotation'
  }
  return 'ok'
}

function getNewExpiry(newTokenDays: number) {
  return getCalendarDate(addDaysFromNow(newTokenDays))
}
