import { Injectable, Inject } from '@nestjs/common';
import { PixelAgent, PixelAgentStatus } from './interfaces/pixel-agent.interface';
import type { AiEngine } from '../ai-engine/ai-engine.service';
import { SwarmRegistry } from './swarm-registry.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PixelAgentService {
  private readonly agents = new Map<string, PixelAgent>();
  private readonly agentsSubject = new BehaviorSubject<PixelAgent[]>([]);

  constructor(
    @Inject('AI_ENGINE') private readonly aiEngine: AiEngine,
    private readonly swarmRegistry: SwarmRegistry,
  ) { }

  get agents$() {
    return this.agentsSubject.asObservable();
  }

  getAllAgents(): PixelAgent[] {
    return Array.from(this.agents.values());
  }

  spawnSwarm(templateId: string) {
    console.log(`[PixelAgentService] Spawning swarm for template: ${templateId}`);
    const template = this.swarmRegistry.getTemplate(templateId);
    if (!template) throw new Error(`Template ${templateId} not found`);

    // Clear old agents for this demo/feature (or keep them?)
    // Let's keep them and add new ones

    // Orchestrator
    this.upsertAgent({
      id: `orc-${template.id}`,
      name: template.orchestratorName,
      role: 'Orchestrator',
      provider: 'ollama',
      model: 'deepseek-r1:1.5b',
      status: 'idle',
      position: { x: 50, y: 50 },
      spriteId: 'king',
    });

    // Sub-agents
    template.roles.forEach((role, index) => {
      this.upsertAgent({
        id: role.id,
        name: role.name,
        role: role.id,
        provider: 'ollama',
        model: 'deepseek-r1:1.5b',
        status: 'idle',
        position: { x: 150 + index * 100, y: 150 },
        spriteId: `agent-${index + 1}`,
      });
    });
  }

  upsertAgent(agent: PixelAgent) {
    this.agents.set(agent.id, agent);
    this.notifyUpdate();
  }

  updateStatus(id: string, status: PixelAgentStatus, task?: string) {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      if (task) agent.currentTask = task;
      this.notifyUpdate();
    }
  }

  updateConfig(id: string, config: Partial<PixelAgent>) {
    const agent = this.agents.get(id);
    if (agent) {
      Object.assign(agent, config);
      this.notifyUpdate();
    }
  }

  private notifyUpdate() {
    this.agentsSubject.next(this.getAllAgents());
  }

  async executeTask(id: string, task: string): Promise<string> {
    const agent = this.agents.get(id);
    if (!agent) throw new Error(`Agent ${id} not found`);

    this.updateStatus(id, 'working', task);

    try {
      const response = await this.aiEngine.generateResponse(agent.provider, task, {
        model: agent.model,
      });
      this.updateStatus(id, 'success');
      return response.text;
    } catch (error) {
      this.updateStatus(id, 'error');
      throw error;
    }
  }
}
