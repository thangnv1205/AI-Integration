import axios from 'axios';
import { io, Socket } from 'socket.io-client';

export interface ChatResponse {
  text: string;
  usage?: { totalTokens: number };
}

// Pure factory function — no class, no `this`
export const createApiClient = (baseUrl: string = 'http://localhost:3000') => {
  const ask = async (prompt: string, provider = 'ollama'): Promise<ChatResponse> => {
    const res = await axios.post(`${baseUrl}/assistant/ask`, { prompt, provider });
    return res.data;
  };

  const askWithContext = async (prompt: string, provider = 'ollama'): Promise<ChatResponse> => {
    const res = await axios.post(`${baseUrl}/assistant/ask-with-context`, { prompt, provider });
    return res.data;
  };

  const learn = async (text: string, metadata: Record<string, any> = {}): Promise<void> => {
    await axios.post(`${baseUrl}/assistant/learn`, { text, metadata });
  };

  const getProviders = async (): Promise<string[]> => {
    const res = await axios.get(`${baseUrl}/assistant/providers`);
    return res.data;
  };

  const streamAsk = (
    prompt: string,
    provider = 'ollama',
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (err: string) => void,
  ): Socket => {
    const socket = io(baseUrl);

    socket.on('connect', () => {
      socket.emit('ask', { prompt, provider });
    });

    socket.on('chat-chunk', onChunk);
    socket.on('chat-complete', () => {
      onComplete();
      socket.disconnect();
    });
    socket.on('chat-error', (err: string) => {
      onError(err);
      socket.disconnect();
    });

    return socket;
  };

  return { ask, askWithContext, learn, getProviders, streamAsk };
};
