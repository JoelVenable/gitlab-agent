import { LoggerPort } from '../ports/logger.port'

export const Logger: LoggerPort = {
  log: (message: string) => {
    console.log(message)
  },
  error: (message: string) => {
    console.error(message)
  },
}

export const SilentLogger: LoggerPort = {
  log: () => {},
  error: () => {},
}
