import {
  RetryPasswordChoice,
  UserInterfacePort,
} from '../ports/user-interface.port'
import { password, select, checkbox } from '@inquirer/prompts'
import chalk from 'chalk'
import * as os from 'os'

const host = os.hostname()

const defaultName = `gitlab-agent-${host}`

const url = `https://gitlab.com/-/user_settings/personal_access_tokens?name=${defaultName}&scopes=api`

const example = 'glpat-<<random-characters>>'

const patInstructions = [
  `We'll need a ${chalk.redBright`GitLab Personal Access Token`} to continue.`,
  `Go to ${chalk.blue.underline(url)}`,
  `Generate a new token with the ${chalk.green`api`} scope.  ${chalk.red
    .underline`This is a very powerful scope; we will immediately rotate and encrypt the token for maximum security.`}`,
  `It should look something like ${chalk.green.underline(example)}`,
  'Copy the token and paste it here...',
  '',
].join('\n\n')

const failMessage = `That doesn't look right... Tokens should start with 'glpat'.`

const passwordRetryMessage = [
  `Your password did not successfully decrypt the file.`,
  `Would you like to retry the password or would you rather create a new Personal Access Token?`,
]

export const CliAdapter: UserInterfacePort = {
  requestInitialToken: async function (): Promise<string> {
    const token = await password({
      message: patInstructions,
      validate: (res) => {
        if (res.startsWith('glpat')) return true
        return failMessage
      },
    })
    return token.trim()
  },
  requestNewPassword: async function (): Promise<string> {
    const pass = await password({
      message: 'Enter your password',
      validate: (res) => {
        if (res.length < 8)
          return 'Password must be at least 8 characters long.'
        return true
      },
    })
    return pass
  },
  requestPassword: async function (): Promise<string> {
    const pass = await password({ message: 'Enter your password' })
    return pass
  },
  retryPassword: async function (): Promise<RetryPasswordChoice> {
    const res = await select({
      message: passwordRetryMessage.join('\n'),
      choices: [{ value: 'retry' }, { value: 'new token' }],
      default: 'retry',
    })
    return res as RetryPasswordChoice
  },
}
