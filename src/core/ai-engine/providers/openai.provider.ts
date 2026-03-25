import { AiProvider, AiResponse } from '../interfaces/ai-provider.interface';
import OpenAI from 'openai';
import { Observable } from 'rxjs';
import { formatOpenAiChatMessages } from '../../common/utils/ai.utils';

export const createOpenAiProvider = (): AiProvider => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return {
    name: 'openai',

    generateResponse: async (prompt: string, options?: any): Promise<AiResponse> => {
      const model = options?.model || 'gpt-3.5-turbo';
      try {
        const completion = await client.chat.completions.create({
          messages: formatOpenAiChatMessages(prompt),
          model,
        });

        return {
          text: completion.choices[0].message.content ?? '',
          usage: completion.usage
            ? {
                promptTokens: completion.usage.prompt_tokens,
                completionTokens: completion.usage.completion_tokens,
                totalTokens: completion.usage.total_tokens,
              }
            : undefined,
        };
      } catch (error) {
        throw new Error(`OpenAI Error: ${error.message}`);
      }
    },

    generateStream: (prompt: string, options?: any): Observable<string> => {
      const model = options?.model || 'gpt-3.5-turbo';
      return new Observable((subscriber) => {
        client.chat.completions
          .create({
            messages: formatOpenAiChatMessages(prompt),
            model,
            stream: true,
          })
          .then(async (stream) => {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) subscriber.next(content);
            }
            subscriber.complete();
          })
          .catch((err) => subscriber.error(err));
      });
    },
  };
};

