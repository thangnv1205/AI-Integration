import { Module } from '@nestjs/common';
import { AiEngineModule } from '../ai-engine/ai-engine.module';
import { AgentRegistry } from './agent-registry.service';
import { WhiteHorseService } from './white-horse.service';
import { OrchestratorAgent } from './orchestrator.agent';
import { SwarmRegistry } from './swarm-registry.service';
import { WukongAgent } from './disciples/wukong.agent';
import { PiggyAgent } from './disciples/piggy.agent';
import { SandMonkAgent } from './disciples/sand-monk.agent';

@Module({
  imports: [AiEngineModule],
  providers: [
    AgentRegistry,
    SwarmRegistry,
    WhiteHorseService,
    OrchestratorAgent,
    WukongAgent,
    PiggyAgent,
    SandMonkAgent,
  ],
  exports: [
    AgentRegistry,
    SwarmRegistry,
    WhiteHorseService,
    OrchestratorAgent,
  ],
})
export class AgentsModule {}
