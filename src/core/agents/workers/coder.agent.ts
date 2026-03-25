import { Injectable, Inject } from '@nestjs/common';
import { BaseAgent } from '../base.agent';
import type { AiEngine } from '../../ai-engine/ai-engine.service';
import { AgentRegistry } from '../agent-registry.service';

@Injectable()
export class CoderAgent extends BaseAgent {
  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    registry: AgentRegistry,
  ) {
    super(
      'coder',
      'Software Engineer',
      'Bạn là Coder Agent. Nhiệm vụ của bạn là nhận phân tích từ Manager hoặc Researcher và tiến hành viết code giải quyết hoặc review source code. Trả về mã nguồn chuẩn, được comment rõ ràng, không vòng vo.',
      aiEngine,
      [], // Tương lai sẽ gắn FileExplorerTool, ScriptExecutorTool
    );
    registry.register(this);
  }
}
