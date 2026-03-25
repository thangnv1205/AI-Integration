import { Injectable, Inject } from '@nestjs/common';
import type { AiEngine } from '@core/ai-engine/ai-engine.service';
import type { VectorStore } from '@core/vector-store/vector-store.service';
import { buildAugmentedPrompt } from '@core/common/utils/ai.utils';

// Pure Functions — all actual logic is here, no class, no `this`

const ask = (aiEngine: AiEngine) => (prompt: string, provider = 'ollama') =>
  aiEngine.generateResponse(provider, prompt);

const askWithContext =
  (aiEngine: AiEngine, vectorStore: VectorStore) =>
  async (prompt: string, provider = 'ollama') => {
    const contextDocs = await vectorStore.search(prompt);
    const contextText = contextDocs.map((d) => d.text).join('\n---\n');
    return aiEngine.generateResponse(provider, buildAugmentedPrompt(contextText, prompt));
  };

const learn = (vectorStore: VectorStore) => (text: string, metadata: any = {}) =>
  vectorStore.addDocument(text, metadata);

const askStream = (aiEngine: AiEngine) => (prompt: string, provider = 'ollama') =>
  aiEngine.generateStream(provider, prompt);

const getProviders = (aiEngine: AiEngine) => () => aiEngine.getAvailableProviders();

// Thin class — only needed for NestJS DI, delegates everything to pure functions above
@Injectable()
export class AssistantService {
  readonly ask: ReturnType<typeof ask>;
  readonly askWithContext: ReturnType<typeof askWithContext>;
  readonly learn: ReturnType<typeof learn>;
  readonly askStream: ReturnType<typeof askStream>;
  readonly getProviders: ReturnType<typeof getProviders>;

  constructor(
    @Inject('AI_ENGINE') aiEngine: AiEngine,
    @Inject('VECTOR_STORE') vectorStore: VectorStore,
  ) {
    this.ask = ask(aiEngine);
    this.askWithContext = askWithContext(aiEngine, vectorStore);
    this.learn = learn(vectorStore);
    this.askStream = askStream(aiEngine);
    this.getProviders = getProviders(aiEngine);
  }
}
