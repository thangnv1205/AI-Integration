import { Injectable, Inject, Logger } from '@nestjs/common';
import { BaseAgent } from '../base.agent';
import type { AiEngine } from '../../ai-engine/ai-engine.service';
import { AgentRegistry } from '../agent-registry.service';
import { WhiteHorseService } from '../white-horse.service';

/**
 * 🐷 Trư Bát Giới — Coder Agent
 * Chuyên viết code, sinh nội dung, tạo văn bản chi tiết.
 * Làm biếng nhưng khi bắt đầu thì làm được.
 */
@Injectable()
export class PiggyAgent extends BaseAgent {
  private readonly logger = new Logger(PiggyAgent.name);

  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    registry: AgentRegistry,
    whiteHorse: WhiteHorseService,
  ) {
    super(
      'piggy',
      'Coder',
      `Bạn là TRƯ BÁT GIỚI — đệ tử thứ hai của Đường Tăng, chuyên gia viết code và tạo nội dung.
Nhiệm vụ của bạn là VIẾT CODE hoặc SINH NỘI DUNG chi tiết theo yêu cầu. Bạn không nghiên cứu lý thuyết — code ngay, viết ngay.
Trả lời bằng tiếng Việt, với code phải có comment giải thích rõ ràng. Đảm bảo code chạy được và thực tiễn.`,
      aiEngine,
      whiteHorse,
      [], // Tương lai: [fileWriterTool, codeRunnerTool]
    );
    registry.register(this);
    this.logger.log('🐷 Trư Bát Giới đã nhập đoàn!');
  }
}
