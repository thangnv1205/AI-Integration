import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';

@Injectable()
export class AgentRegistry {
  private readonly agents = new Map<string, BaseAgent>();

  register(agent: BaseAgent) {
    this.agents.set(agent.name, agent);
    console.log(`[AgentRegistry] Registered agent: ${agent.name}`);
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}
