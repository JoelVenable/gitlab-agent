#! /usr/bin/env node
import { default as yargs } from 'yargs'
import { hideBin } from 'yargs/helpers'
import { createAgent } from './index'
import { SilentLogger } from './adapters/logger.adapter'
import * as os from 'os'
import * as path from 'path'
import { execSync } from 'child_process'

const defaultPath = path.join(os.homedir(), '.gitlab-agent')

yargs(hideBin(process.argv))
  .option('path', {
    alias: 'p',
    type: 'string',
    default: defaultPath,
  })
  .option('minRotateDays', {
    alias: 'm',
    type: 'number',
    default: 30,
  })
  .option('newTokenDays', {
    alias: 'n',
    type: 'number',
    default: 90,
  })
  .command({
    command: 'register',
    describe: 'Registers your personal access token for GitLab NPM registry',
    builder: (yargs) => {
      return yargs
        .option('scopes', {
          alias: 's',
          type: 'array',
          description: 'The org scopes to register.  Omit the leading @',
        })
        .option('domain', {
          alias: 'd',
          type: 'string',
          default: 'gitlab.com',
        })
    },
    handler: async (args) => {
      let token = process.env['CI_JOB_TOKEN']
      if (!token) {
        const app = createAgent({
          minRotateExpiryDays: args.minRotateDays,
          newTokenExpiryDays: args.newTokenDays,
          path: args.path,
          logger: SilentLogger,
        })

        await app.authenticate()
        token = app.plaintextToken!
      }
      execSync(`npm config set //${args.domain}/:_authToken=${token}`)
      const scopes = Array.isArray(args.scopes) ? args.scopes : [args.scopes]

      scopes.forEach((scope) => {
        execSync(
          `npm config set @${scope}:registry https://${args.domain}/api/v4/packages/npm/`
        )
      })
    },
  })
  .parse()
