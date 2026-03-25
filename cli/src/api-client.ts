import axios from 'axios';
import { io, Socket } from 'socket.io-client';

export interface ChatResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Pure factory function — no class, no `this`
export const createApiClient = (baseUrl: string = 'http://localhost:3000') => {
  const ask = async (prompt: string, provider = 'ollama', model?: string): Promise<ChatResponse> => {
    const res = await axios.post(`${baseUrl}/assistant/ask`, { prompt, provider, model });
    return res.data;
  };

  const askWithContext = async (prompt: string, provider = 'ollama', model?: string): Promise<ChatResponse> => {
    const res = await axios.post(`${baseUrl}/assistant/ask-with-context`, { prompt, provider, model });
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
    model: string | undefined,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (err: string) => void,
  ): Socket => {
    const socket = io(baseUrl);

    socket.on('connect', () => {
      socket.emit('ask', { prompt, provider, model });
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

  const runSwarm = async (task: string): Promise<ChatResponse> => {
    const res = await axios.post(`${baseUrl}/assistant/swarm`, { task });
    return res.data;
  };

  const runSwarmStep = async (task: string): Promise<ChatResponse> => {
    const res = await axios.post(`${baseUrl}/assistant/swarm-step`, { task });
    return res.data;
  };

  const runSwarmNext = async (): Promise<ChatResponse> => {
    const res = await axios.post(`${baseUrl}/assistant/swarm-next`);
    return res.data;
  };

  const getSwarmRoles = async (): Promise<any[]> => {
    const res = await axios.get(`${baseUrl}/assistant/swarm-roles`);
    return res.data;
  };

  const updateSwarmRoleModel = async (roleId: string, model: string): Promise<{ success: boolean }> => {
    const res = await axios.post(`${baseUrl}/assistant/swarm-role-model`, { roleId, model });
    return res.data;
  };

  const listSwarms = async (): Promise<any[]> => {
    const res = await axios.get(`${baseUrl}/assistant/swarms`);
    return res.data;
  };

  const listCommandGroups = async (): Promise<any[]> => {
    const res = await axios.get(`${baseUrl}/assistant/command-groups`);
    return res.data;
  };

  const setSwarm = async (templateId: string): Promise<{ success: boolean }> => {
    const res = await axios.post(`${baseUrl}/assistant/swarm-set`, { templateId });
    return res.data;
  };

  return { 
    ask, askWithContext, learn, getProviders, streamAsk, 
    runSwarm, runSwarmStep, runSwarmNext, 
    getSwarmRoles, updateSwarmRoleModel,
    listSwarms, listCommandGroups, setSwarm 
  };
};
