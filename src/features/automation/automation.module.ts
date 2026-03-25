import { Module } from '@nestjs/common';
import { ToolsController } from './tools.controller';
import { CoreModule } from '@core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [ToolsController],
})
export class AutomationModule {}
