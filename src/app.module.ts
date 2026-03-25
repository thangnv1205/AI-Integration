import { Module } from '@nestjs/common'; // Trigger reload for /swarm route
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@core/core.module';
import { AssistantModule } from '@features/assistant/assistant.module';
import { AutomationModule } from '@features/automation/automation.module';
import { PixelAgentModule } from '@features/pixel-agents/pixel-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    AssistantModule,
    AutomationModule,
    PixelAgentModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
