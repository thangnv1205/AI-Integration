import { InternalServerErrorException } from '@nestjs/common';
import { AiProvider, AiResponse } from './interfaces/ai-provider.interface';
import { Observable } from 'rxjs';

export interface AiEngine {
  generateResponse(providerName: string, prompt: string, options?: any): Promise<AiResponse>;
  generateStream(providerName: string, prompt: string, options?: any): Observable<string>;
  getAvailableProviders(): string[];
}

export const createAiEngine = (
  ollamaProvider: AiProvider,
  openAiProvider: AiProvider,
): AiEngine => {
  const providers = new Map<string, AiProvider>();
  providers.set(ollamaProvider.name, ollamaProvider);
  providers.set(openAiProvider.name, openAiProvider);

  return {
    generateResponse: async (providerName: string, prompt: string, options?: any): Promise<AiResponse> => {
      const provider = providers.get(providerName);
      if (!provider) {
        throw new InternalServerErrorException(`Provider ${providerName} not found`);
      }
      return provider.generateResponse(prompt, options);
    },

    generateStream: (providerName: string, prompt: string, options?: any): Observable<string> => {
      const provider = providers.get(providerName);
      if (!provider) {
        throw new InternalServerErrorException(`Provider ${providerName} not found`);
      }
      return provider.generateStream(prompt, options);
    },

    getAvailableProviders: (): string[] => {
      return Array.from(providers.keys());
    },
  };
};

