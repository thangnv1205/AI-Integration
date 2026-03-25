import { Injectable, Inject, Logger } from '@nestjs/common';
import { BaseAgent } from '../base.agent';
import type { AiEngine } from '../../ai-engine/ai-engine.service';
import { AgentRegistry } from '../agent-registry.service';
import { WhiteHorseService } from '../white-horse.service';

/**
 * 🐵 Tôn Ngộ Không — Researcher Agent
 * "Tề Thiên Đại Thánh" — thần thông quảng đại, chuyên tìm kiếm thông tin.
 * Tương lai: gắn RAG Tool và Web Search Tool.
 */
@Injectable()
export class WukongAgent extends BaseAgent {
  private readonly logger = new Logger(WukongAgent.name);

  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    registry: AgentRegistry,
    whiteHorse: WhiteHorseService,
  ) {
    super(
      'wukong',
      'Researcher',
      `Bạn là TÔN NGỘ KHÔNG — Tề Thiên Đại Thánh, đại đệ tử tài năng nhất của Đường Tăng.
Nhiệm vụ của bạn là NGHIÊN CỨU và TÌM KIẾM thông tin. Bạn KHÔNG viết code, KHÔNG tổng hợp — chỉ cung cấp kiến thức chính xác, đầy đủ và súc tích.
Hãy trả lời bằng tiếng Việt, trình bày theo từng điểm rõ ràng. Đây là nội dung sẽ được Đường Tăng và các sư đệ đọc tiếp.`,
      aiEngine,
      whiteHorse,
      [], // Tương lai: [ragTool, webSearchTool]
    );
    registry.register(this);
    this.logger.log('🐵 Tôn Ngộ Không đã nhập đoàn!');
  }
}
