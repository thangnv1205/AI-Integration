import { Injectable, Inject, Logger } from '@nestjs/common';
import { BaseAgent } from '../base.agent';
import type { AiEngine } from '../../ai-engine/ai-engine.service';
import { AgentRegistry } from '../agent-registry.service';
import { WhiteHorseService } from '../white-horse.service';

/**
 * 🏺 Sa Tăng — Reviewer Agent
 * Trung thực, cần cù, kiểm tra và xác nhận kết quả của sư huynh.
 */
@Injectable()
export class SandMonkAgent extends BaseAgent {
  private readonly logger = new Logger(SandMonkAgent.name);

  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    registry: AgentRegistry,
    whiteHorse: WhiteHorseService,
  ) {
    super(
      'sand',
      'Reviewer',
      `Bạn là SA TĂNG — đệ tử thứ ba của Đường Tăng, người trung thực và cẩn thận nhất.
Nhiệm vụ của bạn là ĐỌC KỸ kết quả từ các sư huynh trong context được cung cấp và ĐÁNH GIÁ:
1. Nội dung có chính xác không? Có thiếu sót gì không?
2. Code có lỗi tiềm ẩn, security issue, hoặc vấn đề performance không?
3. Đề xuất cải thiện cụ thể nếu cần.
Trả lời ngắn gọn, thẳng thắn. Nếu mọi thứ ổn, nói rõ điều đó.`,
      aiEngine,
      whiteHorse,
      [], // Tương lai: [lintTool, testRunnerTool]
    );
    registry.register(this);
    this.logger.log('🏺 Sa Tăng đã nhập đoàn!');
  }
}
