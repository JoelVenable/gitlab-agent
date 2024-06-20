import { GitlabAPI } from '../gitlab-agent'

export type GitlabAgentPort = {
  authenticate(): Promise<void>
  requestToken(): Promise<void>
  rotateToken(): Promise<void>
  plaintextToken: string | null
  api: GitlabAPI
}
