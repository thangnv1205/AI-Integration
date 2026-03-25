import { AiEngine } from '../ai-engine/ai-engine.service';
import { BaseTool } from '../tools/base.tool';
import { WhiteHorseService } from './white-horse.service';

export interface DelegationRequest {
  to: string;
  task: string;
}

export interface AgentResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export abstract class BaseAgent {
  private dynamicPersona?: string;

  constructor(
    public readonly name: string,
    public readonly role: string,
    protected readonly systemPrompt: string,
    protected readonly aiEngine: AiEngine,
    protected readonly whiteHorse: WhiteHorseService,
    protected readonly tools: BaseTool[] = [],
    protected readonly provider: string = 'ollama',
  ) {}

  public setPersona(persona: string) {
    this.dynamicPersona = persona;
  }

  /**
   * Chạy agent để thực thi một task cụ thể.
   * Hỗ trợ ghi đè model cho từng request.
   */
  async run(task: string, context?: string, model?: string): Promise<AgentResponse> {
    const prompt = this.buildPrompt(task, context);
    const response = await this.aiEngine.generateResponse(this.provider, prompt, { model });
    const text = response.text;

    // Lưu kết quả vào Bạch Long Mã
    this.whiteHorse.remember(this.name, task, text);
    
    return {
      text,
      usage: response.usage
    };
  }

  /**
   * Parse delegation requests từ LLM response.
   * LLM được hướng dẫn xuất JSON trong cặp ```json ... ```
   */
  protected extractDelegations(text: string): DelegationRequest[] {
    try {
      // 1. Thử tìm JSON trong markdown block
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
      let jsonStr = jsonMatch ? jsonMatch[1] : '';

      // 2. Nếu không có markdown, thử tìm đối tượng { ... } đầu tiên
      if (!jsonStr) {
        const rawJsonMatch = text.match(/(\{[\s\S]*\})/);
        jsonStr = rawJsonMatch ? rawJsonMatch[1] : '';
      }

      // 3. Nếu vẫn không thấy gì, thử parse nguyên văn bản
      if (!jsonStr) {
        jsonStr = text;
      }

      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.delegate)) {
        return parsed.delegate as DelegationRequest[];
      }
    } catch {
      // LLM format sai hoặc không phải JSON → trả về []
    }
    return [];
  }

  protected buildPrompt(task: string, context?: string): string {
    const toolsText = this.tools.length > 0
      ? `\n\nCông cụ bạn có:\n${this.tools.map(t => `- ${t.definition.name}: ${t.definition.description}`).join('\n')}`
      : '';
    const contextText = context ? `\n\n[Context từ hành trình]:\n${context}` : '';
    const currentPersona = this.dynamicPersona || this.systemPrompt;
    return `${currentPersona}${toolsText}${contextText}\n\n[Nhiệm vụ]: ${task}`;
  }
}
