import { Module } from '@nestjs/common';
import { PixelAgentService } from '../../core/agents/pixel-agent.service';
import { PixelAgentGateway } from './pixel-agent.gateway';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [CoreModule],
  providers: [PixelAgentService, PixelAgentGateway],
  exports: [PixelAgentService],
})
export class PixelAgentModule {}
