import { Injectable, Inject } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import type { AiEngine } from '../ai-engine/ai-engine.service';
import { DelegateTaskTool } from './tools/delegate-task.tool';
import { AgentRegistry } from './agent-registry.service';

@Injectable()
export class ManagerAgent extends BaseAgent {
  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    delegateTool: DelegateTaskTool,
    registry: AgentRegistry,
  ) {
    super(
      'manager',
      'Coordinator',
      'Bạn là Manager Agent (Giám đốc dự án AI). Nhiệm vụ của bạn là phân tích yêu cầu từ người dùng, xé nhỏ công việc, và UỶ QUYỀN (delegate) cho các Worker Agents bằng công cụ delegate_task. Đừng tự trả lời chi tiết. Sau khi có kết quả từ các Worker, hãy tổng hợp lại bằng tiếng Việt.',
      aiEngine,
      [delegateTool],
    );
    registry.register(this);
  }
}
