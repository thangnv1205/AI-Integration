import { Module } from '@nestjs/common';
import { AiEngineModule } from '../ai-engine/ai-engine.module';
import { AgentRegistry } from './agent-registry.service';
import { DelegateTaskTool } from './tools/delegate-task.tool';
import { ManagerAgent } from './manager.agent';
import { ResearcherAgent } from './workers/researcher.agent';
import { CoderAgent } from './workers/coder.agent';

@Module({
  imports: [AiEngineModule],
  providers: [
    AgentRegistry,
    DelegateTaskTool,
    ManagerAgent,
    ResearcherAgent,
    CoderAgent,
  ],
  exports: [
    AgentRegistry,
    ManagerAgent,
  ],
})
export class AgentsModule {}
