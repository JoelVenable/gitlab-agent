export type LoggerPort = {
  log: (message: string) => void
  error: (message: string) => void
}
