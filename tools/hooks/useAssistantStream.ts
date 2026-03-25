import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useAssistantStream = (url: string = 'http://localhost:3000') => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(url);

    socketRef.current.on('chat-chunk', (chunk: string) => {
      setResponse((prev: string) => prev + chunk);
    });

    socketRef.current.on('chat-error', (err: string) => {
      setError(err);
      setIsStreaming(false);
    });

    socketRef.current.on('chat-complete', () => {
      setIsStreaming(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url]);

  const ask = useCallback((prompt: string, provider: string = 'ollama') => {
    setResponse('');
    setError(null);
    setIsStreaming(true);
    socketRef.current?.emit('ask', { prompt, provider });
  }, []);

  return { ask, response, isStreaming, error };
};
