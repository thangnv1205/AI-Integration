import { Controller, Post, Body, Get } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  ask(@Body() body: { prompt: string; provider?: string }) {
    return this.assistantService.ask(body.prompt, body.provider);
  }

  @Post('ask-with-context')
  askWithContext(@Body() body: { prompt: string; provider?: string }) {
    return this.assistantService.askWithContext(body.prompt, body.provider);
  }

  @Post('learn')
  learn(@Body() body: { text: string; metadata?: any }) {
    return this.assistantService.learn(body.text, body.metadata);
  }

  @Get('providers')
  getProviders() {
    return this.assistantService.getProviders();
  }
}
