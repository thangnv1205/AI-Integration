import { Injectable } from '@nestjs/common';

export interface AgentMemoryEntry {
  agent: string;
  task: string;
  result: string;
  timestamp: Date;
}

/**
 * 🐴 Bạch Long Mã — Shared Memory & Context Carrier
 * Không gọi LLM, chỉ lưu và chia sẻ context/kết quả giữa các agents.
 * "Bạch Long Mã không nói nhiều nhưng nhớ tất cả mọi thứ trong hành trình."
 */
@Injectable()
export class WhiteHorseService {
  private readonly journey: AgentMemoryEntry[] = [];
  private readonly store = new Map<string, any>();

  // Ghi nhớ kết quả của một agent sau khi hoàn thành
  remember(agent: string, task: string, result: string): void {
    this.journey.push({ agent, task, result, timestamp: new Date() });
    this.store.set(agent, result);
  }

  // Đọc kết quả gần nhất của một agent cụ thể
  recall(agentName: string): string | undefined {
    return this.store.get(agentName);
  }

  // Lấy toàn bộ hành trình (cho TangMonk tổng hợp)
  getFullContext(): string {
    if (this.journey.length === 0) return '(Chưa có kết quả nào)';
    return this.journey
      .map(e => `[${e.agent.toUpperCase()}] Task: "${e.task}"\nResult: ${e.result}`)
      .join('\n\n---\n\n');
  }

  // Xóa hành trình cũ để bắt đầu quest mới
  clearJourney(): void {
    this.journey.length = 0;
    this.store.clear();
  }
}
