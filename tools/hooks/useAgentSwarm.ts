import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface AgentStatus {
  agent: string;
  status: 'idle' | 'working' | 'thinking' | 'error';
  lastMessage?: string;
}

export const useAgentSwarm = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [agentsStatus, setAgentsStatus] = useState<Record<string, AgentStatus>>({});
  const [messages, setMessages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const newSocket = io(url);
    
    newSocket.on('connect', () => {
      console.log('Connected to Agent Swarm WebSocket');
    });

    newSocket.on('agent-event', (data: { agent: string; event: string; payload: any }) => {
      // Cập nhật trạng thái từng node (agent)
      setAgentsStatus(prev => ({
        ...prev,
        [data.agent]: {
          agent: data.agent,
          status: data.payload?.status || 'working',
          lastMessage: data.payload?.message,
        }
      }));

      if (data.payload?.message) {
        setMessages(prev => [...prev, `[${data.agent}]: ${data.payload.message}`]);
      }
    });

    newSocket.on('swarm-complete', () => {
      setIsProcessing(false);
      // Reset statuses to idle
      setAgentsStatus(prev => {
        const reset = { ...prev };
        Object.keys(reset).forEach(k => reset[k].status = 'idle');
        return reset;
      });
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  const startTask = useCallback((task: string) => {
    if (!socket) return;
    setIsProcessing(true);
    setMessages(prev => [...prev, `[User]: ${task}`]);
    socket.emit('start-swarm-task', { task });
  }, [socket]);

  return {
    startTask,
    agentsStatus,
    messages,
    isProcessing,
  };
};
