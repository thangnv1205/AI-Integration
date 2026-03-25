import { Module } from '@nestjs/common';
import { createAiEngine } from './ai-engine.service';
import { createOllamaProvider } from './providers/ollama.provider';
import { createOpenAiProvider } from './providers/openai.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'AI_ENGINE',
      useFactory: createAiEngine,
      inject: ['OLLAMA_PROVIDER', 'OPENAI_PROVIDER'],
    },
    {
      provide: 'OLLAMA_PROVIDER',
      useFactory: createOllamaProvider,
    },
    {
      provide: 'OPENAI_PROVIDER',
      useFactory: createOpenAiProvider,
    },
  ],
  exports: ['AI_ENGINE'],
})
export class AiEngineModule {}
