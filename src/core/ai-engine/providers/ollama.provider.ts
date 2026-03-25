import { AiProvider, AiResponse } from '../interfaces/ai-provider.interface';
import axios from 'axios';
import { Observable } from 'rxjs';
import { parseOllamaChunk } from '../../common/utils/ai.utils';

export const createOllamaProvider = (): AiProvider => {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  return {
    name: 'ollama',

    generateResponse: async (prompt: string, options?: any): Promise<AiResponse> => {
      const model = options?.model || process.env.OLLAMA_MODEL || 'qwen2.5';
      try {
        const response = await axios.post(`${baseUrl}/api/generate`, {
          model,
          prompt,
          stream: false,
        });
        return {
          text: response.data.response,
          usage: {
            promptTokens: response.data.prompt_eval_count || 0,
            completionTokens: response.data.eval_count || 0,
            totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0),
          },
        };
      } catch (error) {
        throw new Error(`Ollama Error: ${error.message}`);
      }
    },

    generateStream: (prompt: string, options?: any): Observable<string> => {
      const model = options?.model || process.env.OLLAMA_MODEL || 'qwen2.5';
      return new Observable((subscriber) => {
        axios
          .post(`${baseUrl}/api/generate`, { model, prompt, stream: true }, { responseType: 'stream' })
          .then((response) => {
            response.data.on('data', (chunk: Buffer) => {
              const contents = parseOllamaChunk(chunk);
              contents.forEach((c: string) => subscriber.next(c));
              if (chunk.toString().includes('"done":true')) subscriber.complete();
            });
          })
          .catch((err) => subscriber.error(err));
      });
    },
  };
};
