import { FileSystemAdapter } from './adapters/file-system.adapter'
import { Logger, SilentLogger } from './adapters/logger.adapter'
import { GitlabAgent, GitlabAgentProps } from './gitlab-agent'
import { LoggerPort } from './ports/logger.port'
import * as os from 'os'
import { CryptrAdapter } from './adapters/cryptr.adapter'
import { CliAdapter } from './adapters/cli.adapter'
import type { TokenStorePort } from './ports/token-store.port'
import type { EncryptorPort } from './ports/encryptor.port'
import type { UserInterfacePort } from './ports/user-interface.port'
import type { GitlabAgentPort } from './ports/gitlab-agent.port'

export * from './errors'
export type {
  GitlabAgentPort as GitlabAgent,
  TokenStorePort,
  EncryptorPort,
  UserInterfacePort,
  LoggerPort,
}

type CreateAgentProps = {
  /** Number of days in the future that newly generated tokens will have.
   * @default 90
   */
  newTokenExpiryDays?: number
  /** Minimum remaining expiry before tokens are automatically rotated.
   * @default 7
   */
  minRotateExpiryDays?: number
  /** The location of the vaulted gitlab token
   * @default ~/.gitlab-agent
   */
  path?: string
  logger?: LoggerPort | false
  store?: TokenStorePort
  encryptor?: EncryptorPort
  ui?: UserInterfacePort
}

export type { CreateAgentProps }

export const createAgent = (config?: CreateAgentProps): GitlabAgentPort => {
  const resolvedConfig = resolveConfig(config)
  return new GitlabAgent(resolvedConfig)
}

function resolveConfig(config?: CreateAgentProps): GitlabAgentProps {
  const logger = getLogger(config ?? {})
  return {
    config: {
      newTokenExpiryDays: config?.newTokenExpiryDays ?? 90,
      minRotateExpiryDays: config?.minRotateExpiryDays ?? 7,
    },
    logger,
    encryptor: config?.encryptor ?? new CryptrAdapter(),
    ui: config?.ui ?? CliAdapter,
    store:
      config?.store ??
      new FileSystemAdapter({ logger, fileLocation: getPath(config) }),
  }
}

function getLogger(config: CreateAgentProps): LoggerPort {
  if (config.logger === false) return SilentLogger
  return config.logger ?? Logger
}

function getPath(config?: CreateAgentProps) {
  if (config?.path) return config.path

  const homedir = os.homedir()
  return `${homedir}/.gitlab-agent`
}
