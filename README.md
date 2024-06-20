# Gitlab Agent

Gitlab Agent is a library that provides a secure way to store your Gitlab personal access token on your local machine and authenticate with private Gitlab npm repositories.

## Installation

To install Gitlab Agent, simply run the following command:

```bash
npm install gitlab-agent
```

## CLI Usage

Common Options (used with any command):

- `--help`: Show help
- `--version`: Show version number
- `-p, --path`: Specify the path to store the Gitlab Agent configuration file (default: "/Users/joel/.gitlab-agent")
- `-m, --minRotateDays`: Specify the minimum number of days before rotating the token (default: 30)
- `-n, --newTokenDays`: Specify the number of days before generating a new token (default: 90)

Commands:

- `gitlab-agent register`: Registers your personal access token for GitLab NPM registry. Instructs you to create a token if needed.
  - `-s, --scopes`: The org scopes to register. Omit the leading @ (example: `my-org`)
  - `-d, --domain`: Specify the domain (default: "gitlab.com")

Make sure to provide the necessary options as needed.

## Library usage

To use Gitlab Agent in your CLI project, import the library into your code and create an agent.

- `authenticate`: attempts to retrieve the encrypted token from storage, and prompts for a decryption password. If no token is present, you will be prompted to create one along with an encryption password.

2. After authentication is complete, the `api` property exposes a pre-authenticated Gitlab SDK, provided by the [`@gitbeaker/rest`](https://github.com/jdalrymple/gitbeaker/tree/main/packages/rest) library.

```typescript
import { createAgent } from 'gitlab-agent'

async function main() {
  const agent = createAgent()

  await agent.authenticate()

  const branches = await agent.api.Branches.all('gitlab-org/gitlab')
}

main()
```

That's it! You are now ready to securely access private Gitlab NPM packages and the Gitlab API using `gitlab-agent`.

## License

Gitlab Agent is licensed under the [MIT License](LICENSE).
