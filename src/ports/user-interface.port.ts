export type RetryPasswordChoice = 'retry' | 'new token'

export type UserInterfacePort = {
  requestInitialToken: () => Promise<string>
  requestNewPassword: () => Promise<string>
  requestPassword: () => Promise<string>
  retryPassword: () => Promise<RetryPasswordChoice>
}
