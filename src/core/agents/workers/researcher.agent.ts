import { Injectable, Inject } from '@nestjs/common';
import { BaseAgent } from '../base.agent';
import type { AiEngine } from '../../ai-engine/ai-engine.service';
import { AgentRegistry } from '../agent-registry.service';

@Injectable()
export class ResearcherAgent extends BaseAgent {
  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    registry: AgentRegistry,
  ) {
    super(
      'researcher',
      'Researcher',
      'Bạn là Researcher Agent. Nhiệm vụ của bạn là tìm kiếm thông tin, đọc tài liệu, và cung cấp kiến thức nền tảng chính xác, chi tiết cho Manager. Bạn chỉ tập trung vào thông tin, KHÔNG viết code.',
      aiEngine,
      [], // Tương lai sẽ thêm WebSearchTool, VectorDBReadTool
    );
    registry.register(this);
  }
}
