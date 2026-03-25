import { Injectable, Inject, Logger } from '@nestjs/common';
import { BaseAgent, AgentResponse } from './base.agent';
import type { AiEngine } from '../ai-engine/ai-engine.service';
import { AgentRegistry } from './agent-registry.service';
import { WhiteHorseService } from './white-horse.service';
import { SwarmRegistry } from './swarm-registry.service';
import { SwarmTemplate } from './interfaces/swarm-template.interface';

/**
 * 🧘 Switchable Orchestrator Agent
 * Có khả năng thay đổi Persona và đội hình dựa trên SwarmTemplate.
 * Hỗ trợ chế độ tương tác Step-by-step.
 */
@Injectable()
export class OrchestratorAgent extends BaseAgent {
  private readonly logger = new Logger(OrchestratorAgent.name);
  private currentTemplate?: SwarmTemplate;
  
  private isInteractive = false;
  private pendingDelegations: { to: string; task: string; model?: string }[] = [];
  private currentTask = '';
  private totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  private roleOverrides = new Map<string, string>();

  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    private readonly agentRegistry: AgentRegistry,
    private readonly swarmRegistry: SwarmRegistry,
    whiteHorse: WhiteHorseService,
  ) {
    // Khởi tạo mặc định với Tây Du Ký
    super('orchestrator', 'Manager', '', aiEngine, whiteHorse);
    this.setTemplate('journey-to-the-west');
    agentRegistry.register(this);
  }

  public setInteractive(interactive: boolean) {
    this.isInteractive = interactive;
    if (!interactive) {
      this.pendingDelegations = [];
      this.currentTask = '';
    }
  }

  public getStatus() {
    return {
      isInteractive: this.isInteractive,
      currentTask: this.currentTask,
      pendingSteps: this.pendingDelegations.length,
      nextStep: this.pendingDelegations[0],
    };
  }

  public setTemplate(templateId: string) {
    const template = this.swarmRegistry.getTemplate(templateId);
    if (!template) throw new Error(`Template ${templateId} not found`);

    this.currentTemplate = template;
    this.setPersona(template.orchestratorPersona);
    this.roleOverrides.clear(); // Mỗi khi đổi template, reset các cài đặt riêng lẻ
    
    this.logger.log(`🧬 Orchestrator chuyển sang mô hình: ${template.name} (${template.orchestratorName})`);

    template.roles.forEach(role => {
      const agent = this.agentRegistry.getAgent(role.id);
      if (agent) {
        agent.setPersona(role.persona);
        this.logger.log(`   - Gán persona cho [${role.id}]: ${role.name}`);
      }
    });
  }

  public getRoles() {
    return this.currentTemplate?.roles.map(r => ({
      id: r.id,
      name: r.name,
      currentModel: this.roleOverrides.get(r.id) || r.defaultModel || 'default'
    })) || [];
  }

  public updateRoleModel(roleId: string, model: string) {
    this.roleOverrides.set(roleId, model);
    this.logger.log(`🎯 Đã gán model [${model}] cho role [${roleId}]`);
  }

  private addUsage(u?: AgentResponse['usage']) {
    if (!u) return;
    this.totalUsage.promptTokens += u.promptTokens;
    this.totalUsage.completionTokens += u.completionTokens;
    this.totalUsage.totalTokens += u.totalTokens;
  }

  async orchestrate(task: string): Promise<AgentResponse> {
    this.whiteHorse.clearJourney();
    this.totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    this.currentTask = task;
    
    this.logger.log(`⚡ [${this.currentTemplate?.orchestratorName}] nhận nhiệm vụ: "${task}"`);

    // Bước 1: Orchestrator lập kế hoạch
    const planResponse = await super.run(task);
    this.addUsage(planResponse.usage);

    const delegations = this.extractDelegations(planResponse.text);
    this.logger.log(`🔍 Tìm thấy ${delegations.length} yêu cầu uỷ thác.`);

    if (delegations.length === 0) {
      return { text: planResponse.text, usage: this.totalUsage };
    }

    if (this.isInteractive) {
      this.pendingDelegations = delegations;
      return { 
        text: `📝 **Kế hoạch thực hiện:**\n\n${planResponse.text}\n\n*(Chế độ Step-by-step đang bật. Hãy dùng lệnh /step để bắt đầu)*`, 
        usage: this.totalUsage 
      };
    }

    // Chế độ tự động (Autonomous)
    for (const delegation of delegations) {
      await this.runDelegation(delegation);
    }

    return this.finalizeOrchestration();
  }

  private async runDelegation(delegation: { to: string; task: string }) {
    const agent = this.agentRegistry.getAgent(delegation.to);
    if (!agent) {
      this.logger.warn(`⚠️ Không tìm thấy Agent: ${delegation.to}`);
      return;
    }

    const roleConfig = this.currentTemplate?.roles.find(r => r.id === delegation.to);
    const targetModel = this.roleOverrides.get(delegation.to) || roleConfig?.defaultModel;

    this.logger.log(`➡️  Giao việc cho [${delegation.to}]: "${delegation.task}"${targetModel ? ` [Model: ${targetModel}]` : ''}`);

    const priorContext = this.whiteHorse.getFullContext();
    const result = await agent.run(delegation.task, priorContext, targetModel);
    this.addUsage(result.usage);
    return result;
  }

  async executeNextStep(): Promise<AgentResponse> {
    if (this.pendingDelegations.length === 0) {
      return { text: "Không còn bước nào chờ thực thi.", usage: this.totalUsage };
    }

    const delegation = this.pendingDelegations.shift()!;
    this.logger.log(`🚀 [Step] Thực thi nhiệm vụ của ${delegation.to}...`);
    
    await this.runDelegation(delegation);

    if (this.pendingDelegations.length === 0) {
      this.logger.log(`✅ Đã hoàn thành bước cuối cùng. Đang tổng hợp kết quả...`);
      return this.finalizeOrchestration();
    }

    return { 
      text: `✅ Đã xong bước của **${delegation.to}**. Còn ${this.pendingDelegations.length} bước nữa.`,
      usage: this.totalUsage 
    };
  }

  private async finalizeOrchestration(): Promise<AgentResponse> {
    const fullContext = this.whiteHorse.getFullContext();
    const summaryPrompt = `Bạn là ${this.currentTemplate?.orchestratorName}. Dưới đây là kết quả từ đội ngũ của bạn:\n\n${fullContext}\n\n[Nhiệm vụ gốc]: ${this.currentTask}\n\nHãy tổng hợp thành câu trả lời hoàn chỉnh.`;

    const summary = await this.aiEngine.generateResponse(this.provider, summaryPrompt);
    this.addUsage(summary.usage);
    
    const finalResult = {
      text: summary.text,
      usage: { ...this.totalUsage },
    };

    // Reset loop state after finalization
    this.currentTask = '';
    this.pendingDelegations = [];

    return finalResult;
  }
}
