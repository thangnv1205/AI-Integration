import { useState, useCallback } from 'react';

export interface ChatResponse {
  text: string;
  usage?: {
    totalTokens: number;
  };
}

export const useChat = (baseUrl: string = 'http://localhost:3000') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (prompt: string, provider: string = 'ollama'): Promise<ChatResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider }),
      });
      if (!response.ok) throw new Error('Failed to fetch AI response');
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [baseUrl]);

  const learn = useCallback(async (text: string, metadata: any = {}): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/assistant/learn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, metadata }),
      });
      setLoading(false);
      return response.ok;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [baseUrl]);

  return { ask, learn, loading, error };
};
