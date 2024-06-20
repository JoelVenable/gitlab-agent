export class AgentNotInitializedException extends Error {
  constructor() {
    super('Agent not initialized')
    this.name = 'AgentNotInitializedException'
  }
}
