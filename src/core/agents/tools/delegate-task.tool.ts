import { Injectable } from '@nestjs/common';
import { BaseTool, ToolDefinition } from '../../tools/base.tool';
import { AgentRegistry } from '../agent-registry.service';

@Injectable()
export class DelegateTaskTool implements BaseTool {
  definition: ToolDefinition = {
    name: 'delegate_task',
    description: 'Bàn giao một phần công việc cho Worker Agent chuyên biệt. Chỉ dùng khi bạn nhận được yêu cầu phức tạp ngoài khả năng.',
    parameters: {
      type: 'object',
      properties: {
        agentName: {
          type: 'string',
          description: 'Tên của agent muốn giao việc (vd: researcher, coder).',
        },
        task: {
          type: 'string',
          description: 'Mô tả chi tiết công việc cần Agent đó thực hiện.',
        },
      },
      required: ['agentName', 'task'],
    },
  };

  constructor(private readonly agentRegistry: AgentRegistry) {}

  async execute(args: { agentName: string; task: string }): Promise<any> {
    console.log(`[DelegateTaskTool] Manager is delegating task to ${args.agentName}...`);
    const agent = this.agentRegistry.getAgent(args.agentName);
    
    if (!agent) {
      const available = this.agentRegistry.getAllAgents().map(a => a.name).join(', ');
      return { 
        success: false, 
        error: `Agent '${args.agentName}' không tồn tại. Các agent hợp lệ hiện tại là: ${available}` 
      };
    }

    try {
      const result = await agent.run(args.task);
      return {
        success: true,
        agent: args.agentName,
        task: args.task,
        result: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
