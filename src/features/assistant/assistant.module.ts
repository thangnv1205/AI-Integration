import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { AssistantGateway } from './assistant.gateway';
import { CoreModule } from '@core/core.module';

@Module({
  imports: [CoreModule],
  providers: [AssistantService, AssistantGateway],
  controllers: [AssistantController],
})
export class AssistantModule {}
