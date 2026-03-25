import { AiEngine } from '../ai-engine/ai-engine.service';
import { BaseTool } from '../tools/base.tool';

export abstract class BaseAgent {
  constructor(
    public readonly name: string,
    public readonly role: string,
    protected readonly systemPrompt: string,
    protected readonly aiEngine: AiEngine,
    protected readonly tools: BaseTool[] = [],
  ) {}

  /**
   * Chạy agent để thực thi một task cụ thể.
   * Lớp con có thể ghi đè để tuỳ biến cách gọi AI và xử lý Tool.
   */
  async run(task: string, context?: any): Promise<string> {
    const prompt = this.buildPrompt(task, context);
    // Truyền tools reference vào options để LLM có thể gọi nếu supported provider
    const options = {
      tools: this.tools.map(t => t.definition),
    };
    
    // Default fallback provider là 'ollama', bạn có thể switch sang 'openai' tuỳ environment
    const response = await this.aiEngine.generateResponse('ollama', prompt, options);
    
    // Ghi chú: Thực tế sẽ cần vòng lặp loop để check LLM có trả về tool_calls không.
    // Do giới hạn framework hiện tại, ta trả về kết quả text trực tiếp.
    return response.text;
  }
  
  protected buildPrompt(task: string, context?: any): string {
    return `[System Message]: ${this.systemPrompt}\n[Role]: ${this.role}\n[Context]: ${JSON.stringify(context || {})}\n\n[User Task]: ${task}`;
  }
}
